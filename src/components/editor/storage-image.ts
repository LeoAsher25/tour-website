import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { publicUrlFor } from "@/lib/storage/url";

/**
 * Custom image extension — adds `storageKey` + `caption` + `align` attrs so
 * blog images reference Supabase Storage keys (never base64) with metadata.
 * Renders a real `src` (derived from the storage key) so images display in
 * the editor, while keeping the raw key in `data-storage-key` for save.
 */
export const StorageImage = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      storageKey: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-storage-key"),
        renderHTML: (attributes) => ({
          "data-storage-key": attributes.storageKey,
        }),
      },
      caption: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-caption"),
        renderHTML: (attributes) => ({
          "data-caption": attributes.caption,
        }),
      },
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align"),
        renderHTML: (attributes) => ({
          "data-align": attributes.align,
        }),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = { ...HTMLAttributes };
    // Derive a loadable src from the storage key unless one already exists.
    // Note: `node.attrs.storageKey` is the raw attr — HTMLAttributes already
    // contains the rendered `data-storage-key` form.
    const storageKey = node.attrs.storageKey;
    if (storageKey && !attrs.src) {
      const key = String(storageKey);
      attrs.src = key.startsWith("http") ? key : publicUrlFor(key);
    }
    return ["img", mergeAttributes(this.options.HTMLAttributes, attrs)];
  },
});
