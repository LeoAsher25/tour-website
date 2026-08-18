import { z } from "zod";

/** Blog input schema — client-safe (no server-only imports). */

export const blogInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, hyphens only"),
  excerpt: z.string().optional(),
  coverImageKey: z.string().optional().nullable(),
  contentJson: z.any(), // Tiptap doc
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type BlogInput = z.infer<typeof blogInputSchema>;
