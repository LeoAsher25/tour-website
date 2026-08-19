import { redirect } from "next/navigation";
import { z } from "zod";
import { Lock, Mail } from "lucide-react";

import { getCurrentAdmin, signIn } from "@/lib/admin/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  // Already signed in → go to dashboard.
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F4F1EA] px-4">
      {/* Warm decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/5 blur-3xl"
      />

      <Card className="relative w-full max-w-sm border-border/70 shadow-xl">
        <CardHeader className="items-center pb-4 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-serif text-2xl text-primary-foreground shadow-md">
            {siteConfig.brand.shortName.charAt(0)}
          </div>          <CardTitle className="font-serif text-2xl text-foreground">
            {siteConfig.brand.shortName} Admin
          </CardTitle>
          <CardDescription>Đăng nhập để quản lý website</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={next} serverError={error} />
        </CardContent>
      </Card>
    </div>
  );
}

/** Client login form — surfaces server-action errors inline. */
function LoginForm({
  next,
  serverError,
}: {
  next?: string;
  serverError?: string;
}) {
  return (
    <form
      action={async (formData: FormData) => {
        "use server";
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
            `/admin/login?error=${encodeURIComponent(
              JSON.stringify(result.error),
            )}`,
          );
        }
        redirect(next && next.startsWith("/admin") ? next : "/admin");
      }}
      className="space-y-4"
    >
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="admin@example.com"
            className="pl-9"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="pl-9"
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        Đăng nhập
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Chỉ quản trị viên mới có quyền truy cập.
      </p>
    </form>
  );
}
