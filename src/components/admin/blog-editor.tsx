"use client";

import { RichTextEditor, type RichTextEditorProps } from "@/components/editor/rich-text-editor";

/**
 * Blog editor — thin wrapper around the shared `RichTextEditor` so existing
 * imports keep working. Defaults to the blog preset (heading 1–4, image
 * upload, 420px min-height).
 */
export function BlogEditor(props: RichTextEditorProps) {
  return <RichTextEditor {...props} />;
}
