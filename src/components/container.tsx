import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

/** Max-width editorial container with responsive gutters. */
export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 md:pb-15",
        className,
      )}>
      {children}
    </div>
  );
}
