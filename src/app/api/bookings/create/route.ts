import { NextRequest, NextResponse } from "next/server";
import { createGoogleMeetEvent } from "../../../../lib/google-meet";
import { getGoogleTokens, upsertGoogleTokens } from "../../../../lib/server/googleTokenStore";
import { saveBooking, type MeetingLocationType } from "../../../../lib/server/bookingStore";
import { sendBookingConfirmationEmails } from "../../../../lib/server/notifications";

type CreateBookingBody = {
  coachId?: string;
  clientName?: string;
  clientEmail?: string;
  startTime?: string;
  endTime?: string;
  sessionType?: string;
  meetingLocation?: MeetingLocationType;
  description?: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as CreateBookingBody;
  const {
    coachId = "",
    clientName = "",
    clientEmail = "",
    startTime = "",
    endTime = "",
    sessionType = "Coaching Session",
    description = "",
    meetingLocation = "GOOGLE_MEET",
  } = body;

  if (!coachId || !clientName || !clientEmail || !startTime || !endTime) {
    return NextResponse.json({ message: "coachId, clientName, clientEmail, startTime and endTime are required." }, { status: 400 });
  }

  const tokenRecord = getGoogleTokens(coachId);
  if (!tokenRecord?.connected || !tokenRecord.accessToken || !tokenRecord.refreshToken) {
    return NextResponse.json(
      { message: "Coach has not connected Google Calendar." },
      { status: 409 }
    );
  }

  const { meetLink, eventId } = await createGoogleMeetEvent({
    coachAccessToken: tokenRecord.accessToken,
    coachRefreshToken: tokenRecord.refreshToken,
    summary: `${sessionType} with ${clientName}`,
    startTime,
    endTime,
    attendeeEmails: [tokenRecord.email || "", clientEmail].filter(Boolean),
    description,
    onTokenRefresh: async ({ accessToken, expiryDate }) => {
      upsertGoogleTokens(coachId, {
        accessToken: accessToken || null,
        refreshToken: tokenRecord.refreshToken,
        expiryDate: expiryDate ?? null,
        email: tokenRecord.email || null,
      });
    },
  });

  const booking = saveBooking({
    coachId,
    clientName,
    clientEmail,
    sessionType,
    startTime,
    endTime,
    meetingLocation,
    meetLink: meetLink || undefined,
    googleEventId: eventId || undefined,
  });

  const emailResult = await sendBookingConfirmationEmails({
    coachEmail: tokenRecord.email || null,
    clientEmail,
    clientName,
    meetLink: meetLink || undefined,
    startTime,
    endTime,
    sessionType,
  });

  return NextResponse.json({
    status: "confirmed",
    bookingId: booking.id,
    meetLink: booking.meetLink || null,
    googleEventId: booking.googleEventId || null,
    emailSent: emailResult.sent,
    ...(emailResult.sent === false ? { emailNote: emailResult.reason } : {}),
  });
}
