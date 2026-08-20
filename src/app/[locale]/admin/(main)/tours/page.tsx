import { Link } from "@/i18n/navigation";
import { Copy, Eye, Pencil, Plus } from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { getTranslations } from "next-intl/server";
import { TourAdminRepository } from "@/lib/admin/tours";
import { duplicateTour } from "@/lib/admin/tour-actions";
import { formatVnd } from "@/lib/pricing";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ClearFilters,
  DataTableCard,
  EmptyState,
  FilterBar,
  FilterSearch,
  FilterSelect,
  FilterSubmit,
} from "@/components/admin/data-table";

const repo = new TourAdminRepository();

export default async function AdminToursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const t = await getTranslations("admin.tours");
  const { q, status } = await searchParams;

  let tours = await repo.listAll();
  if (q) {
    const needle = q.toLowerCase();
    tours = tours.filter(
      (t) =>
        t.title.toLowerCase().includes(needle) ||
        t.slug.includes(needle) ||
        t.destination.toLowerCase().includes(needle)
    );
  }
  if (status && status !== "all") {
    tours = tours.filter(
      (t) =>
        (status === "published" && t.published) ||
        (status === "draft" && !t.published) ||
        (status === "archived" && !t.published)
    );
  }

  const statusBadge = (tour: (typeof tours)[number]) => {
    if (tour.published) return <Badge variant="solid">Published</Badge>;
    return <Badge variant="outline">Draft</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Tours</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tours.length === 1 ? t("countOne") : t("count", { count: tours.length })}
          </p>
        </div>
        <Link
          href="/admin/tours/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Tour mới
        </Link>
      </div>

      {/* Filter bar */}
      <FilterBar>
        <FilterSearch
          name="q"
          defaultValue={q}
          placeholder={t("searchPlaceholder")}
        />
        <FilterSelect
          name="status"
          defaultValue={status ?? "all"}
          label={t("status")}
          options={[
            { value: "all", label: t("allStatuses") },
            { value: "published", label: t("published") },
            { value: "draft", label: t("draft") },
            { value: "archived", label: t("archived") },
          ]}
        />
        <FilterSubmit />
        {(q || (status && status !== "all")) && (
          <ClearFilters href="/admin/tours" />
        )}
      </FilterBar>

      {/* Table */}
      <DataTableCard>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("colTour")}</TableHead>
              <TableHead>{t("colDestination")}</TableHead>
              <TableHead>{t("colDuration")}</TableHead>
              <TableHead>{t("colPrice")}</TableHead>
              <TableHead>{t("colStatus")}</TableHead>
              <TableHead className="text-right">{t("colActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tours.length === 0 && (
              <EmptyState
                colSpan={6}
                title={t("empty")}
                description={t("emptyDesc")}
                action={
                  <Link
                    href="/admin/tours/new"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Tạo tour
                  </Link>
                }
              />
            )}
              {tours.map((tour) => (
                <TableRow
                  key={tour.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {tour.heroImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={tour.heroImage}
                          alt={tour.title}
                          className="h-12 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                          No img
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{tour.title}</p>
                        <p className="text-xs text-muted-foreground">
                          /{tour.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{tour.destination}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {tour.durationDays}D {tour.durationNights}N
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatVnd(tour.fromPrice)}
                  </TableCell>
                  <TableCell>{statusBadge(tour)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <ActionLink
                        href={`/tours/${tour.slug}`}
                        title={t("preview")}
                        target="_blank"
                      >
                        <Eye className="h-4 w-4" />
                      </ActionLink>
                      <ActionLink
                        href={`/admin/tours/${tour.id}/edit`}
                        title={t("edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </ActionLink>
                      <form
                        action={duplicateTour}
                      >
                        <input type="hidden" name="id" value={tour.id} />
                        <button
                          type="submit"
                          title={t("duplicate")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </DataTableCard>
    </div>
  );
}

function ActionLink({
  href,
  title,
  target,
  children,
}: {
  href: string;
  title: string;
  target?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={title}
      target={target}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </Link>
  );
}
