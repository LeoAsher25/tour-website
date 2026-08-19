"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tours", label: "Tours", icon: Package },
  { href: "/admin/departures", label: "Departures", icon: CalendarDays },
  { href: "/admin/bookings", label: "Bookings", icon: Receipt },
  { href: "/admin/payments", label: "Payments", icon: CreditCardIcon },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/promotions", label: "Promotions", icon: TicketPercent },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

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
