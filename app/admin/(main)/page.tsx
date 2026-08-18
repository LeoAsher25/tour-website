import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  FileText,
  Package,
  Receipt,
} from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { formatVnd } from "@/lib/pricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Tours",
      value: String(stats.tours),
      href: "/admin/tours",
      icon: <Package className="h-4 w-4 text-primary" />,
    },
    {
      label: "Blogs",
      value: String(stats.blogs),
      href: "/admin/blogs",
      icon: <FileText className="h-4 w-4 text-primary" />,
    },
    {
      label: "Bookings",
      value: String(stats.bookings),
      href: "/admin/bookings",
      icon: <Receipt className="h-4 w-4 text-primary" />,
    },
    {
      label: "Departures",
      value: String(stats.departures),
      href: "/admin/departures",
      icon: <CalendarDays className="h-4 w-4 text-primary" />,
    },
    {
      label: "Paid amount",
      value: formatVnd(stats.paidAmount),
      href: "/admin/payments",
      icon: <Banknote className="h-4 w-4 text-primary" />,
    },
    {
      label: "Confirmed revenue",
      value: formatVnd(stats.confirmedRevenue),
      href: "/admin/bookings",
      icon: <Receipt className="h-4 w-4 text-primary" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {admin.name ?? admin.email}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="group">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {c.label}
                </CardTitle>
                {c.icon}
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <p className="font-serif text-2xl text-foreground">{c.value}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href="/admin/tours/new"
            className="inline-flex h-10 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground shadow-sm transition-all hover:bg-accent-hover"
          >
            New tour
          </Link>
          <Link
            href="/admin/blogs/new"
            className="inline-flex h-10 items-center rounded-full border border-border bg-background px-6 text-sm font-medium text-foreground transition-all hover:border-accent hover:text-accent"
          >
            New blog post
          </Link>
          <Link
            href="/admin/bookings/new"
            className="inline-flex h-10 items-center rounded-full border border-border bg-background px-6 text-sm font-medium text-foreground transition-all hover:border-accent hover:text-accent"
          >
            Create booking
          </Link>
          <Link
            href="/admin/departures/new"
            className="inline-flex h-10 items-center rounded-full border border-border bg-background px-6 text-sm font-medium text-foreground transition-all hover:border-accent hover:text-accent"
          >
            Add departure
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
