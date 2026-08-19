import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/admin/auth";
import { BlogAdminRepository } from "@/lib/admin/blogs";
import { BlogEditorPage } from "@/components/admin/blog-editor-page";

export const metadata = { title: "Edit Blog Post" };

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const repo = new BlogAdminRepository();
  const post = await repo.getById(id);
  if (!post) notFound();

  return <BlogEditorPage post={post} />;
}
