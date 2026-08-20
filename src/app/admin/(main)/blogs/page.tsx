import Link from "next/link";
import { Plus } from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { BlogAdminRepository } from "@/lib/admin/blogs";
import { Badge } from "@/components/ui/badge";
import { DeleteBlogButton } from "@/components/admin/delete-blog-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminBlogsPage() {
  await requireAdmin();
  const repo = new BlogAdminRepository();
  const posts = await repo.listAll();

  const statusBadge = (s: string) => {
    if (s === "published") return <Badge variant="solid">Published</Badge>;
    if (s === "archived") return <Badge variant="outline">Archived</Badge>;
    return <Badge variant="default">Draft</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Blogs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {posts.length} posts
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground shadow-sm transition-all hover:bg-accent-hover">
          <Plus className="h-4 w-4" />
          New post
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Featured</TableHead>
              <TableHead className="text-center">Updated</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-muted-foreground">
                  No posts yet. Write your first story.
                </TableCell>
              </TableRow>
            )}
            {posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link
                    href={`/admin/blogs/${p.id}/edit`}
                    className="font-medium text-foreground hover:text-accent">
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">/{p.slug}</p>
                  {p.status === "published" && (
                    <Link
                      href={`/blogs/${p.slug}`}
                      target="_blank"
                      className="mt-1 inline-block text-xs text-accent hover:underline">
                      View ↗
                    </Link>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {statusBadge(p.status)}
                </TableCell>
                <TableCell className="text-center">
                  {p.featured ? "★" : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-center">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center text-center">
                    {p.id && <DeleteBlogButton id={p.id} />}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
