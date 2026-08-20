import { Link } from "@/i18n/navigation";

import { requireAdmin } from "@/lib/admin/auth";
import { PaymentRepository } from "@/lib/repositories/bookings";
import { formatVnd } from "@/lib/pricing";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClearFilters,
  DataTableCard,
  EmptyState,
  FilterBar,
  FilterSearch,
  FilterSelect,
  FilterSubmit,
} from "@/components/admin/data-table";
import {
  paymentStatusTone,
  StatusBadge,
  statusLabel,
} from "@/components/admin/status-badge";

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

      <FilterBar>
        <FilterSearch
          name="bookingCode"
          defaultValue={bookingCode}
          placeholder="Tìm theo booking code…"
          className="max-w-xs font-mono"
        />
        <FilterSelect
          name="status"
          defaultValue={status ?? ""}
          label="Trạng thái"
          options={[
            { value: "", label: "Tất cả" },
            { value: "pending", label: "Pending" },
            { value: "processing", label: "Processing" },
            { value: "paid", label: "Paid" },
            { value: "failed", label: "Failed" },
            { value: "refunded", label: "Refunded" },
          ]}
        />
        <FilterSubmit />
        {(bookingCode || status) && <ClearFilters href="/admin/payments" />}
      </FilterBar>

      <DataTableCard>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>txnRef</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>VNPay code</TableHead>
              <TableHead>Ngày</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <EmptyState
                colSpan={6}
                title="Chưa có giao dịch thanh toán"
                description="Các lần thanh toán VNPay sẽ xuất hiện ở đây."
              />
            )}
            {rows.map((p) => (
              <TableRow
                key={p.txnRef}
                className="transition-colors hover:bg-muted/40"
              >
                <TableCell className="font-mono text-sm">{p.txnRef}</TableCell>
                <TableCell>
                  <Link
                    href={`/admin/bookings/${p.bookingCode}`}
                    className="font-mono text-sm text-primary hover:underline"
                  >
                    {p.bookingCode}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatVnd(p.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={paymentStatusTone(p.status)} dot>
                    {statusLabel(p.status)}
                  </StatusBadge>
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
      </DataTableCard>
    </div>
  );
}
