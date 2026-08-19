"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/** Delete button with confirmation + in-use guard (client). */
export function MediaDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setError(null);
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Không thể xoá file");
      return;
    }
    setOpen(false);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger className="inline-flex h-7 items-center justify-center rounded-md px-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10">
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Xoá
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá file này?</AlertDialogTitle>
            <AlertDialogDescription>
              File sẽ bị xoá vĩnh viễn khỏi hệ thống. Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={pending}
              className="bg-destructive text-white hover:bg-destructive/90">
              {pending ? "Đang xoá…" : "Xoá"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
