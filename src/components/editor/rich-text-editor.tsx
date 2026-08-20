"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import type { Level } from "@tiptap/extension-heading";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  CodeXml,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Type,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { StorageImage } from "./storage-image";
import { cn } from "@/lib/utils";
import type { TiptapDoc } from "@/types/domain";

/**
 * Reusable Tiptap rich-text editor (client). Emits the canonical Tiptap JSON
 * doc (`TiptapDoc`). Toolbar mirrors the tiptap.dev "Simple editor" demo:
 * undo/redo, heading dropdown, lists, blockquote, code block, inline
 * formatting (bold, italic, strike, code, underline, highlight),
 * superscript/subscript, links, text alignment, horizontal rule and optional
 * image upload. Image nodes carry `storageKey` (never base64).
 */

export interface RichTextEditorProps {
  value: TiptapDoc | null;
  onChange: (doc: TiptapDoc) => void;
  /** Upload handler for inline images — returns the storage key. Omit to hide the image button. */
  onUploadImage?: (file: File) => Promise<string>;
  /** Heading levels exposed in the dropdown (default 1–4). */
  headingLevels?: Level[];
  /** Min height of the editable area (default 420px). */
  minHeight?: number | string;
  /** Disable the toolbar entirely (read-only-ish content editing). */
  disableToolbar?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  onUploadImage,
  headingLevels = [1, 2, 3, 4],
  minHeight = 420,
  disableToolbar = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: headingLevels },
        codeBlock: {},
        horizontalRule: {},
        link: { openOnClick: false, autolink: true },
        underline: {},
      }),
      StorageImage.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: false }),
      Superscript,
      Subscript,
    ],
    content: value ?? { type: "doc", content: [] },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TiptapDoc);
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-full",
      },
    },
  });

  const [uploading, setUploading] = useState(false);
  const [headingOpen, setHeadingOpen] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  useEffect(() => {
    if (!headingOpen) return;
    function onClick(e: MouseEvent) {
      if (!headingRef.current?.contains(e.target as Node)) {
        setHeadingOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [headingOpen]);

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

  const currentHeading = headingLevels.find((level) =>
    editor?.isActive("heading", { level }),
  );
  const minH = typeof minHeight === "number" ? `${minHeight}px` : minHeight;
  const minHKey = String(minHeight).replace(/[^a-zA-Z0-9]/g, "");

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card",
        `rte-min-${minHKey}`,
      )}>
      {!disableToolbar && (
        /* Toolbar */
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1.5">
          <ToolbarBtn
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            title="Undo">
            <Undo2 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            title="Redo">
            <Redo2 className="h-4 w-4" />
          </ToolbarBtn>

          <Divider />

          {/* Heading dropdown */}
          <div className="relative" ref={headingRef}>
            <button
              type="button"
              onClick={() => setHeadingOpen((v) => !v)}
              title="Heading"
              aria-label="Heading"
              className={cn(
                "flex h-8 min-w-9 items-center justify-center gap-1 rounded-md px-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                currentHeading && "bg-muted text-foreground",
              )}>
              <span className="font-serif">
                {currentHeading ? `H${currentHeading}` : "P"}
              </span>
              <svg
                className="h-3 w-3 opacity-60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {headingOpen && (
              <div className="absolute left-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg">
                <HeadingOption
                  label="Paragraph"
                  icon={<span className="font-serif font-medium">P</span>}
                  active={!currentHeading}
                  onClick={() => {
                    editor?.chain().focus().setParagraph().run();
                    setHeadingOpen(false);
                  }}
                />
                {headingLevels.map((level) => {
                  const Icon =
                    [Heading1, Heading2, Heading3, Heading4][level - 1] ?? Type;
                  return (
                    <HeadingOption
                      key={level}
                      label={`Heading ${level}`}
                      icon={<Icon className="h-4 w-4" />}
                      active={currentHeading === level}
                      onClick={() => {
                        editor?.chain().focus().toggleHeading({ level }).run();
                        setHeadingOpen(false);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <Divider />

          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList")}
            title="Bullet list">
            <List className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive("orderedList")}
            title="Ordered list">
            <ListOrdered className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            active={editor?.isActive("blockquote")}
            title="Blockquote">
            <Quote className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            active={editor?.isActive("codeBlock")}
            title="Code block">
            <CodeXml className="h-4 w-4" />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
            title="Bold">
            <Bold className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive("italic")}
            title="Italic">
            <Italic className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor?.isActive("strike")}
            title="Strikethrough">
            <Strikethrough className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleCode().run()}
            active={editor?.isActive("code")}
            title="Inline code">
            <Code className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor?.isActive("underline")}
            title="Underline">
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            active={editor?.isActive("highlight")}
            title="Highlight">
            <Highlighter className="h-4 w-4" />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            onClick={() => setLink(editor)}
            active={editor?.isActive("link")}
            title="Link">
            <Link2 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleSuperscript().run()}
            active={editor?.isActive("superscript")}
            title="Superscript">
            <SuperscriptIcon className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleSubscript().run()}
            active={editor?.isActive("subscript")}
            title="Subscript">
            <SubscriptIcon className="h-4 w-4" />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            active={editor?.isActive({ textAlign: "left" })}
            title="Align left">
            <AlignLeft className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
            active={editor?.isActive({ textAlign: "center" })}
            title="Align center">
            <AlignCenter className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
            active={editor?.isActive({ textAlign: "right" })}
            title="Align right">
            <AlignRight className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() =>
              editor?.chain().focus().setTextAlign("justify").run()
            }
            active={editor?.isActive({ textAlign: "justify" })}
            title="Justify">
            <AlignJustify className="h-4 w-4" />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule">
            <Minus className="h-4 w-4" />
          </ToolbarBtn>

          {onUploadImage && (
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
          )}
        </div>
      )}

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose-jasmine max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:p-4"
      />
      {/* Apply min-height to the editable area (ProseMirror) — unique class per instance. */}
      <style>{`.rte-min-${minHKey} .ProseMirror { min-height: ${minH}; }`}</style>
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

function HeadingOption({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground",
      )}>
      {icon}
      {label}
    </button>
  );
}

function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        active && "bg-muted text-foreground",
      )}>
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-border" />;
}
