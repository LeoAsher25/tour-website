import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/admin/auth";
import { TourAdminRepository } from "@/lib/admin/tours";
import { TourEditor } from "@/components/admin/tour-editor";

export const metadata = { title: "Edit Tour" };

export default async function AdminTourEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const repo = new TourAdminRepository();
  const tour = await repo.getById(id);
  if (!tour) notFound();
  const destinations = await repo.listDestinations();

  return <TourEditor tour={tour} destinations={destinations} />;
}
