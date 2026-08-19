import { getPublishedTours } from "@/lib/repository";
import { BookingSection } from "./booking-section";

/** Server wrapper — fetches tours from Postgres and passes to client section. */
export async function BookingSectionServer() {
  const tours = await getPublishedTours();
  return <BookingSection tours={tours} />;
}
