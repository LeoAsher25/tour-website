import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { deleteMedia } from "./media";
import type { TiptapDoc } from "@/types/domain";

/**
 * Helpers for tracking storage keys referenced by tours/blogs.
 * storageKey columns are plain text (no FK to `media`), so deletes must
 * explicitly collect keys first, then remove objects from Storage.
 */

/** Collect all storage keys referenced by a tour (hero + gallery images). */
export async function collectTourKeys(tourId: string): Promise<string[]> {
  const rows = (await db.execute(sql`
    select hero_image_key as key from tours where id = ${tourId} and hero_image_key is not null
    union
    select storage_key as key from tour_images where tour_id = ${tourId}
  `)) as unknown as { key: string }[];
  return rows.map((r) => r.key).filter((k): k is string => Boolean(k));
}

/** Collect all storage keys referenced by a blog (cover + inline images). */
export async function collectBlogKeys(blogId: string): Promise<string[]> {
  const rows = (await db.execute(sql`
    select cover_image_key as key from blogs where id = ${blogId} and cover_image_key is not null
  `)) as unknown as { key: string }[];
  const keys: string[] = rows.map((r) => r.key).filter((k): k is string => Boolean(k));

  // Inline images inside content_json (Tiptap image nodes store storageKey).
  const blogs = (await db.execute(sql`
    select content_json from blogs where id = ${blogId}
  `)) as unknown as { content_json: TiptapDoc }[];
  const doc = blogs[0]?.content_json;
  if (doc) keys.push(...collectImageKeysFromTiptap(doc));

  return [...new Set(keys)];
}

/** Extract image storage keys from a Tiptap doc (attrs.storageKey). */
export function collectImageKeysFromTiptap(doc: TiptapDoc | null): string[] {
  if (!doc || !Array.isArray(doc.content)) return [];
  const keys: string[] = [];
  const walk = (nodes: TiptapDoc["content"]) => {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      if (node.type === "image") {
        const key = node.attrs?.storageKey;
        if (typeof key === "string" && key) keys.push(key);
      }
      if (Array.isArray(node.content)) walk(node.content);
    }
  };
  walk(doc.content);
  return keys;
}

/** Check which of the given keys are still referenced anywhere. */
export async function findReferencingEntities(
  keys: string[]
): Promise<Record<string, string[]>> {
  if (keys.length === 0) return {};
  const uniq = [...new Set(keys)];
  const refs: Record<string, string[]> = {};

  // Load all blog content once (inline-image scan across posts).
  const allBlogs = (await db.execute(sql`
    select title, content_json from blogs
  `)) as unknown as { title: string; content_json: TiptapDoc }[];

  for (const key of uniq) {
    const refsForKey: string[] = [];

    const tours = await db.execute(
      sql`select title from tours where hero_image_key = ${key}`
    );
    if (tours[0]) refsForKey.push(`Tour: ${tours[0].title as string}`);

    const tourImages = await db.execute(
      sql`select t.title from tour_images ti join tours t on t.id = ti.tour_id where ti.storage_key = ${key}`
    );
    if (tourImages[0]) refsForKey.push(`Tour ảnh: ${tourImages[0].title as string}`);

    const dests = await db.execute(
      sql`select name from destinations where hero_image_key = ${key}`
    );
    if (dests[0]) refsForKey.push(`Destination: ${dests[0].name as string}`);

    const blogCovers = await db.execute(
      sql`select title from blogs where cover_image_key = ${key}`
    );
    if (blogCovers[0]) refsForKey.push(`Blog: ${blogCovers[0].title as string}`);

    for (const b of allBlogs) {
      if (collectImageKeysFromTiptap(b.content_json).includes(key)) {
        refsForKey.push(`Blog nội dung: ${b.title}`);
      }
    }

    if (refsForKey.length > 0) refs[key] = refsForKey;
  }

  return refs;
}

/** Delete objects from Storage (best-effort — never throws). */
export async function removeStorageKeys(keys: string[]): Promise<void> {
  const uniq = [...new Set(keys)].filter(Boolean);
  if (uniq.length === 0) return;
  await Promise.all(
    uniq.map((key) => deleteMedia(key).catch(() => {}))
  );
}

/**
 * Remove storage objects whose keys are no longer referenced after a replace
 * (e.g. tour gallery edited, blog cover changed). `removedKeys` = keys the
 * entity USED to reference but no longer does.
 */
export async function removeOrphanedKeys(removedKeys: string[]): Promise<void> {
  if (removedKeys.length === 0) return;
  const refs = await findReferencingEntities(removedKeys);
  const orphans = removedKeys.filter((k) => !refs[k] || refs[k].length === 0);
  await removeStorageKeys(orphans);
}
