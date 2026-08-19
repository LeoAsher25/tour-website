import { requireAdmin } from "@/lib/admin/auth";
import { MediaAdminRepository } from "@/lib/admin/content";
import { publicUrlFor } from "@/lib/storage/url";
import { formatVnd } from "@/lib/pricing";
import { CopyUrlButton } from "@/components/admin/media-card";
import { MediaDeleteButton } from "@/components/admin/media-delete-button";
import { ImageIcon } from "lucide-react";

export const metadata = { title: "Media" };

export default async function AdminMediaPage() {
  await requireAdmin();
  const repo = new MediaAdminRepository();
  const items = await repo.list();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Media</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} file{items.length === 1 ? "" : "s"} — ảnh tải lên qua
          blog &amp; tour editors.
        </p>
      </div>

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-14 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 font-serif text-lg text-foreground">
            Chưa có file nào
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ảnh tải lên trong trình soạn thảo blog/tour sẽ xuất hiện ở đây.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <div
            key={m.id}
            className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
          >
            <div className="relative h-36 w-full overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicUrlFor(m.storageKey)}
                alt={m.alt ?? m.storageKey}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="space-y-1 p-3">
              <p
                className="truncate text-xs font-medium text-foreground"
                title={m.storageKey}
              >
                {m.storageKey.split("/").pop()}
              </p>
              <p className="truncate text-xs text-muted-foreground" title={m.storageKey}>
                {m.storageKey}
              </p>
              <p className="text-xs text-muted-foreground">
                {m.mimeType ?? "unknown"}
                {m.sizeBytes ? ` · ${formatVnd(m.sizeBytes)} B` : ""}
              </p>
              <div className="flex gap-2 pt-1">
                <CopyUrlButton storageKey={m.storageKey} />
                <MediaDeleteButton id={m.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
