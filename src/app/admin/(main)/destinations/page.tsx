import { Plus, Trash2 } from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { DestinationAdminRepository } from "@/lib/admin/content";
import {
  deleteDestination,
  saveDestination,
} from "@/lib/admin/content-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Destinations" };

export default async function AdminDestinationsPage() {
  await requireAdmin();
  const repo = new DestinationAdminRepository();
  const dests = await repo.list();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Destinations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Regions tours belong to (Ha Giang, Cao Bang…).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {dests.map((d) => (
          <Card key={d.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="font-serif text-lg">{d.name}</CardTitle>
              <form
                action={deleteDestination}
              >
                <input type="hidden" name="id" value={d.id} />
                <Button type="submit" variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </CardHeader>
            <CardContent>
              <form
                action={saveDestination}
                className="space-y-3"
              >
                <input type="hidden" name="id" value={d.id} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input name="name" defaultValue={d.name} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <Input name="slug" defaultValue={d.slug} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Tagline</Label>
                  <Input name="tagline" defaultValue={d.tagline ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    name="description"
                    defaultValue={d.description ?? ""}
                    rows={3}
                  />
                </div>
                <Button type="submit" size="sm">
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}

        {/* New */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">
              <Plus className="mr-1 inline h-4 w-4" /> Add destination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={saveDestination}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input name="name" required placeholder="Cao Bang" />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input name="slug" required placeholder="cao-bang" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Tagline</Label>
                <Input name="tagline" placeholder="Waterfalls, caves…" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea name="description" rows={3} />
              </div>
              <Button type="submit" size="sm">
                Add
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
