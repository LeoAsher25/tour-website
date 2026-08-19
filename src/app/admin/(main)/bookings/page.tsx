import Link from "next/link";

import { requireAdmin } from "@/lib/admin/auth";
import { getBookingList } from "@/lib/admin/bookings";
import { TourAdminRepository } from "@/lib/admin/tours";
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
import { CreateButton } from "@/components/admin/page-header";
import {
  bookingStatusTone,
  paymentStatusTone,
  StatusBadge,
  statusLabel,
} from "@/components/admin/status-badge";

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
  const tours = await tourRepo.listLight();

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
          <p className="mt-1 text-sm text-muted-foreground">
            {total} booking{total === 1 ? "" : "s"}
          </p>
        </div>
        <CreateButton href="/admin/bookings/new">Booking mới</CreateButton>
      </div>

      <FilterBar>
        <FilterSearch
          name="q"
          defaultValue={q}
          placeholder="Tìm theo code, tên, số điện thoại…"
        />
        <FilterSelect
          name="status"
          defaultValue={status ?? ""}
          label="Trạng thái"
          options={[
            { value: "", label: "Tất cả" },
            { value: "pending", label: "Pending" },
            { value: "awaiting_payment", label: "Awaiting payment" },
            { value: "confirmed", label: "Confirmed" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
        <FilterSelect
          name="payment"
          defaultValue={payment ?? ""}
          label="Thanh toán"
          options={[
            { value: "", label: "Tất cả" },
            { value: "pending", label: "Pending" },
            { value: "processing", label: "Processing" },
            { value: "paid", label: "Paid" },
            { value: "failed", label: "Failed" },
            { value: "refunded", label: "Refunded" },
          ]}
        />
        <FilterSelect
          name="tourId"
          defaultValue={tourId ?? ""}
          label="Tour"
          options={[
            { value: "", label: "Tất cả" },
            ...tours.map((t) => ({ value: t.id, label: t.title })),
          ]}
        />
        <FilterSubmit />
        {(q || status || payment || tourId) && (
          <ClearFilters href="/admin/bookings" />
        )}
      </FilterBar>

      <DataTableCard>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Code</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Tour</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Khách</TableHead>
              <TableHead>Tổng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thanh toán</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <EmptyState
                colSpan={8}
                title="Không có booking nào"
                description="Thử thay đổi bộ lọc hoặc tạo booking mới."
              />
            )}
            {rows.map((b) => (
              <TableRow
                key={b.bookingCode}
                className="transition-colors hover:bg-muted/40"
              >
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
                <TableCell className="whitespace-nowrap">
                  {formatVnd(b.totalAmount)}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    tone={bookingStatusTone(b.bookingStatus)}
                    dot
                  >
                    {statusLabel(b.bookingStatus)}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <StatusBadge tone={paymentStatusTone(b.payment.status)}>
                    {statusLabel(b.payment.status)}
                  </StatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableCard>
    </div>
  );
}
