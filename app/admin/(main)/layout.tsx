import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Receipt,
  Settings,
  Star,
  TicketPercent,
} from "lucide-react";

import { getCurrentAdmin, signOut } from "@/lib/admin/auth";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/src/config/site";

export default async function AdminMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <span className="font-serif text-lg font-medium text-foreground">
            {siteConfig.brand.shortName}
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Admin
          </span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <SidebarLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
            Dashboard
          </SidebarLink>
          <SidebarLink href="/admin/tours" icon={<Package className="h-4 w-4" />}>
            Tours
          </SidebarLink>
          <SidebarLink href="/admin/departures" icon={<CalendarDays className="h-4 w-4" />}>
            Departures
          </SidebarLink>
          <SidebarLink href="/admin/bookings" icon={<Receipt className="h-4 w-4" />}>
            Bookings
          </SidebarLink>
          <SidebarLink href="/admin/payments" icon={<CardIcon />}>
            Payments
          </SidebarLink>
          <SidebarLink href="/admin/blogs" icon={<FileText className="h-4 w-4" />}>
            Blogs
          </SidebarLink>
          <SidebarLink href="/admin/promotions" icon={<TicketPercent className="h-4 w-4" />}>
            Promotions
          </SidebarLink>
          <SidebarLink href="/admin/destinations" icon={<MapPin className="h-4 w-4" />}>
            Destinations
          </SidebarLink>
          <SidebarLink href="/admin/reviews" icon={<Star className="h-4 w-4" />}>
            Reviews
          </SidebarLink>
          <SidebarLink href="/admin/media" icon={<ImageIcon className="h-4 w-4" />}>
            Media
          </SidebarLink>
          <SidebarLink href="/admin/settings" icon={<Settings className="h-4 w-4" />}>
            Settings
          </SidebarLink>
        </nav>
        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-serif text-sm text-primary">
              {admin.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {admin.name ?? admin.email}
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                {admin.role}
              </p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut();
              redirect("/admin/login");
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <span className="font-serif text-base font-medium">
          {siteConfig.brand.shortName} Admin
        </span>
        <form
          action={async () => {
            "use server";
            await signOut();
            redirect("/admin/login");
          }}
        >
          <Button type="submit" variant="ghost" size="sm">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </header>

      {/* Main */}
      <div className="lg:pl-64">
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {icon}
      {children}
    </Link>
  );
}

function CardIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
