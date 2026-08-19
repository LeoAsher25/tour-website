import { requireAdmin } from "@/lib/admin/auth";
import { BlogEditorPage } from "@/components/admin/blog-editor-page";

export const metadata = { title: "New Blog Post" };

export default async function AdminBlogNewPage() {
  await requireAdmin();
  return <BlogEditorPage post={null} />;
}
