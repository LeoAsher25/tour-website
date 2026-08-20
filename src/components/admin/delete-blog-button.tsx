"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

/** Delete a blog post with a confirm step. Calls the existing admin API. */
export function DeleteBlogButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error ?? "Failed to delete");
        return;
      }
      router.refresh();
    } catch (err) {
      alert((err as Error).message ?? "Failed to delete");
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      title="Delete post"
      aria-label="Delete post"
      onBlur={() => setTimeout(() => setConfirming(false), 200)}
      className={
        confirming
          ? "inline-flex h-8 items-center rounded-md bg-destructive px-3 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          : "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      }
    >
      {confirming ? "Confirm" : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
