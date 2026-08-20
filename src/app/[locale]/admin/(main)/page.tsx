import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  ExternalLink,
  FileText,
  Package,
  Receipt,
  TrendingUp,
  Users,
} from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { formatVnd } from "@/lib/pricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats();
  const t = await getTranslations("admin.dashboard");

  const cards = [
    {
      label: t("cardTours"),
      value: String(stats.tours),
      hint: t("hintTours"),
      href: "/admin/tours",
      icon: Package,
      tone: "primary" as const,
    },
    {
      label: t("cardBlogs"),
      value: String(stats.blogs),
      hint: t("hintBlogs"),
      href: "/admin/blogs",
      icon: FileText,
      tone: "primary" as const,
    },
    {
      label: t("cardBookings"),
      value: String(stats.bookings),
      hint: t("hintBookings"),
      href: "/admin/bookings",
      icon: Receipt,
      tone: "primary" as const,
    },
    {
      label: t("cardDepartures"),
      value: String(stats.departures),
      hint: t("hintDepartures"),
      href: "/admin/departures",
      icon: CalendarDays,
      tone: "primary" as const,
    },
    {
      label: t("cardPaid"),
      value: formatVnd(stats.paidAmount),
      hint: t("hintPaid"),
      href: "/admin/payments",
      icon: Banknote,
      tone: "accent" as const,
    },
    {
      label: t("cardRevenue"),
      value: formatVnd(stats.confirmedRevenue),
      hint: t("hintRevenue"),
      href: "/admin/bookings",
      icon: TrendingUp,
      tone: "accent" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            <Users className="h-3.5 w-3.5" />
            {t("overview")}
          </p>
          <h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">
            {t("greeting")}{" "}
            <span className="accent-word">
              {(admin.name ?? admin.email).split(" ")[0]}
            </span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-md"
        >
          <ExternalLink className="h-4 w-4" />
          {t("viewSite")}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="group focus-visible:outline-none"
            >
              <Card className="relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl",
                        c.tone === "accent"
                          ? "bg-accent-tint text-accent-hover"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                  </div>
                  <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="mt-1.5 font-serif text-[1.75rem] leading-none text-foreground">
                    {c.value}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{c.hint}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-xl">{t("quickActions")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("quickActionsSub")}
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <QuickAction href="/admin/tours/new" primary>
            <Package className="h-4 w-4" />
            {t("newTour")}
          </QuickAction>
          <QuickAction href="/admin/blogs/new">
            <FileText className="h-4 w-4" />
            {t("newBlog")}
          </QuickAction>
          <QuickAction href="/admin/bookings/new">
            <Receipt className="h-4 w-4" />
            {t("newBooking")}
          </QuickAction>
          <QuickAction href="/admin/departures">
            <CalendarDays className="h-4 w-4" />
            {t("manageDepartures")}
          </QuickAction>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickAction({
  href,
  primary,
  children,
}: {
  href: string;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full px-6 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        primary
          ? "bg-accent text-accent-foreground shadow-sm hover:bg-accent-hover"
          : "border border-border bg-background text-foreground hover:border-accent hover:text-accent"
      )}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
