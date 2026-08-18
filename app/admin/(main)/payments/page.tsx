import Link from "next/link";

import { requireAdmin } from "@/lib/admin/auth";
import { PaymentRepository } from "@/lib/repositories/bookings";
import { formatVnd } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  processing: "accent",
  paid: "solid",
  failed: "outline",
  refunded: "outline",
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingCode?: string; status?: string; page?: string }>;
}) {
  await requireAdmin();
  const { bookingCode, status, page } = await searchParams;

  const repo = new PaymentRepository();
  const { rows, total } = await repo.list({
    bookingCode,
    status: status as never,
    limit: 20,
    offset: ((page ? Number(page) : 1) - 1) * 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          VNPay transaction attempts (audit trail). {total} total.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Booking code
          </label>
          <Input
            name="bookingCode"
            defaultValue={bookingCode}
            placeholder="JAS-XXXXXX"
            className="mt-1 w-44 font-mono"
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
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
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
              <TableHead>txnRef</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>VNPay code</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No payment attempts found.
                </TableCell>
              </TableRow>
            )}
            {rows.map((p) => (
              <TableRow key={p.txnRef}>
                <TableCell className="font-mono text-sm">{p.txnRef}</TableCell>
                <TableCell>
                  <Link
                    href={`/admin/bookings/${p.bookingCode}`}
                    className="font-mono text-sm text-primary hover:underline"
                  >
                    {p.bookingCode}
                  </Link>
                </TableCell>
                <TableCell>{formatVnd(p.amount)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[p.status] ?? "default"}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {p.vnpayResponseCode ?? "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(p.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
