import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { getCurrentAdmin, signOut } from "@/lib/admin/auth";
import { AdminDrawer } from "@/components/admin/admin-drawer";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { siteConfig } from "@/config/site";

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
    <div className="min-h-screen bg-[#F4F1EA]/60">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-serif text-lg text-primary-foreground">
            {siteConfig.brand.shortName.charAt(0)}
          </div>
          <div className="leading-tight">
            <p className="font-serif text-lg font-medium text-foreground">
              {siteConfig.brand.shortName}
            </p>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Admin console
            </p>
          </div>
        </div>

        <SidebarNav />

        {/* User footer */}
        <div className="border-t border-border p-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-tint font-serif text-sm font-medium text-accent-hover">
              {admin.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {admin.name ?? admin.email}
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                {admin.role.replace("_", " ")}
              </p>
            </div>
          </div>
          <form action={handleSignOut}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Top bar (mobile): menu icon opens drawer, no inline nav */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-serif text-sm text-primary-foreground">
            {siteConfig.brand.shortName.charAt(0)}
          </div>
          <span className="font-serif text-base font-medium text-foreground">
            {siteConfig.brand.shortName} Admin
          </span>
        </div>

        <div className="flex items-center gap-1">
          <form action={handleSignOut}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
          <AdminDrawer admin={admin} onSignOut={handleSignOut} />
        </div>
      </header>

      {/* Main */}
      <div className="lg:pl-64">
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
