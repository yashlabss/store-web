import { google } from "googleapis";

type CreateMeetEventParams = {
  coachAccessToken: string;
  coachRefreshToken: string;
  summary: string;
  startTime: string;
  endTime: string;
  attendeeEmails: string[];
  description?: string;
  onTokenRefresh?: (next: { accessToken?: string | null; expiryDate?: number | null }) => Promise<void> | void;
};

export async function createGoogleMeetEvent(params: CreateMeetEventParams) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({
    access_token: params.coachAccessToken,
    refresh_token: params.coachRefreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth });

  const requestBody = {
    summary: params.summary,
    description: params.description || "",
    start: { dateTime: params.startTime, timeZone: "UTC" },
    end: { dateTime: params.endTime, timeZone: "UTC" },
    attendees: params.attendeeEmails.map((email) => ({ email })),
    conferenceData: {
      createRequest: {
        requestId: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        conferenceSolutionKey: { type: "hangoutsMeet" as const },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email" as const, minutes: 60 },
        { method: "popup" as const, minutes: 15 },
      ],
    },
  };

  const runInsert = async () =>
    calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody,
    });

  try {
    const event = await runInsert();
    const meetLink = event.data.conferenceData?.entryPoints?.[0]?.uri || null;
    const eventId = event.data.id || null;
    return { meetLink, eventId };
  } catch (error) {
    const status = (error as { code?: number })?.code;
    if (status !== 401) throw error;

    const refreshed = await auth.refreshAccessToken();
    const nextAccessToken =
      refreshed.credentials.access_token ||
      (typeof auth.credentials.access_token === "string" ? auth.credentials.access_token : null);
    const nextExpiry =
      typeof refreshed.credentials.expiry_date === "number"
        ? refreshed.credentials.expiry_date
        : null;

    if (params.onTokenRefresh) {
      await params.onTokenRefresh({
        accessToken: nextAccessToken,
        expiryDate: nextExpiry,
      });
    }

    const retried = await runInsert();
    const meetLink = retried.data.conferenceData?.entryPoints?.[0]?.uri || null;
    const eventId = retried.data.id || null;
    return { meetLink, eventId };
  }
}
