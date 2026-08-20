import { redirect } from "next/navigation";

import { getCurrentAdmin, signOut } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  async function handleSignOut() {
    "use server";
    await signOut();
    redirect("/admin/login");
  }

  return (
    <AdminShell admin={admin} onSignOut={handleSignOut}>
      {children}
    </AdminShell>
  );
}
