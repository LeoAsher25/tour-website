import { redirect } from "next/navigation";
import { z } from "zod";
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
import { siteConfig } from "@/src/config/site";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">
            {siteConfig.brand.shortName} Admin
          </CardTitle>
          <CardDescription>Sign in to manage the site</CardDescription>
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
              parsed.error.issues[0]?.message ?? "Invalid input",
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
      className="space-y-4">
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={"admin@gmail.com"}
          autoComplete="email"
          required
          placeholder="admin@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          defaultValue={"123qweA@"}
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  );
}
