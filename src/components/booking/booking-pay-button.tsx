"use client";

import { useState } from "react";
import { Loader2, Wallet } from "lucide-react";

/**
 * "Pay now" button — creates a VNPay payment URL for a pending booking and
 * redirects the user to the gateway. Lives in a client component so it can
 * use onClick (server components cannot receive event handlers).
 */
export function BookingPayButton({ bookingCode }: { bookingCode: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/vnpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start payment. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 text-sm font-medium text-accent-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting payment…
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Pay now
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
