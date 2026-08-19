"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

import { blogInputSchema, type BlogInput } from "@/lib/admin/blog-schema";
import type { BlogPost, TiptapDoc } from "@/types/domain";
import { BlogEditor } from "./blog-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectNative } from "@/components/ui/select-native";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BlogEditorPage({ post }: { post: BlogPost | null }) {
  const router = useRouter();
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImageKey, setCoverImageKey] = useState(post?.coverImageKey ?? "");
  const [contentJson, setContentJson] = useState<TiptapDoc | null>(
    post?.contentJson ?? null
  );
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    post?.status ?? "draft"
  );
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    post?.seoDescription ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/media", {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Upload failed");
    }
    const data = await res.json();
    return data.key as string;
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const key = await handleUploadImage(file);
      setCoverImageKey(key);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: BlogInput = {
      title,
      slug,
      excerpt,
      coverImageKey: coverImageKey || null,
      contentJson: contentJson ?? { type: "doc", content: [] },
      status,
      featured,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      seoTitle,
      seoDescription,
    };

    const parsed = blogInputSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(
        isEdit ? `/api/admin/blogs/${post!.id}` : "/api/admin/blogs",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to save");
        setSaving(false);
        return;
      }
      const saved = await res.json();
      router.push(`/admin/blogs/${saved.id}/edit`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message ?? "Failed to save");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Post</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!isEdit && !slug) {
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "")
                  );
                }
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Slug *</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
            />
          </div>
          <div className="space-y-2">
            <Label>Tags (comma separated)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="planning, seasons"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Excerpt</Label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
            />
          </div>

          {/* Cover image */}
          <div className="space-y-2 sm:col-span-2">
            <Label>Cover image</Label>
            <div className="flex items-center gap-3">
              {coverImageKey ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverUrl(coverImageKey)}
                  alt="Cover"
                  className="h-20 w-32 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                  No cover
                </div>
              )}
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent">
                <Upload className="h-4 w-4" />
                Upload
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </label>
              {coverImageKey && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCoverImageKey("")}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <SelectNative
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "draft" | "published" | "archived")
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </SelectNative>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Checkbox
              checked={featured}
              onCheckedChange={(v) => setFeatured(Boolean(v))}
              id="featured"
            />
            <Label htmlFor="featured">Featured</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Content</CardTitle>
        </CardHeader>
        <CardContent>
          <BlogEditor
            value={contentJson}
            onChange={setContentJson}
            onUploadImage={handleUploadImage}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>SEO title</Label>
            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>SEO description</Label>
            <Textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/blogs")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create post"}
        </Button>
      </div>
    </form>
  );
}

function coverUrl(key: string): string {
  if (key.startsWith("http")) return key;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/media/${key
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/")}`;
}
