import type { TiptapDoc, TiptapNode } from "@/types/domain";
import { publicUrlFor } from "@/lib/storage/media";

/**
 * Server-side Tiptap JSON renderer (no editor JS loaded on public pages).
 * Renders the canonical blog content into React elements. Extensible: add a
 * case per node type — custom blocks like `tourCta` slot in here later.
 */

export interface TiptapRenderOptions {
  /** Resolve a storage key to a public URL (overridable for testing). */
  resolveImage?: (key: string) => string;
  /** Map node type → React component for custom blocks. */
  customRenderers?: Record<
    string,
    (node: TiptapNode, children: React.ReactNode) => React.ReactNode
  >;
}

export function renderTiptap(doc: TiptapDoc, opts: TiptapRenderOptions = {}) {
  const { customRenderers = {} } = opts;
  const resolveImage = opts.resolveImage ?? publicUrlFor;

  const renderNode = (node: TiptapNode, key: number): React.ReactNode => {
    // Custom block renderers take precedence.
    if (customRenderers[node.type]) {
      return customRenderers[node.type](node, renderChildren(node.content));
    }

    switch (node.type) {
      case "paragraph": {
        const align = String(node.attrs?.textAlign ?? "");
        const className = align ? `text-${align}` : undefined;
        return <p key={key} className={className}>{renderChildren(node.content)}</p>;
      }
      case "heading": {
        const level = Number(node.attrs?.level ?? 2);
        const Tag = (["h1", "h2", "h3", "h4", "h5"][level - 1] ?? "h2") as
          | "h1"
          | "h2"
          | "h3"
          | "h4"
          | "h5";
        const align = String(node.attrs?.textAlign ?? "");
        const className = align ? `text-${align}` : undefined;
        return <Tag key={key} className={className}>{renderChildren(node.content)}</Tag>;
      }
      case "bulletList":
        return <ul key={key}>{renderChildren(node.content)}</ul>;
      case "orderedList":
        return <ol key={key}>{renderChildren(node.content)}</ol>;
      case "listItem":
        return <li key={key}>{renderChildren(node.content)}</li>;
      case "blockquote":
        return <blockquote key={key}>{renderChildren(node.content)}</blockquote>;
      case "codeBlock":
        return (
          <pre key={key}>
            <code>{renderChildren(node.content)}</code>
          </pre>
        );
      case "horizontalRule":
        return <hr key={key} />;
      case "image": {
        const storageKey = String(node.attrs?.storageKey ?? "");
        const alt = String(node.attrs?.alt ?? "");
        const caption = node.attrs?.caption ? String(node.attrs.caption) : null;
        const align = String(node.attrs?.align ?? "center");
        const width = String(node.attrs?.width ?? "");
        const src = storageKey.startsWith("http")
          ? storageKey
          : resolveImage(storageKey);
        return (
          <figure key={key} className={`my-6 ${align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              width={width || undefined}
              className="mx-auto max-w-full rounded-xl"
            />
            {caption && (
              <figcaption className="mt-2 text-sm text-muted-foreground">
                {caption}
              </figcaption>
            )}
          </figure>
        );
      }
      case "text":
        return renderText(node, key);
      case "hardBreak":
        return <br key={key} />;
      case "doc":
        return <>{renderChildren(node.content)}</>;
      default:
        // Unknown node — render children if any, else skip.
        return node.content ? (
          <span key={key}>{renderChildren(node.content)}</span>
        ) : null;
    }
  };

  const renderText = (node: TiptapNode, key: number): React.ReactNode => {
    let el: React.ReactNode = node.text ?? "";
    for (const mark of node.marks ?? []) {
      switch (mark.type) {
        case "bold":
          el = <strong key={key}>{el}</strong>;
          break;
        case "italic":
          el = <em key={key}>{el}</em>;
          break;
        case "underline":
          el = <u key={key}>{el}</u>;
          break;
        case "strike":
          el = <s key={key}>{el}</s>;
          break;
        case "code":
          el = <code key={key}>{el}</code>;
          break;
        case "highlight":
          el = <mark key={key}>{el}</mark>;
          break;
        case "superscript":
          el = <sup key={key}>{el}</sup>;
          break;
        case "subscript":
          el = <sub key={key}>{el}</sub>;
          break;
        case "link":
          el = (
            <a
              key={key}
              href={String(mark.attrs?.href ?? "#")}
              target="_blank"
              rel="noreferrer"
            >
              {el}
            </a>
          );
          break;
        default:
          break;
      }
    }
    return el;
  };

  const renderChildren = (nodes?: TiptapNode[]): React.ReactNode =>
    (nodes ?? []).map((n, i) => renderNode(n, i));

  return renderNode(doc, 0);
}
