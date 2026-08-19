"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { StorageImage } from "./storage-image";
import {
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { TiptapDoc } from "@/types/domain";

/**
 * Tiptap rich-text editor (client). Emits the canonical Tiptap JSON doc.
 * Image nodes carry `storageKey` (never base64). Extensible: add custom
 * extensions (e.g. `tourCta`) via `extensions` prop later.
 */

interface BlogEditorProps {
  value: TiptapDoc | null;
  onChange: (doc: TiptapDoc) => void;
  /** Upload handler for inline images — returns the storage key. */
  onUploadImage?: (file: File) => Promise<string>;
}

export function BlogEditor({
  value,
  onChange,
  onUploadImage,
}: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        horizontalRule: {},
      }),
      StorageImage.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value ?? { type: "doc", content: [] },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TiptapDoc);
    },
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onUploadImage) return;

    setUploading(true);
    onUploadImage(file)
      .then((storageKey) => {
        editor
          ?.chain()
          .focus()
          .insertContent({
            type: "image",
            attrs: { storageKey, alt: file.name, align: "center" },
          })
          .run();
      })
      .catch((err) => {
        console.error("Image upload failed:", err);
        alert("Image upload failed. Please try a JPEG/PNG/WebP under 10 MB.");
      })
      .finally(() => setUploading(false));
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive("underline")} title="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive("strike")} title="Strike">
          <Strikethrough className="h-4 w-4" />
        </ToolbarBtn>
        <Divider />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} title="H2">
          <Heading2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })} title="H3">
          <Heading3 className="h-4 w-4" />
        </ToolbarBtn>
        <Divider />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="Bullet list">
          <List className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="Ordered list">
          <ListOrdered className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} title="Quote">
          <Quote className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <Minus className="h-4 w-4" />
        </ToolbarBtn>
        <Divider />
        <ToolbarBtn onClick={() => setLink(editor)} active={editor?.isActive("link")} title="Link">
          <Link2 className="h-4 w-4" />
        </ToolbarBtn>
        <Divider />
        <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo">
          <Undo2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo">
          <Redo2 className="h-4 w-4" />
        </ToolbarBtn>
        <div className="ml-auto">
          <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ImageIcon className="h-4 w-4" />
            {uploading ? "Uploading…" : "Image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={handleImageFile}
              disabled={!onUploadImage}
            />
          </label>
        </div>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose-jasmine max-w-none p-4 [&_.ProseMirror]:min-h-[320px] [&_.ProseMirror]:outline-none"
      />
    </div>
  );
}

function setLink(editor: Editor | null) {
  if (!editor) return;
  const previous = editor.getAttributes("link").href;
  const url = window.prompt("Link URL", previous ?? "https://");
  if (url === null) return;
  if (url === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
}

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" />;
}
