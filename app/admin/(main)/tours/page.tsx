import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Copy, Eye, Plus, Pencil } from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { TourAdminRepository } from "@/lib/admin/tours";
import { formatVnd } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const repo = new TourAdminRepository();

export default async function AdminToursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
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
    if (!tour.published) return <Badge variant="default">Draft</Badge>;
    return <Badge variant="outline">Archived</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Tours</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tours.length} tours
          </p>
        </div>
        <Link
          href="/admin/tours/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground shadow-sm transition-all hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          New tour
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-3">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by title, slug or destination…"
          className="max-w-sm"
        />
        <select
          name="status"
          defaultValue={status ?? "all"}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tour</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tours.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No tours found. Create your first tour.
                </TableCell>
              </TableRow>
            )}
            {tours.map((tour) => (
              <TableRow key={tour.id}>
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
                      <p className="text-xs text-muted-foreground">{tour.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{tour.destination}</TableCell>
                <TableCell>
                  {tour.durationDays}D {tour.durationNights}N
                </TableCell>
                <TableCell>{formatVnd(tour.fromPrice)}</TableCell>
                <TableCell>{statusBadge(tour)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/tours/${tour.slug}`}
                      target="_blank"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/tours/${tour.id}/edit`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await repo.duplicate(tour.id);
                        revalidatePath("/admin/tours");
                      }}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
