import { NextRequest, NextResponse } from "next/server";
import { createGoogleMeetEvent } from "../../../../lib/google-meet";
import {
  getGoogleTokens,
  hasValidGoogleCredentialTokens,
  upsertGoogleTokens,
} from "../../../../lib/server/googleTokenStore";
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
    const backendBase =
      process.env.BACKEND_URL?.trim() ||
      process.env.INTERNAL_API_URL?.trim() ||
      "http://127.0.0.1:5000";
    const zoomRes = await fetch(`${backendBase.replace(/\/$/, "")}/api/public/coaching/zoom-meeting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coach_username: coachId,
        start_time: startTime,
        end_time: endTime,
        topic: `${sessionType} with ${clientName}`,
        agenda: description,
      }),
    });
    const zoomJson = (await zoomRes.json().catch(() => ({}))) as {
      meetLink?: string | null;
      zoomMeetingId?: string | null;
      message?: string;
      error?: string;
    };
    if (!zoomRes.ok) {
      return NextResponse.json(
        {
          message:
            typeof zoomJson.message === "string" && zoomJson.message.trim()
              ? zoomJson.message.trim()
              : "Coach has not connected Zoom or meeting creation failed. The seller should connect Zoom in the dashboard, then retry.",
        },
        { status: zoomRes.status >= 400 && zoomRes.status < 600 ? zoomRes.status : 502 }
      );
    }
    meetLink = zoomJson.meetLink != null ? String(zoomJson.meetLink) : null;
    eventId =
      zoomJson.zoomMeetingId != null && String(zoomJson.zoomMeetingId).trim()
        ? String(zoomJson.zoomMeetingId).trim()
        : null;
    coachEmail = null;
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
