import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/admin/auth";
import { MediaAdminRepository } from "@/lib/admin/content";

export const runtime = "nodejs";

/** DELETE /api/admin/media/[id] — delete a media row + storage object. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const repo = new MediaAdminRepository();
  const result = await repo.delete(id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
