"use client";

import { useEffect, useState } from "react";
import { LogOut, PanelLeft, PanelLeftClose } from "lucide-react";

import { SidebarNav } from "@/components/admin/sidebar-nav";
import { AdminDrawer } from "@/components/admin/admin-drawer";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/domain";

const STORAGE_KEY = "admin:sidebar-collapsed";

export function AdminShell({
  admin,
  onSignOut,
  children,
}: {
  admin: AdminUser;
  onSignOut: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
    } catch {}
  }, []);

  function toggle() {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA]/60">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex transition-transform duration-300",
          collapsed && "lg:-translate-x-full",
        )}
        aria-hidden={collapsed ? true : undefined}>
        <div className="flex items-center gap-3 border-b border-border px-5 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary font-serif text-lg text-primary-foreground">
            {siteConfig.brand.shortName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-serif text-lg font-medium text-foreground">
              {siteConfig.brand.shortName}
            </p>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Admin console
            </p>
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Mở sidebar" : "Thu gọn sidebar"}
            title={collapsed ? "Mở sidebar" : "Thu gọn"}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer -mr-5">
            <PanelLeftClose className="h-[18px] w-[18px]" />
          </button>
        </div>

        <SidebarNav />

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
          <form action={onSignOut}>
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
          <form action={onSignOut}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
          <AdminDrawer admin={admin} onSignOut={onSignOut} />
        </div>
      </header>

      <div
        className={cn(
          "transition-[padding] duration-300",
          collapsed ? "lg:pl-0" : "lg:pl-64",
        )}>
        {collapsed && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Mở sidebar"
            title="Mở sidebar"
            className="fixed left-4 top-4 z-30 hidden h-9 w-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-background text-foreground shadow-sm transition-colors hover:border-foreground/15 lg:inline-flex cursor-pointer">
            <PanelLeft className="h-[18px] w-[18px]" />
          </button>
        )}
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
