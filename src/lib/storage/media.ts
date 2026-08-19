import "server-only";

import { getAdminClient } from "@/lib/supabase/admin";
import { MEDIA_BUCKET, publicUrlFor } from "./url";

export { MEDIA_BUCKET, publicUrlFor, keyFromPublicUrl } from "./url";

/**
 * Supabase Storage media service.
 *
 * Object layout under the public `media` bucket:
 *   media/tours/<tour-slug>/...
 *   media/blogs/<blog-slug>/...
 *   media/destinations/...
 *   media/reviews/...
 *
 * Rules:
 * - DB stores object keys (never full URLs). Public URLs are derived here.
 * - MIME + size validation happens server-side on upload.
 * - Never store images as Base64 in Postgres.
 */

export interface UploadInput {
  /** e.g. "tours/ha-giang-loop-3d2n/hero.webp" */
  key: string;
  buffer: Buffer | Uint8Array | ArrayBuffer;
  mimeType: string;
  sizeBytes: number;
  upsert?: boolean;
}

export interface UploadResult {
  key: string;
  publicUrl: string;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "application/pdf",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export class MediaError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_MIME"
      | "FILE_TOO_LARGE"
      | "INVALID_KEY"
      | "UPLOAD_FAILED"
      | "DELETE_FAILED"
      | "BUCKET_MISSING"
  ) {
    super(message);
    this.name = "MediaError";
  }
}

function assertValidKey(key: string): void {
  if (
    !key ||
    key.length > 500 ||
    key.includes("..") ||
    key.startsWith("/") ||
    key.startsWith("\\")
  ) {
    throw new MediaError("Invalid storage key", "INVALID_KEY");
  }
}

export async function ensureMediaBucket(): Promise<void> {
  const sb = getAdminClient();
  const { data: buckets } = await sb.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === MEDIA_BUCKET);
  if (!exists) {
    const { error } = await sb.storage.createBucket(MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE_BYTES,
      allowedMimeTypes: [...ALLOWED_MIME_TYPES],
    });
    if (error) {
      throw new MediaError(
        `Failed to create media bucket: ${error.message}`,
        "BUCKET_MISSING"
      );
    }
  }
}

export async function uploadMedia(input: UploadInput): Promise<UploadResult> {
  assertValidKey(input.key);

  if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
    throw new MediaError(
      `Unsupported file type: ${input.mimeType}`,
      "INVALID_MIME"
    );
  }
  if (input.sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new MediaError(
      `File exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB limit`,
      "FILE_TOO_LARGE"
    );
  }

  await ensureMediaBucket();

  const sb = getAdminClient();
  const { error } = await sb.storage
    .from(MEDIA_BUCKET)
    .upload(input.key, input.buffer, {
      contentType: input.mimeType,
      upsert: input.upsert ?? false,
      cacheControl: "31536000",
    });

  if (error) {
    throw new MediaError(`Upload failed: ${error.message}`, "UPLOAD_FAILED");
  }

  return { key: input.key, publicUrl: publicUrlFor(input.key) };
}

export async function deleteMedia(key: string): Promise<void> {
  assertValidKey(key);
  const sb = getAdminClient();
  const { error } = await sb.storage.from(MEDIA_BUCKET).remove([key]);
  if (error) {
    throw new MediaError(`Delete failed: ${error.message}`, "DELETE_FAILED");
  }
}
