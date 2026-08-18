import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-foreground shadow-md hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-lg",
        primary:
          "bg-primary text-primary-foreground shadow-md hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg",
        outline:
          "border-border bg-surface/60 text-foreground hover:border-primary hover:text-primary hover:-translate-y-0.5",
        "outline-light":
          "border-dark-text/25 bg-transparent text-dark-text hover:border-dark-text hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
        ghost:
          "text-foreground hover:bg-muted hover:text-accent",
        "ghost-light":
          "text-dark-text/90 hover:bg-dark-text/10 hover:text-dark-text",
        link: "text-primary underline-offset-4 hover:underline",
        "link-light":
          "text-dark-text underline-offset-4 hover:text-accent-tint hover:underline",
      },
      size: {
        default: "h-11 px-6 gap-2",
        sm: "h-9 px-4 gap-1.5 text-[0.85rem]",
        lg: "h-12 px-8 gap-2 text-[0.95rem]",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
