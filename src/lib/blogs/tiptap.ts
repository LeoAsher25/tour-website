import type { TiptapDoc, TiptapNode } from "@/types/domain";

/**
 * Tiptap JSON helpers.
 * - markdownToTiptap: converts the legacy markdown-ish blog content into a
 *   Tiptap doc (used by the seed for migrating existing posts).
 * - textFromTiptap / estimateReadingMinutes: derived plain-text helpers used by
 *   mappers and SEO.
 */

export function markdownToTiptap(md: string): TiptapDoc {
  const blocks = md
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  const content: TiptapNode[] = [];

  for (const block of blocks) {
    if (block.startsWith("## ")) {
      content.push({
        type: "heading",
        attrs: { level: 2 },
        content: block
          .replace(/^##\s+/, "")
          .split("\n")
          .map((t) => ({ type: "text", text: t })),
      });
    } else if (block.startsWith("### ")) {
      content.push({
        type: "heading",
        attrs: { level: 3 },
        content: block
          .replace(/^###\s+/, "")
          .split("\n")
          .map((t) => ({ type: "text", text: t })),
      });
    } else if (block.startsWith("- ")) {
      content.push({
        type: "bulletList",
        content: block
          .split("\n")
          .filter((l) => l.trim().startsWith("- "))
          .map((l) => ({
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: l.replace(/^-\s+/, "") }],
              },
            ],
          })),
      });
    } else if (block.startsWith("> ")) {
      content.push({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: block.replace(/^>\s+/, "") }],
          },
        ],
      });
    } else {
      content.push({
        type: "paragraph",
        content: block.split("\n").map((t) => ({ type: "text", text: t })),
      });
    }
  }

  return { type: "doc", content };
}

export function textFromTiptap(doc: TiptapDoc | null): string {
  if (!doc) return "";
  const parts: string[] = [];
  const walk = (nodes: TiptapNode[]) => {
    for (const node of nodes) {
      if (node.type === "paragraph" || node.type === "heading") {
        parts.push(collectText(node));
      } else if (node.content) {
        walk(node.content);
      }
    }
  };
  walk(doc.content);
  return parts.join("\n\n").trim();
}

function collectText(node: TiptapNode): string {
  if (node.text) return node.text;
  return (node.content ?? []).map(collectText).join("");
}

export function estimateReadingMinutes(text: string): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
