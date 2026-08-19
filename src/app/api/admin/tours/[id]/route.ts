import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/admin/auth";
import { TourAdminRepository, tourInputSchema } from "@/lib/admin/tours";

export const runtime = "nodejs";

/** PUT /api/admin/tours/[id] — update a tour (admin only). */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = tourInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const repo = new TourAdminRepository();
    const tour = await repo.update(id, parsed.data);
    return NextResponse.json({ id: tour.id });
  } catch (err) {
    const msg = (err as Error).message ?? "Failed to update tour";
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return NextResponse.json(
        { error: "A tour with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** DELETE /api/admin/tours/[id] — delete a tour (super_admin/admin only). */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin || (admin.role !== "super_admin" && admin.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const repo = new TourAdminRepository();
    await repo.delete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Failed to delete tour" },
      { status: 500 }
    );
  }
}
