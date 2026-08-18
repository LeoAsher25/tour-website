import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  id?: string;
  /** Add a hard transition edge (rounded top corners) to bridge into the next section. */
  bleed?: boolean;
}

/** Full-width section with consistent vertical rhythm. */
export function Section({
  children,
  className,
  dark = false,
  id,
  bleed = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 lg:py-28",
        dark ? "bg-dark-bg text-dark-text" : "bg-background text-foreground",
        bleed &&
          (dark
            ? "rounded-b-[2.5rem] rounded-t-[2.5rem]"
            : "rounded-b-[2.5rem] rounded-t-[2.5rem]"),
        className
      )}
    >
      {children}
    </section>
  );
}
