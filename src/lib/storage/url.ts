/**
 * Pure URL helpers — no server-only imports, safe for client components.
 * (MediaStorage is server-only because it talks to Supabase Storage.)
 */

export const MEDIA_BUCKET = "media";

/** Derive the public URL for a storage key (no network call). */
export function publicUrlFor(key: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const base = url.replace(/\/$/, "");
  // encodeURIComponent per segment so spaces/special chars are safe
  const encoded = key
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}

/** Extract the storage key from a public URL (round-trip for legacy data). */
export function keyFromPublicUrl(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl
    .slice(idx + marker.length)
    .split("/")
    .map((s) => decodeURIComponent(s))
    .join("/");
}
