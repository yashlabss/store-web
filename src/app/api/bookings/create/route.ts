import { NextRequest, NextResponse } from "next/server";
import { createGoogleMeetEvent } from "../../../../lib/google-meet";
import { createZoomMeeting } from "../../../../lib/zoom-meeting";
import {
  getGoogleTokens,
  hasValidGoogleCredentialTokens,
  upsertGoogleTokens,
} from "../../../../lib/server/googleTokenStore";
import {
  getZoomTokens,
  hasValidZoomCredentialTokens,
  upsertZoomTokens,
} from "../../../../lib/server/zoomTokenStore";
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

  let meetLink: string | null = null;
  let eventId: string | null = null;
  let coachEmail: string | null = null;

  if (meetingLocation === "GOOGLE_MEET") {
    const tokenRecord = getGoogleTokens(coachId);
    if (!hasValidGoogleCredentialTokens(tokenRecord)) {
      return NextResponse.json(
        {
          message:
            "Coach has not connected Google Calendar, or saved credentials are incomplete. Open Availability, use Connect Google Calendar again, then retry.",
        },
        { status: 409 }
      );
    }
    const created = await createGoogleMeetEvent({
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
    meetLink = created.meetLink;
    eventId = created.eventId;
    coachEmail = tokenRecord.email || null;
  } else if (meetingLocation === "ZOOM") {
    const zoomRecord = getZoomTokens(coachId);
    if (!hasValidZoomCredentialTokens(zoomRecord)) {
      return NextResponse.json(
        {
          message:
            "Coach has not connected Zoom, or saved credentials are incomplete. Open Availability, use Connect Zoom again, then retry.",
        },
        { status: 409 }
      );
    }
    const durationMinutes = Math.max(
      1,
      Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)
    );
    const created = await createZoomMeeting({
      coachAccessToken: zoomRecord.accessToken,
      coachRefreshToken: zoomRecord.refreshToken,
      topic: `${sessionType} with ${clientName}`,
      startTime,
      durationMinutes,
      timezone: "UTC",
      agenda: description,
      onTokenRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
        upsertZoomTokens(coachId, {
          accessToken: accessToken || null,
          refreshToken: refreshToken || zoomRecord.refreshToken,
          expiryDate: expiryDate ?? null,
          email: zoomRecord.email || null,
          accountId: zoomRecord.accountId || null,
        });
      },
    });
    meetLink = created.joinUrl;
    eventId = created.meetingId;
    coachEmail = zoomRecord.email || null;
  }

  const booking = saveBooking({
    coachId,
    clientName,
    clientEmail,
    sessionType,
    startTime,
    endTime,
    meetingLocation,
    meetLink: meetLink || undefined,
    googleEventId: meetingLocation === "GOOGLE_MEET" ? eventId || undefined : undefined,
  });

  const emailResult = await sendBookingConfirmationEmails({
    coachEmail,
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
    zoomMeetingId: meetingLocation === "ZOOM" ? eventId : null,
    emailSent: emailResult.sent,
    ...(emailResult.sent === false ? { emailNote: emailResult.reason } : {}),
  });
}
