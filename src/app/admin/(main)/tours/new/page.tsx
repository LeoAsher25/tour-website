import { requireAdmin } from "@/lib/admin/auth";
import { TourAdminRepository } from "@/lib/admin/tours";
import { TourEditor } from "@/components/admin/tour-editor";

export const metadata = { title: "New Tour" };

export default async function AdminTourNewPage() {
  await requireAdmin();

  const repo = new TourAdminRepository();
  const destinations = await repo.listDestinations();

  return <TourEditor tour={null} destinations={destinations} />;
}
