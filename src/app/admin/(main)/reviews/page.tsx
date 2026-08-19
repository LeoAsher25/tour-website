import { Plus, Trash2 } from "lucide-react";

import { requireAdmin } from "@/lib/admin/auth";
import { ReviewAdminRepository, reviewInputSchema } from "@/lib/admin/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  await requireAdmin();
  const repo = new ReviewAdminRepository();
  const reviews = await repo.list();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Testimonials shown on the homepage.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {reviews.map((r) => (
          <Card key={r.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="font-serif text-lg">
                {r.name} · {"★".repeat(r.rating)}
                {r.published ? (
                  <Badge variant="solid" className="ml-2">Live</Badge>
                ) : (
                  <Badge variant="outline" className="ml-2">Hidden</Badge>
                )}
              </CardTitle>
              <form
                action={async () => {
                  "use server";
                  await repo.delete(r.id);
                }}
              >
                <Button type="submit" variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const parsed = reviewInputSchema.safeParse({
                    name: formData.get("name"),
                    rating: formData.get("rating"),
                    trip: formData.get("trip") || undefined,
                    quote: formData.get("quote"),
                    date: formData.get("date") || undefined,
                    published: formData.get("published") === "on",
                  });
                  if (!parsed.success) return;
                  await repo.update(r.id, parsed.data);
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input name="name" defaultValue={r.name} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Rating</Label>
                    <Input
                      name="rating"
                      type="number"
                      min={1}
                      max={5}
                      defaultValue={r.rating}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input
                      name="date"
                      type="date"
                      defaultValue={r.date ? String(r.date).slice(0, 10) : ""}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Trip</Label>
                  <Input name="trip" defaultValue={r.trip ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label>Quote</Label>
                  <Textarea name="quote" defaultValue={r.quote} rows={2} required />
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox name="published" defaultChecked={r.published} id={`pub-${r.id}`} />
                  <Label htmlFor={`pub-${r.id}`}>Show on site</Label>
                  <Button type="submit" size="sm" className="ml-auto">
                    Save
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}

        {/* New */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">
              <Plus className="mr-1 inline h-4 w-4" /> Add review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                "use server";
                const parsed = reviewInputSchema.safeParse({
                  name: formData.get("name"),
                  rating: formData.get("rating"),
                  trip: formData.get("trip") || undefined,
                  quote: formData.get("quote"),
                  date: formData.get("date") || undefined,
                  published: formData.get("published") === "on",
                });
                if (!parsed.success) return;
                await repo.create(parsed.data);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input name="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Rating</Label>
                  <Input name="rating" type="number" min={1} max={5} defaultValue={5} />
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input name="date" type="date" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Trip</Label>
                <Input name="trip" />
              </div>
              <div className="space-y-1.5">
                <Label>Quote</Label>
                <Textarea name="quote" rows={2} required />
              </div>
              <div className="flex items-center gap-3">
                <Checkbox name="published" defaultChecked id="new-pub" />
                <Label htmlFor="new-pub">Show on site</Label>
                <Button type="submit" size="sm" className="ml-auto">
                  Add
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
