import { requireAdmin } from "@/lib/admin/auth";
import { SettingsAdminRepository, settingsInputSchema } from "@/lib/admin/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const repo = new SettingsAdminRepository();
  const s = await repo.get();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Business configuration used by pricing + public site. Changes apply
          to new bookings immediately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              const parsed = settingsInputSchema.safeParse({
                depositPercent: formData.get("depositPercent"),
                vatPercent: formData.get("vatPercent"),
                cardFeePercent: formData.get("cardFeePercent"),
                supportPhone: formData.get("supportPhone") || undefined,
                supportZalo: formData.get("supportZalo") || undefined,
                supportEmail: formData.get("supportEmail") || undefined,
                companyName: formData.get("companyName") || undefined,
                companyAddress: formData.get("companyAddress") || undefined,
                companyTaxId: formData.get("companyTaxId") || undefined,
                companyWebsite: formData.get("companyWebsite") || undefined,
              });
              if (!parsed.success) return;
              await repo.update(parsed.data);
            }}
            className="space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Deposit %</Label>
                <Input
                  name="depositPercent"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={s?.depositPercent ?? 30}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Deposit charged at booking (30 = 30%)
                </p>
              </div>
              <div className="space-y-2">
                <Label>VAT %</Label>
                <Input
                  name="vatPercent"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={s?.vatPercent ?? 8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Card fee %</Label>
                <Input
                  name="cardFeePercent"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={s?.cardFeePercent ?? 4}
                  required
                />
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="mb-4 font-serif text-lg text-foreground">Contact</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Support phone</Label>
                  <Input name="supportPhone" defaultValue={s?.supportPhone ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label>Zalo number</Label>
                  <Input name="supportZalo" defaultValue={s?.supportZalo ?? ""} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Support email</Label>
                  <Input
                    name="supportEmail"
                    type="email"
                    defaultValue={s?.supportEmail ?? ""}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="mb-4 font-serif text-lg text-foreground">Company</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company name</Label>
                  <Input name="companyName" defaultValue={s?.companyName ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label>Tax ID</Label>
                  <Input name="companyTaxId" defaultValue={s?.companyTaxId ?? ""} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>
                  <Input name="companyAddress" defaultValue={s?.companyAddress ?? ""} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Website</Label>
                  <Input name="companyWebsite" defaultValue={s?.companyWebsite ?? ""} />
                </div>
              </div>
            </div>

            <Button type="submit">Save settings</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
