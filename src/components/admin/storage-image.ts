import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";

/**
 * Custom image extension — adds `storageKey` + `caption` + `align` attrs so
 * blog images reference Supabase Storage keys (never base64) with metadata.
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

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },
});
