"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn } from "./auth";

/**
 * Server action for the admin login form (module-level so the Zod schema is
 * not captured in an inline closure — React must serialize server actions for
 * progressive enhancement, and schema instances are not serializable).
 */

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
      )}`,
    );
  }
  const result = await signIn(parsed.data.email, parsed.data.password);
  if (result.error) {
    redirect(
      `/admin/login?error=${encodeURIComponent(JSON.stringify(result.error))}`,
    );
  }
  const next = String(formData.get("next") ?? "");
  redirect(next && next.startsWith("/admin") ? next : "/admin");
}
