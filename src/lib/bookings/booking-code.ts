import "server-only";

import crypto from "crypto";

// Human-readable, non-sequential booking code.
// Format: JAS-XXXXXX (uppercase, unambiguous alphabet).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I/L/O/0/1

/**
 * Generate a unique booking code. Collision-resistance is handled by the
 * caller retrying on Firestore "already exists" (bookings are keyed by code).
 */
export function generateBookingCode(): string {
  const bytes = crypto.randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `JAS-${code}`;
}
