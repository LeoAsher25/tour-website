"use server";

import { revalidatePath } from "next/cache";
import { TourAdminRepository } from "./tours";

/**
 * Server actions for admin tour list (module-level so they can be referenced
 * from `<form action={...}>` without capturing class instances).
 */

export async function duplicateTour(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await new TourAdminRepository().duplicate(id);
  revalidatePath("/admin/tours");
}
