import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { getCurrentAdmin } from "@/lib/admin/auth";
import { uploadMedia, MediaError } from "@/lib/storage/media";
import { MediaAdminRepository } from "@/lib/admin/content";

export const runtime = "nodejs";

/** Maximum upload size (matches MediaStorage): 10 MB. */
const MAX_SIZE = 10 * 1024 * 1024;

/**
 * POST /api/admin/media — upload an image to the media bucket.
 * Multipart form: field `file`. Returns { key, publicUrl }.
 * The admin client uses this for blog cover + inline images.
 * Uploads are recorded in the `media` table so the Media page lists them.
 */
export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File exceeds 10 MB limit" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const folder = form?.get("folder")
    ? String(form.get("folder")).replace(/[^a-z0-9/-]/g, "")
    : "blogs";
  const key = `${folder}/${randomUUID()}.${ext || "webp"}`;

  try {
    const result = await uploadMedia({
      key,
      buffer,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    });

    // Record in media table (best-effort — storage success is primary).
    await new MediaAdminRepository()
      .recordUpload({
        storageKey: key,
        mimeType: file.type || undefined,
        sizeBytes: file.size,
        alt: file.name,
        uploadedBy: admin.id,
      })
      .catch(() => {});

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof MediaError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: (err as Error).message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
