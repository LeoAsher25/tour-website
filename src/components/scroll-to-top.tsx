"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Chỉ cập nhật state khi qua mốc để tránh re-render thừa
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={cn(
        // Định vị fixed cố định hoàn toàn
        "fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg sm:bottom-8 sm:right-8 sm:h-14 sm:w-14",
        // CSS Transition hiện đại: Hiện đều 100% không phụ thuộc vào JS animation
        "transition duration-300 ease-linear",
        // Điều khiển ẩn / hiện bằng opacity và pointer-events
        isVisible
          ? "opacity-50 hover:opacity-100 -translate-y-4 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
      )}>
      <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
}
