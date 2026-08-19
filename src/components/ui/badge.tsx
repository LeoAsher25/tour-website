import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-[0.14em] uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-muted-foreground",
        accent: "border-accent/25 bg-accent-tint text-accent-hover",
        primary: "border-primary/25 bg-primary/10 text-primary",
        solid: "bg-primary text-primary-foreground border-transparent",
        dark: "border-dark-bg/15 bg-dark-bg text-dark-text",
        outline: "border-border bg-transparent text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }
