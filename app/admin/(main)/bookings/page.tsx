import Link from "next/link";

import { requireAdmin } from "@/lib/admin/auth";
import { getBookingList } from "@/lib/admin/bookings";
import { TourAdminRepository } from "@/lib/admin/tours";
import { formatVnd } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusVariant: Record<string, "default" | "solid" | "outline" | "accent"> = {
  pending: "default",
  awaiting_payment: "accent",
  confirmed: "solid",
  completed: "solid",
  cancelled: "outline",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    payment?: string;
    tourId?: string;
    page?: string;
  }>;
}) {
  await requireAdmin();
  const { q, status, payment, tourId, page } = await searchParams;

  const tourRepo = new TourAdminRepository();
  const tours = await tourRepo.listAll();

  const { rows, total } = await getBookingList({
    query: q,
    status: status as never,
    paymentStatus: payment as never,
    tourId,
    page: page ? Number(page) : 1,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} total</p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground shadow-sm transition-all hover:bg-accent-hover"
        >
          New booking
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Search</label>
          <Input
            name="q"
            defaultValue={q}
            placeholder="Code, name or phone…"
            className="mt-1 w-56"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="mt-1 h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="awaiting_payment">Awaiting payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Payment</label>
          <select
            name="payment"
            defaultValue={payment ?? ""}
            className="mt-1 h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Tour</label>
          <select
            name="tourId"
            defaultValue={tourId ?? ""}
            className="mt-1 h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">All</option>
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Tour</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
            {rows.map((b) => (
              <TableRow key={b.bookingCode}>
                <TableCell>
                  <Link
                    href={`/admin/bookings/${b.bookingCode}`}
                    className="font-mono text-sm font-medium text-primary hover:underline"
                  >
                    {b.bookingCode}
                  </Link>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{b.customer.fullName}</p>
                  <p className="text-xs text-muted-foreground">{b.customer.phone}</p>
                </TableCell>
                <TableCell className="max-w-[220px] truncate">{b.tourTitle}</TableCell>
                <TableCell>{b.departureDate.slice(0, 10)}</TableCell>
                <TableCell>{b.guestCount}</TableCell>
                <TableCell>{formatVnd(b.totalAmount)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[b.bookingStatus] ?? "default"}>
                    {b.bookingStatus.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={b.payment.status === "paid" ? "solid" : "default"}>
                    {b.payment.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
