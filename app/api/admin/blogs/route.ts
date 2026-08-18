import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/admin/auth";
import { BlogAdminRepository, blogInputSchema } from "@/lib/admin/blogs";

export const runtime = "nodejs";

/** POST /api/admin/blogs — create a blog post (admin only). */
export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = blogInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const repo = new BlogAdminRepository();
    const id = await repo.create(parsed.data);
    return NextResponse.json({ id });
  } catch (err) {
    const msg = (err as Error).message ?? "Failed to create post";
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
