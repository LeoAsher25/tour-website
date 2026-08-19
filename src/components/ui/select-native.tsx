import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Native <select> styled to match the admin Input/Select primitives.
 * Used for simple option lists where the base-ui Select overlay is overkill
 * (filters, forms) — keeps size/radius/focus consistent with Input (h-10,
 * rounded-lg).
 */
function SelectNative({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className={cn("relative", className)}>
      <select
        data-slot="select-native"
        className={cn(
          "h-10 w-full min-w-0 appearance-none rounded-lg border border-input bg-background pr-9 pl-3 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

export { SelectNative }
