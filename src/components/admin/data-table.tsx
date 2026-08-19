import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import { cn } from "@/lib/utils";

/**
 * Shared admin filter bar — consistent search + selects + submit across all
 * list pages. Renders inside a soft card with `items-end` alignment so the
 * inputs and button align on one baseline.
 */
export function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3",
        className
      )}
    >
      {children}
    </form>
  );
}

/** Search input with icon, for use inside FilterBar. */
export function FilterSearch({
  name,
  defaultValue,
  placeholder,
  className,
}: {
  name: string;
  defaultValue?: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-[200px] flex-1", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
      <Input name={name} defaultValue={defaultValue} placeholder={placeholder} className="pl-9" />
    </div>
  );
}

/** Labeled select for use inside FilterBar. */
export function FilterSelect({
  name,
  defaultValue,
  label,
  options,
  className,
}: {
  name: string;
  defaultValue?: string;
  label: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <SelectNative name={name} defaultValue={defaultValue ?? ""}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectNative>
    </div>
  );
}

export function FilterSubmit() {
  return (
    <button
      type="submit"
      className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      Lọc
    </button>
  );
}

/** "Clear filters" link shown when a filter is active. */
export function ClearFilters({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent"
    >
      <X className="h-3.5 w-3.5" />
      Xoá bộ lọc
    </a>
  );
}

/**
 * Shared table shell — rounded card + overflow-x-auto so wide tables scroll
 * on mobile instead of breaking the layout.
 */
export function DataTableCard({
  children,
  header,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {header && (
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          {header}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

/** Empty state row for tables. */
export function EmptyState({
  colSpan,
  title,
  description,
  action,
}: {
  colSpan: number;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <p className="font-serif text-lg text-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </td>
    </tr>
  );
}
