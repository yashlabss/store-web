export type MeetingLocationType = "GOOGLE_MEET" | "ZOOM" | "CUSTOM" | "IN_PERSON";

export type StoredBooking = {
  id: string;
  coachId: string;
  clientName: string;
  clientEmail: string;
  sessionType: string;
  startTime: string;
  endTime: string;
  status: "confirmed";
  meetingLocation: MeetingLocationType;
  meetLink?: string;
  googleEventId?: string;
  createdAt: string;
};

const bookings: StoredBooking[] = [];

export function saveBooking(
  booking: Omit<StoredBooking, "id" | "createdAt" | "status"> & { status?: "confirmed" }
): StoredBooking {
  const next: StoredBooking = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `booking-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: booking.status || "confirmed",
    ...booking,
  };
  bookings.push(next);
  return next;
}
