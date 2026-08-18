import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/admin/auth";
import { PromoAdminRepository, promoInputSchema } from "@/lib/admin/content";
import { formatVnd } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Promotions" };

export default async function AdminPromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();
  const { edit } = await searchParams;
  const repo = new PromoAdminRepository();
  const promos = await repo.list();
  const editing = edit ? promos.find((p) => p.id === edit) : null;
  if (edit && !editing) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Promotions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discount codes applied at booking.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">
              {editing ? "Edit promo" : "New promo"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                "use server";
                const parsed = promoInputSchema.safeParse({
                  code: formData.get("code"),
                  discountType: formData.get("discountType"),
                  discountValue: formData.get("discountValue"),
                  minSubtotal: formData.get("minSubtotal") || null,
                  maxRedemptions: formData.get("maxRedemptions") || null,
                  expiresAt: formData.get("expiresAt") || null,
                  active: formData.get("active") === "on",
                });
                if (!parsed.success) return;
                if (editing) {
                  await repo.update(editing.id, parsed.data);
                } else {
                  await repo.create(parsed.data);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input
                    name="code"
                    defaultValue={editing?.code ?? ""}
                    required
                    className="font-mono uppercase"
                    placeholder="SUMMER10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    name="discountType"
                    defaultValue={editing?.discountType ?? "percent"}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed (VND)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    name="discountValue"
                    type="number"
                    defaultValue={editing?.discountValue ?? 10}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min subtotal</Label>
                  <Input
                    name="minSubtotal"
                    type="number"
                    defaultValue={editing?.minSubtotal ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max redemptions</Label>
                  <Input
                    name="maxRedemptions"
                    type="number"
                    defaultValue={editing?.maxRedemptions ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expires</Label>
                  <Input
                    name="expiresAt"
                    type="date"
                    defaultValue={
                      editing?.expiresAt
                        ? new Date(editing.expiresAt).toISOString().slice(0, 10)
                        : ""
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  name="active"
                  defaultChecked={editing?.active ?? true}
                  id="active"
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex gap-3">
                <Button type="submit">
                  {editing ? "Save" : "Create"}
                </Button>
                {editing && (
                  <a
                    href="/admin/promotions"
                    className="inline-flex h-10 items-center rounded-full border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    Cancel
                  </a>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-serif text-lg text-foreground">All promos</h2>
          </div>
          <div className="divide-y divide-border">
            {promos.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No promos yet.
              </p>
            )}
            {promos.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-medium text-foreground">
                    {p.code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.discountType === "percent"
                      ? `${p.discountValue}% off`
                      : `${formatVnd(p.discountValue)} off`}
                    {p.minSubtotal ? ` · min ${formatVnd(p.minSubtotal)}` : ""}
                    {p.maxRedemptions
                      ? ` · ${p.redemptions}/${p.maxRedemptions} used`
                      : ""}
                  </p>
                </div>
                <Badge variant={p.active ? "solid" : "outline"}>
                  {p.active ? "Active" : "Inactive"}
                </Badge>
                <div className="flex gap-2">
                  <a
                    href={`/admin/promotions?edit=${p.id}`}
                    className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Edit
                  </a>
                  <form
                    action={async () => {
                      "use server";
                      await repo.delete(p.id);
                    }}
                  >
                    <Button type="submit" variant="ghost" size="sm">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
