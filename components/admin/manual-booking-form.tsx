"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { manualCreateBooking } from "@/lib/admin/bookings";
import type { Tour } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatVnd } from "@/lib/pricing";

export function ManualBookingForm({ tours }: { tours: Tour[] }) {
  const router = useRouter();
  const [tourId, setTourId] = useState(tours[0]?.id ?? "");
  const [variantId, setVariantId] = useState(tours[0]?.variants[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [paymentPlan, setPaymentPlan] = useState<"deposit" | "full">("full");
  const [payByCard, setPayByCard] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"vnpay" | "zalo_manual">(
    "zalo_manual"
  );
  const [customer, setCustomer] = useState({
    fullName: "",
    phone: "",
    email: "",
    zaloPhone: "",
    nationality: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tour = tours.find((t) => t.id === tourId);
  const variant = tour?.variants.find((v) => v.id === variantId);

  const quote = useMemo(() => {
    if (!tour || !variant) return null;
    const base =
      variant.priceType === "per_person"
        ? variant.basePrice * guestCount
        : variant.basePrice;
    const addOnTotal = tour.addOns
      .filter((a) => addOnIds.includes(a.id))
      .reduce((sum, a) => sum + (a.perPerson ? a.price * guestCount : a.price), 0);
    return { base: base + addOnTotal, lineItems: base + addOnTotal };
  }, [tour, variant, guestCount, addOnIds]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const res = await manualCreateBooking({
      tourId,
      variantId,
      startDate,
      guestCount,
      addOnIds,
      paymentMethod,
      paymentPlan,
      payByCard,
      customer,
    });

    if ("error" in res && res.error) {
      setError(res.error);
      setSubmitting(false);
      return;
    }
    if ("bookingCode" in res && res.bookingCode) {
      setSuccess(`Booking created: ${res.bookingCode}`);
      setSubmitting(false);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
          {success}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Booking details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tour</Label>
            <Select
              value={tourId}
              onValueChange={(v) => {
                const t = tours.find((x) => x.id === v);
                setTourId(v ?? "");
                setVariantId(t?.variants[0]?.id ?? "");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tour" />
              </SelectTrigger>
              <SelectContent>
                {tours.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Variant</Label>
            <Select value={variantId} onValueChange={(v) => setVariantId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent>
                {tour?.variants.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} — {formatVnd(v.basePrice)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Departure date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Guests</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Payment method</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) =>
                setPaymentMethod((v ?? "zalo_manual") as "vnpay" | "zalo_manual")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zalo_manual">Zalo / manual</SelectItem>
                <SelectItem value="vnpay">VNPay</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment plan</Label>
            <Select
              value={paymentPlan}
              onValueChange={(v) => setPaymentPlan((v ?? "full") as "deposit" | "full")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full amount</SelectItem>
                <SelectItem value="deposit">Deposit (30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Checkbox
              checked={payByCard}
              onCheckedChange={(v) => setPayByCard(Boolean(v))}
              id="payByCard"
            />
            <Label htmlFor="payByCard">Pay by card (+4% fee)</Label>
          </div>
        </CardContent>
      </Card>

      {tour && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Add-ons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tour.addOns.length === 0 && (
              <p className="text-sm text-muted-foreground">No add-ons for this tour.</p>
            )}
            {tour.addOns.map((a) => (
              <label key={a.id} className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={addOnIds.includes(a.id)}
                  onCheckedChange={(v) => {
                    setAddOnIds((prev) =>
                      v ? [...prev, a.id] : prev.filter((x) => x !== a.id)
                    );
                  }}
                />
                <span className="flex-1">{a.name}</span>
                <span className="text-muted-foreground">
                  {a.perPerson ? `${formatVnd(a.price)} / person` : formatVnd(a.price)}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Customer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Full name *</Label>
            <Input
              value={customer.fullName}
              onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Zalo phone</Label>
            <Input
              value={customer.zaloPhone}
              onChange={(e) => setCustomer({ ...customer, zaloPhone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Nationality</Label>
            <Input
              value={customer.nationality}
              onChange={(e) => setCustomer({ ...customer, nationality: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Note</Label>
            <Textarea
              value={customer.note}
              onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {quote && (
        <p className="text-sm text-muted-foreground">
          Estimated base (before VAT/fees, server will recalculate):{" "}
          <span className="font-medium text-foreground">
            {formatVnd(quote.base)}
          </span>
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create booking"}
        </Button>
      </div>
    </form>
  );
}
