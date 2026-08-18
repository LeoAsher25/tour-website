import type {
  AddOn,
  BookingSelectionInput,
  Money,
  PriceBreakdown,
  PriceLineItem,
  PromoCode,
  SiteSettings,
  Tour,
  TourVariant,
} from "@/types/domain";

export interface PricingContext {
  tour: Tour;
  variant: TourVariant;
  addOns: AddOn[];
  promo?: PromoCode | null;
  settings: SiteSettings;
}

export class PricingError extends Error {}

// VND integer rounding helper.
function vnd(n: number): Money {
  return Math.round(n);
}

function computePercent(base: Money, percent: number): Money {
  return vnd((base * percent) / 100);
}

/**
 * Single source of truth for pricing. Callers pass DB-resolved entities only —
 * never client-supplied prices. Guest count and selection ids come from the
 * client, everything monetary is derived here.
 */
export function calculatePrice(
  input: BookingSelectionInput,
  ctx: PricingContext
): PriceBreakdown {
  const { variant, addOns, promo, settings } = ctx;
  const guests = Math.max(1, Math.floor(input.guestCount));

  const lineItems: PriceLineItem[] = [];

  // Base price: per-person multiplies by guests; per-group is flat.
  let base: Money;
  if (variant.priceType === "per_person") {
    base = variant.basePrice * guests;
    lineItems.push({
      label: `${variant.name} × ${guests} ${guests === 1 ? "guest" : "guests"}`,
      amount: base,
      meta: `${formatVnd(variant.basePrice)} / person`,
    });
  } else {
    base = variant.basePrice;
    lineItems.push({
      label: `${variant.name} (group price)`,
      amount: base,
      meta: `up to ${variant.maxGroupSize ?? guests} guests`,
    });
  }

  // Add-ons.
  let addOnTotal: Money = 0;
  for (const id of input.addOnIds) {
    const addOn = addOns.find((a) => a.id === id);
    if (!addOn) continue;
    const amount = addOn.perPerson ? addOn.price * guests : addOn.price;
    addOnTotal += amount;
    lineItems.push({
      label: addOn.name,
      amount,
      meta: addOn.perPerson ? `${formatVnd(addOn.price)} / person` : undefined,
    });
  }

  const subtotal: Money = base + addOnTotal;

  // Promo discount, validated against subtotal.
  let discount: Money = 0;
  if (promo && isPromoApplicable(promo, subtotal)) {
    discount =
      promo.discountType === "percent"
        ? computePercent(subtotal, promo.discountValue)
        : Math.min(promo.discountValue, subtotal);
  }

  const taxable = subtotal - discount;
  const vat = computePercent(taxable, settings.vatPercent);

  // Card fee applies to the taxable + vat amount when paying by card.
  const preFee = taxable + vat;
  const cardFee = input.payByCard
    ? computePercent(preFee, settings.cardFeePercent)
    : 0;

  const total: Money = preFee + cardFee;

  const depositDue = computePercent(total, settings.depositPercent);
  const amountToPayNow = input.paymentPlan === "deposit" ? depositDue : total;
  const remaining = total - amountToPayNow;

  return {
    lineItems,
    subtotal,
    discount,
    vat,
    cardFee,
    total,
    depositDue,
    remaining,
    amountToPayNow,
    currency: "VND",
  };
}

export function isPromoApplicable(promo: PromoCode, subtotal: Money): boolean {
  if (!promo.active) return false;
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return false;
  if (
    promo.maxRedemptions !== undefined &&
    promo.redemptions >= promo.maxRedemptions
  ) {
    return false;
  }
  if (promo.minSubtotal !== undefined && subtotal < promo.minSubtotal) {
    return false;
  }
  return true;
}

export function formatVnd(amount: Money): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}
