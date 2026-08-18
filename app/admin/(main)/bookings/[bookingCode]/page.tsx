import { notFound } from "next/navigation";
import Link from "next/link";

import { requireAdmin } from "@/lib/admin/auth";
import {
  confirmPayment,
  getBookingDetail,
  setBookingStatus,
  updateInternalNotes,
} from "@/lib/admin/bookings";
import { formatVnd } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ bookingCode: string }>;
}) {
  await requireAdmin();
  const { bookingCode } = await params;
  const booking = await getBookingDetail(bookingCode.toUpperCase());
  if (!booking) notFound();

  const statusVariant: Record<string, "default" | "solid" | "outline" | "accent"> = {
    pending: "default",
    awaiting_payment: "accent",
    confirmed: "solid",
    completed: "solid",
    cancelled: "outline",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/bookings"
            className="text-sm text-muted-foreground hover:text-accent"
          >
            ← All bookings
          </Link>
          <h1 className="mt-1 font-mono text-2xl text-foreground">
            {booking.bookingCode}
          </h1>
          <div className="mt-2 flex gap-2">
            <Badge variant={statusVariant[booking.bookingStatus] ?? "default"}>
              {booking.bookingStatus.replace("_", " ")}
            </Badge>
            <Badge variant={booking.payment.status === "paid" ? "solid" : "default"}>
              {booking.payment.status}
            </Badge>
            <Badge variant="accent">{booking.payment.method}</Badge>
          </div>
        </div>
        <Link href={`/booking/${booking.bookingCode}`} target="_blank">
          <Button variant="outline">View public booking page</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row k="Name" v={booking.customer.fullName} />
            <Row k="Phone" v={booking.customer.phone} />
            {booking.customer.email && <Row k="Email" v={booking.customer.email} />}
            {booking.customer.zaloPhone && (
              <Row k="Zalo" v={booking.customer.zaloPhone} />
            )}
            {booking.customer.nationality && (
              <Row k="Nationality" v={booking.customer.nationality} />
            )}
            {booking.customer.note && <Row k="Note" v={booking.customer.note} />}
          </CardContent>
        </Card>

        {/* Tour + price */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row k="Tour" v={booking.tourTitle} />
            <Row k="Variant" v={booking.variant} />
            <Row k="Departure" v={booking.departureDate.slice(0, 10)} />
            <Row k="Guests" v={String(booking.guestCount)} />
            <Row k="Payment plan" v={booking.paymentPlan} />
            <div className="border-t border-border pt-2">
              <Row k="Subtotal" v={formatVnd(booking.subtotal)} />
              {booking.discount > 0 && (
                <Row k="Discount" v={`-${formatVnd(booking.discount)}`} />
              )}
              <Row k="VAT" v={formatVnd(booking.vat)} />
              {booking.cardFee > 0 && <Row k="Card fee" v={formatVnd(booking.cardFee)} />}
              <Row k="Total" v={formatVnd(booking.totalAmount)} bold />
              <Row k="Due now" v={formatVnd(booking.amountToPayNow)} bold />
            </div>
          </CardContent>
        </Card>

        {/* Add-ons */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Add-ons</CardTitle>
          </CardHeader>
          <CardContent>
            {booking.addOns.length === 0 && (
              <p className="text-sm text-muted-foreground">None</p>
            )}
            {booking.addOns.map((a, i) => (
              <div key={i} className="flex justify-between py-1 text-sm">
                <span>{a.name}</span>
                <span className="text-muted-foreground">{formatVnd(a.price)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payments / VNPay */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row k="Method" v={booking.payment.method} />
            <Row k="Status" v={booking.payment.status} />
            {booking.payment.vnpayTxnRef && (
              <Row k="VNPay txnRef" v={booking.payment.vnpayTxnRef} />
            )}
            {booking.payment.vnpayTransactionNo && (
              <Row k="VNPay trans no" v={booking.payment.vnpayTransactionNo} />
            )}
            {booking.payment.vnpayResponseCode && (
              <Row k="VNPay code" v={booking.payment.vnpayResponseCode} />
            )}
            {booking.payment.paidAt && (
              <Row k="Paid at" v={new Date(booking.payment.paidAt).toLocaleString()} />
            )}
            {booking.payment.status !== "paid" && (
              <form
                action={async () => {
                  "use server";
                  await confirmPayment(booking.bookingCode);
                }}
                className="pt-2"
              >
                <Button type="submit" variant="outline" size="sm">
                  Confirm payment manually
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status transitions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Status transitions</CardTitle>
        </CardHeader>
        <CardContent>
          {booking.bookingStatus === "cancelled" && (
            <p className="text-sm text-muted-foreground">
              This booking is cancelled. You can reopen it to pending.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {booking.bookingStatus !== "confirmed" && booking.bookingStatus !== "completed" && booking.bookingStatus !== "cancelled" && (
              <form
                action={async () => {
                  "use server";
                  await setBookingStatus(booking.bookingCode, "confirmed");
                }}
              >
                <Button type="submit" size="sm">Confirm</Button>
              </form>
            )}
            {booking.bookingStatus === "confirmed" && (
              <form
                action={async () => {
                  "use server";
                  await setBookingStatus(booking.bookingCode, "completed");
                }}
              >
                <Button type="submit" size="sm">Mark completed</Button>
              </form>
            )}
            {booking.bookingStatus !== "cancelled" && booking.bookingStatus !== "completed" && (
              <form
                action={async () => {
                  "use server";
                  await setBookingStatus(booking.bookingCode, "cancelled", {
                    restoreCapacity: true,
                  });
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Cancel (restore capacity)
                </Button>
              </form>
            )}
            {booking.bookingStatus === "cancelled" && (
              <form
                action={async () => {
                  "use server";
                  await setBookingStatus(booking.bookingCode, "pending");
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Reopen
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Internal notes */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Internal notes</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              await updateInternalNotes(
                booking.bookingCode,
                String(formData.get("notes") ?? "")
              );
            }}
            className="space-y-3"
          >
            <Textarea
              name="notes"
              defaultValue={booking.internalNotes ?? ""}
              rows={4}
              placeholder="Private notes for the team…"
            />
            <Button type="submit" variant="outline" size="sm">
              Save notes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  k,
  v,
  bold,
}: {
  k: string;
  v: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className={bold ? "font-semibold text-foreground" : "text-foreground"}>
        {v}
      </span>
    </div>
  );
}
