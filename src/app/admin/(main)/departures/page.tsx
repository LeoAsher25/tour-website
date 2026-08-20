import Link from "next/link";
import { CalendarDays, X } from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { DepartureRepository } from "@/lib/repositories/tours";
import { TourAdminRepository } from "@/lib/admin/tours";
import {
  bulkCreateDepartures,
  createDeparture,
  deleteDeparture,
  setDepartureStatus,
} from "@/lib/admin/departures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SelectNative } from "@/components/ui/select-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDeparturesPage({
  searchParams,
}: {
  searchParams: Promise<{ tourId?: string }>;
}) {
  await requireAdmin();
  const { tourId } = await searchParams;

  const depRepo = new DepartureRepository();
  const tourRepo = new TourAdminRepository();
  const [tours, deps] = await Promise.all([
    tourRepo.listLight(),
    depRepo.listUpcoming(tourId),
  ]);

  const statusBadge = (status: string) => {
    if (status === "open") return <Badge variant="solid">Open</Badge>;
    if (status === "closed") return <Badge variant="default">Closed</Badge>;
    return <Badge variant="outline">Cancelled</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Departures</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Departure dates with capacity — used for scheduled tours.
        </p>
      </div>

      {/* Create single */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">
            Add departure date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              await createDeparture({
                tourId: String(formData.get("tourId")),
                date: String(formData.get("date")),
                capacity: Number(formData.get("capacity") ?? 0),
                notes: String(formData.get("notes") ?? "") || undefined,
              });
            }}
            className="grid gap-4 sm:grid-cols-[1fr_auto_auto_1fr]">
            <div>
              <Label>Tour</Label>
              <SelectNative name="tourId" required wrapperClassName="mt-1.5">
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </SelectNative>
            </div>
            <div>
              <Label>Date</Label>
              <Input name="date" type="date" required className="mt-1.5" />
            </div>
            <div>
              <Label>Capacity</Label>
              <Input
                name="capacity"
                type="number"
                min={0}
                defaultValue={12}
                className="mt-1.5 w-24"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit">Add</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bulk create */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">
            Bulk create dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              const dates = String(formData.get("dates") ?? "")
                .split("\n")
                .map((d) => d.trim())
                .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
              await bulkCreateDepartures({
                tourId: String(formData.get("tourId")),
                dates,
                capacity: Number(formData.get("capacity") ?? 12),
              });
            }}
            className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div>
              <Label>Tour</Label>
              <SelectNative name="tourId" required wrapperClassName="mt-1.5">
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </SelectNative>
            </div>
            <div>
              <Label>Capacity</Label>
              <Input
                name="capacity"
                type="number"
                min={0}
                defaultValue={12}
                className="mt-1.5 w-24"
              />
            </div>
            <div>
              <Label>Dates (one per line, YYYY-MM-DD)</Label>
              <Textarea
                name="dates"
                rows={4}
                placeholder={"2026-10-01\n2026-10-08\n2026-10-15"}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit">Create all</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-serif text-lg text-foreground">
            Upcoming departures
          </h2>
        </div>
        <div className="divide-y divide-border">
          {deps.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No upcoming departures yet.
            </p>
          )}
          {deps.map((dep) => (
            <div
              key={dep.id}
              className="flex flex-wrap items-center gap-4 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/tours/${dep.tourId}/edit`}
                  className="text-sm font-medium text-foreground hover:text-accent">
                  {dep.tourTitle}
                </Link>
                <p className="text-xs text-muted-foreground">{dep.date}</p>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">
                  {dep.booked}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  / {dep.capacity} booked
                </span>
              </div>
              <div className="w-16">{statusBadge(dep.status)}</div>
              <div className="flex items-center gap-2">
                {dep.status !== "open" && (
                  <form
                    action={async () => {
                      "use server";
                      await setDepartureStatus(dep.id, "open");
                    }}>
                    <Button type="submit" variant="outline" size="sm">
                      Open
                    </Button>
                  </form>
                )}
                {dep.status === "open" && (
                  <form
                    action={async () => {
                      "use server";
                      await setDepartureStatus(dep.id, "closed");
                    }}>
                    <Button type="submit" variant="outline" size="sm">
                      Close
                    </Button>
                  </form>
                )}
                <form
                  action={async () => {
                    "use server";
                    await setDepartureStatus(dep.id, "cancelled");
                  }}>
                  <Button type="submit" variant="outline" size="sm">
                    Cancel
                  </Button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await deleteDeparture(dep.id);
                  }}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
