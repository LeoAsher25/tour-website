"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import {
  CalendarDays,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  MapPin,
  Package,
  Receipt,
  Settings,
  Star,
  TicketPercent,
} from "lucide-react";

import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");

  const NAV_ITEMS = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/tours", label: t("tours"), icon: Package },
    { href: "/admin/departures", label: t("departures"), icon: CalendarDays },
    { href: "/admin/bookings", label: t("bookings"), icon: Receipt },
    { href: "/admin/payments", label: t("payments"), icon: CreditCardIcon },
    { href: "/admin/blogs", label: t("blogs"), icon: FileText },
    { href: "/admin/promotions", label: t("promotions"), icon: TicketPercent },
    { href: "/admin/destinations", label: t("destinations"), icon: MapPin },
    { href: "/admin/reviews", label: t("reviews"), icon: Star },
    { href: "/admin/media", label: t("media"), icon: ImageIcon },
    { href: "/admin/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(45,88,66,0.12)]"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              className={cn(
                "h-[18px] w-[18px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground/70"
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
