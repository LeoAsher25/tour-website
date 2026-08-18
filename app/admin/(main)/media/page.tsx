import { requireAdmin } from "@/lib/admin/auth";
import { MediaAdminRepository } from "@/lib/admin/content";
import { publicUrlFor } from "@/lib/storage/media";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/pricing";

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
          Files uploaded to the media bucket (blog covers, inline images, tour
          photos).
        </p>
      </div>

      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          No media yet. Upload via the blog or tour editors.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <div
            key={m.id}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicUrlFor(m.storageKey)}
              alt={m.alt ?? m.storageKey}
              className="h-32 w-full object-cover"
            />
            <div className="space-y-1 p-3">
              <p className="truncate text-xs font-medium text-foreground" title={m.storageKey}>
                {m.storageKey.split("/").pop()}
              </p>
              <p className="text-xs text-muted-foreground">
                {m.mimeType ?? "unknown"} ·{" "}
                {m.sizeBytes ? formatVnd(m.sizeBytes) : ""} B
              </p>
              <form
                action={async () => {
                  "use server";
                  await repo.delete(m.id);
                }}
              >
                <Button type="submit" variant="ghost" size="sm" className="w-full text-destructive">
                  Delete
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
