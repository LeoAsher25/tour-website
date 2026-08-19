"use client";

import { useState } from "react";

import { publicUrlFor } from "@/lib/storage/url";

/** Client wrapper for the copy-URL action on media cards. */
export function CopyUrlButton({ storageKey }: { storageKey: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(publicUrlFor(storageKey)).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex h-7 flex-1 items-center justify-center rounded-md border border-border text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {copied ? "Đã copy!" : "Copy URL"}
    </button>
  );
}
