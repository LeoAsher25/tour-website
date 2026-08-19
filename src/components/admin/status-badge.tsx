import { cn } from "@/lib/utils";

/**
 * Shared status badge — semantic colors for booking/payment/tour states.
 * Consistent across all admin tables and detail views.
 */
export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info"
  | "accent";

const TONE_STYLES: Record<StatusTone, string> = {
  success: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-accent-tint text-accent-hover border-accent/25",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-primary/5 text-foreground border-border",
  accent: "bg-accent/10 text-accent-hover border-accent/25",
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
  dot,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
  /** Show a leading status dot. */
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em]",
        TONE_STYLES[tone],
        className
      )}
    >
      {dot && (
        <span
          aria-hidden
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "success" && "bg-primary",
            tone === "warning" && "bg-accent",
            tone === "danger" && "bg-destructive",
            tone === "neutral" && "bg-muted-foreground/50",
            tone === "info" && "bg-foreground/40",
            tone === "accent" && "bg-accent"
          )}
        />
      )}
      {children}
    </span>
  );
}

/** Booking status → tone mapping (shared by list + detail). */
export function bookingStatusTone(
  status: string
): StatusTone {
  switch (status) {
    case "confirmed":
    case "completed":
      return "success";
    case "pending":
      return "neutral";
    case "awaiting_payment":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

/** Payment status → tone mapping. */
export function paymentStatusTone(status: string): StatusTone {
  switch (status) {
    case "paid":
      return "success";
    case "processing":
      return "warning";
    case "failed":
    case "refunded":
      return "danger";
    case "pending":
      return "neutral";
    default:
      return "neutral";
  }
}

/** Human-readable label (replace underscores with spaces, capitalize). */
export function statusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
