import { requireAdmin } from "@/lib/admin/auth";
import { TourAdminRepository } from "@/lib/admin/tours";
import { ManualBookingForm } from "@/components/admin/manual-booking-form";

export const metadata = { title: "New Booking" };

export default async function AdminNewBookingPage() {
  await requireAdmin();
  const repo = new TourAdminRepository();
  const tours = await repo.listAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">New booking</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manually create a booking for phone/Zalo customers. Pricing is
          derived server-side.
        </p>
      </div>
      <ManualBookingForm tours={tours} />
    </div>
  );
}
