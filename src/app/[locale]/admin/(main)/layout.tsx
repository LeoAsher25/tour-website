import { redirect } from "@/i18n/navigation";

import { getCurrentAdmin, signOut } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminMainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect({ href: "/admin/login", locale });
    throw new Error("unreachable");
  }

  async function handleSignOut() {
    "use server";
    await signOut();
    redirect({ href: "/admin/login", locale });
  }

  return (
    <AdminShell admin={admin} onSignOut={handleSignOut}>
      {children}
    </AdminShell>
  );
}
