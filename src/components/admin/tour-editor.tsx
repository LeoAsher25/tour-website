"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import type { Tour } from "@/types/domain";
import { tourInputSchema } from "@/lib/admin/tour-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatVnd } from "@/lib/pricing";

interface DestinationOption {
  id: string;
  slug: string;
  name: string;
}

interface VariantDraft {
  id?: string;
  name: string;
  description?: string;
  priceType: "per_person" | "per_group";
  basePrice: number;
  maxGroupSize?: number;
  attrs?: Record<string, string>;
}

interface AddOnDraft {
  id?: string;
  name: string;
  description?: string;
  price: number;
  perPerson: boolean;
}

interface ImageDraft {
  id?: string;
  storageKey: string;
  alt?: string;
}

interface ItineraryDayDraft {
  id?: string;
  dayNumber: number;
  title: string;
  summary: string;
  stops: { id?: string; title: string; time?: string; description: string }[];
}

interface FaqDraft {
  id?: string;
  question: string;
  answer: string;
}

export function TourEditor({
  tour,
  destinations,
}: {
  tour: Tour | null;
  destinations: DestinationOption[];
}) {
  const router = useRouter();
  const isEdit = !!tour;

  const [title, setTitle] = useState(tour?.title ?? "");
  const [slug, setSlug] = useState(tour?.slug ?? "");
  const [subtitle, setSubtitle] = useState(tour?.subtitle ?? "");
  const [description, setDescription] = useState(tour?.description ?? "");
  const [overview, setOverview] = useState(tour?.overview ?? "");
  const [destinationId, setDestinationId] = useState(
    tour
      ? destinations.find((d) => d.slug === tour.destinationSlug)?.id ?? ""
      : (destinations[0]?.id ?? "")
  );
  const [startLocation, setStartLocation] = useState(tour?.startLocation ?? "");
  const [endLocation, setEndLocation] = useState(tour?.endLocation ?? "");
  const [durationDays, setDurationDays] = useState(tour?.durationDays ?? 3);
  const [durationNights, setDurationNights] = useState(
    tour?.durationNights ?? 2
  );
  const [difficulty, setDifficulty] = useState(tour?.difficulty ?? "easy");
  const [groupSize, setGroupSize] = useState(tour?.groupSize ?? "");
  const [vehicle, setVehicle] = useState(tour?.vehicle ?? "");
  const [suitableFor, setSuitableFor] = useState(tour?.suitableFor ?? "");
  const [rating, setRating] = useState(tour?.rating ?? 0);
  const [reviewCount, setReviewCount] = useState(tour?.reviewCount ?? 0);
  const [fromPrice, setFromPrice] = useState(tour?.fromPrice ?? 0);
  const [highlights, setHighlights] = useState<string[]>(tour?.highlights ?? []);
  const [included, setIncluded] = useState<string[]>(tour?.included ?? []);
  const [excluded, setExcluded] = useState<string[]>(tour?.excluded ?? []);
  const [accommodation] = useState(tour?.accommodation ?? "");
  const [transportation] = useState(tour?.transportation ?? "");
  const [meals] = useState(tour?.meals ?? "");
  const [bookingMode, setBookingMode] = useState(
    (tour?.bookingMode as "scheduled" | "flexible") ?? "flexible"
  );
  const [status, setStatus] = useState(tour?.published ? "published" : "draft");
  const [featured, setFeatured] = useState(tour?.featured ?? false);
  const [seoTitle, setSeoTitle] = useState(tour?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    tour?.seoDescription ?? ""
  );

  // Children
  const [variants, setVariants] = useState<VariantDraft[]>(
    tour?.variants ?? []
  );
  const [addOns, setAddOns] = useState<AddOnDraft[]>(tour?.addOns ?? []);
  const [images] = useState<ImageDraft[]>(
    tour?.images.map((i) => ({
      id: i.id,
      storageKey: i.url, // display URL in admin; converted on submit
      alt: i.alt,
    })) ?? []
  );
  const [itinerary, setItinerary] = useState<ItineraryDayDraft[]>(
    tour?.itinerary ?? []
  );
  const [faqs, setFaqs] = useState<FaqDraft[]>(tour?.faqs ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayPrice = useMemo(
    () => formatVnd(fromPrice || 0),
    [fromPrice]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Convert display image URLs back to storage keys.
    const imageInputs = images
      .map((img) => {
        const key = keyFromUrl(img.storageKey);
        return key ? { storageKey: key, alt: img.alt } : null;
      })
      .filter(Boolean) as { storageKey: string; alt?: string }[];

    const payload = {
      title,
      slug,
      subtitle,
      description,
      overview,
      destinationId,
      startLocation,
      endLocation,
      durationDays,
      durationNights,
      difficulty,
      groupSize,
      vehicle,
      suitableFor,
      rating,
      reviewCount,
      fromPrice,
      highlights,
      included,
      excluded,
      accommodation,
      transportation,
      meals,
      itinerary,
      faqs,
      bookingMode,
      status,
      featured,
      seoTitle,
      seoDescription,
      variants,
      addOns,
      images: imageInputs,
    };

    const parsed = tourInputSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(
        isEdit ? `/api/admin/tours/${tour!.id}` : "/api/admin/tours",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to save tour");
        setSaving(false);
        return;
      }
      const saved = await res.json();
      router.push(`/admin/tours/${saved.id}/edit`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message ?? "Failed to save tour");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Basic */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Basic info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" required>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!isEdit && !slug) {
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "")
                  );
                }
              }}
              required
            />
          </Field>
          <Field label="Slug" required>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
            />
          </Field>
          <Field label="Subtitle">
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </Field>
          <Field label="Destination" required>
            <Select value={destinationId} onValueChange={(v) => setDestinationId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Start location">
            <Input value={startLocation} onChange={(e) => setStartLocation(e.target.value)} />
          </Field>
          <Field label="End location">
            <Input value={endLocation} onChange={(e) => setEndLocation(e.target.value)} />
          </Field>
          <Field label="Duration (days)">
            <Input
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
            />
          </Field>
          <Field label="Duration (nights)">
            <Input
              type="number"
              value={durationNights}
              onChange={(e) => setDurationNights(Number(e.target.value))}
            />
          </Field>
          <Field label="Difficulty">
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v ?? "easy")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["easy", "moderate", "challenging", "expert"].map((d) => (
                  <SelectItem key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Group size">
            <Input value={groupSize} onChange={(e) => setGroupSize(e.target.value)} />
          </Field>
          <Field label="Vehicle">
            <Input value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
          </Field>
          <Field label="Suitable for">
            <Input value={suitableFor} onChange={(e) => setSuitableFor(e.target.value)} />
          </Field>
          <Field label="From price (VND)">
            <Input
              type="number"
              value={fromPrice}
              onChange={(e) => setFromPrice(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{displayPrice}</p>
          </Field>
          <Field label="Rating">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </Field>
          <Field label="Review count">
            <Input
              type="number"
              value={reviewCount}
              onChange={(e) => setReviewCount(Number(e.target.value))}
            />
          </Field>
          <Field label="Booking mode">
            <Select value={bookingMode} onValueChange={(v) => setBookingMode(v as "scheduled" | "flexible")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled (departures required)</SelectItem>
                <SelectItem value="flexible">Flexible (any date)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={status} onValueChange={(v) => setStatus(v ?? "draft")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Featured">
            <Checkbox
              checked={featured}
              onCheckedChange={(v) => setFeatured(Boolean(v))}
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </Field>
          <Field label="Overview" className="sm:col-span-2">
            <Textarea
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              rows={3}
            />
          </Field>
        </CardContent>
      </Card>

      {/* Highlights / Included / Excluded */}
      <ListEditor
        title="Highlights"
        items={highlights}
        onChange={setHighlights}
        placeholder="Ma Pi Leng — Vietnam's most dramatic pass"
      />
      <ListEditor title="Included" items={included} onChange={setIncluded} />
      <ListEditor title="Excluded" items={excluded} onChange={setExcluded} />

      {/* Variants */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="font-serif text-xl">Variants / pricing</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setVariants([
                ...variants,
                { name: "", priceType: "per_person", basePrice: 0 },
              ])
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add variant
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No variants yet — add at least one for booking.
            </p>
          )}
          {variants.map((v, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <Input
                placeholder="Name (e.g. Self-Riding)"
                value={v.name}
                onChange={(e) =>
                  setVariants(
                    variants.map((x, j) => (j === i ? { ...x, name: e.target.value } : x))
                  )
                }
              />
              <Select
                value={v.priceType}
                onValueChange={(val) =>
                  setVariants(
                    variants.map((x, j) =>
                      j === i ? { ...x, priceType: val as "per_person" | "per_group" } : x
                    )
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_person">Per person</SelectItem>
                  <SelectItem value="per_group">Per group</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Base price (VND)"
                value={v.basePrice}
                onChange={(e) =>
                  setVariants(
                    variants.map((x, j) => (j === i ? { ...x, basePrice: Number(e.target.value) } : x))
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setVariants(variants.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add-ons */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="font-serif text-xl">Add-ons</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setAddOns([...addOns, { name: "", price: 0, perPerson: false }])
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add add-on
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {addOns.map((a, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                placeholder="Name (e.g. Private room)"
                value={a.name}
                onChange={(e) =>
                  setAddOns(addOns.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                }
              />
              <Input
                type="number"
                placeholder="Price (VND)"
                value={a.price}
                onChange={(e) =>
                  setAddOns(addOns.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)))
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setAddOns(addOns.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Itinerary */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="font-serif text-xl">Itinerary</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setItinerary([
                ...itinerary,
                { dayNumber: itinerary.length + 1, title: "", summary: "", stops: [] },
              ])
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add day
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {itinerary.map((day, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
                <Input
                  type="number"
                  className="w-20"
                  value={day.dayNumber}
                  onChange={(e) =>
                    setItinerary(
                      itinerary.map((x, j) =>
                        j === i ? { ...x, dayNumber: Number(e.target.value) } : x
                      )
                    )
                  }
                />
                <Input
                  placeholder="Day title (e.g. Ha Giang — Yen Minh)"
                  value={day.title}
                  onChange={(e) =>
                    setItinerary(
                      itinerary.map((x, j) => (j === i ? { ...x, title: e.target.value } : x))
                    )
                  }
                />
              </div>
              <Textarea
                className="mt-3"
                placeholder="Summary"
                rows={2}
                value={day.summary}
                onChange={(e) =>
                  setItinerary(
                    itinerary.map((x, j) => (j === i ? { ...x, summary: e.target.value } : x))
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() =>
                  setItinerary(
                    itinerary.map((x, j) =>
                      j === i
                        ? { ...x, stops: [...x.stops, { title: "", description: "" }] }
                        : x
                    )
                  )
                }
              >
                <Plus className="mr-1 h-4 w-4" /> Add stop
              </Button>
              {day.stops.map((stop, k) => (
                <div key={k} className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <Input
                    placeholder="Stop title"
                    value={stop.title}
                    onChange={(e) =>
                      setItinerary(
                        itinerary.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                stops: x.stops.map((s, l) =>
                                  l === k ? { ...s, title: e.target.value } : s
                                ),
                              }
                            : x
                        )
                      )
                    }
                  />
                  <Input
                    placeholder="Description"
                    value={stop.description}
                    onChange={(e) =>
                      setItinerary(
                        itinerary.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                stops: x.stops.map((s, l) =>
                                  l === k ? { ...s, description: e.target.value } : s
                                ),
                              }
                            : x
                        )
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setItinerary(
                        itinerary.map((x, j) =>
                          j === i
                            ? { ...x, stops: x.stops.filter((_, l) => l !== k) }
                            : x
                        )
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 text-destructive"
                onClick={() => setItinerary(itinerary.filter((_, j) => j !== i))}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Remove day
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="font-serif text-xl">FAQs</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
          >
            <Plus className="mr-1 h-4 w-4" /> Add FAQ
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Input
                  placeholder="Question"
                  value={f.question}
                  onChange={(e) =>
                    setFaqs(faqs.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))
                  }
                />
                <Textarea
                  placeholder="Answer"
                  rows={2}
                  value={f.answer}
                  onChange={(e) =>
                    setFaqs(faqs.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFaqs(faqs.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="SEO title">
            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
          </Field>
          <Field label="SEO description">
            <Textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/tours")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create tour"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ListEditor({
  title,
  items,
  onChange,
  placeholder,
}: {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="font-serif text-xl">{title}</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, ""])}
        >
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={item}
              placeholder={placeholder}
              onChange={(e) =>
                onChange(items.map((x, j) => (j === i ? e.target.value : x)))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Derive a storage key from a public URL (mirrors server helper). */
function keyFromUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/media/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url
    .slice(idx + marker.length)
    .split("/")
    .map((s) => decodeURIComponent(s))
    .join("/");
}
