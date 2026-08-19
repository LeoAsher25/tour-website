import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string;
  className?: string;
  dark?: boolean;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
  dark = false,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-5",
        align === "center" && "mx-auto max-w-2xl text-center",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em]",
            dark ? "text-accent-tint" : "text-accent",
            align === "center" && "justify-center"
          )}
        >
          {align !== "center" && <span className="h-px w-8 bg-accent/60" />}
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-serif text-[2.5rem] leading-[1.03] tracking-tight sm:text-6xl",
          dark ? "text-dark-text" : "text-foreground"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-base font-light leading-8 sm:text-lg",
            dark ? "text-dark-muted" : "text-muted-foreground",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
