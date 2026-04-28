type ZoomTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

type ZoomUserResponse = {
  email?: string;
};

type ZoomMeetingResponse = {
  id?: number;
  join_url?: string;
};

type CreateZoomMeetingParams = {
  coachAccessToken: string;
  coachRefreshToken: string;
  topic: string;
  startTime: string;
  durationMinutes: number;
  timezone?: string;
  agenda?: string;
  onTokenRefresh?: (next: { accessToken?: string | null; refreshToken?: string | null; expiryDate?: number | null }) => Promise<void> | void;
};

function getZoomBasicAuthHeader(): string {
  const id = process.env.ZOOM_CLIENT_ID?.trim() || "";
  const secret = process.env.ZOOM_CLIENT_SECRET?.trim() || "";
  const raw = `${id}:${secret}`;
  return `Basic ${Buffer.from(raw, "utf8").toString("base64")}`;
}

async function refreshZoomAccessToken(refreshToken: string): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  expiryDate: number | null;
}> {
  const tokenRes = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: getZoomBasicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    throw new Error("Could not refresh Zoom access token.");
  }

  const data = (await tokenRes.json().catch(() => ({}))) as ZoomTokenResponse;
  const nextAccess = typeof data.access_token === "string" ? data.access_token : null;
  const nextRefresh = typeof data.refresh_token === "string" ? data.refresh_token : null;
  const expiryDate =
    typeof data.expires_in === "number" ? Date.now() + data.expires_in * 1000 : null;
  return { accessToken: nextAccess, refreshToken: nextRefresh, expiryDate };
}

export async function fetchZoomUserEmail(accessToken: string): Promise<string | null> {
  const res = await fetch("https://api.zoom.us/v2/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as ZoomUserResponse;
  return typeof data.email === "string" ? data.email : null;
}

export async function createZoomMeeting(params: CreateZoomMeetingParams): Promise<{
  joinUrl: string | null;
  meetingId: string | null;
}> {
  let accessToken = params.coachAccessToken;
  let refreshToken = params.coachRefreshToken;
  const duration = Number.isFinite(params.durationMinutes) && params.durationMinutes > 0 ? params.durationMinutes : 30;

  const runCreate = async () => {
    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: params.topic,
        type: 2,
        start_time: params.startTime,
        duration,
        timezone: params.timezone || "UTC",
        agenda: params.agenda || "",
        settings: {
          join_before_host: false,
          waiting_room: true,
        },
      }),
      cache: "no-store",
    });
    return response;
  };

  let res = await runCreate();
  if (res.status === 401) {
    const refreshed = await refreshZoomAccessToken(refreshToken);
    accessToken = refreshed.accessToken || accessToken;
    refreshToken = refreshed.refreshToken || refreshToken;
    if (params.onTokenRefresh) {
      await params.onTokenRefresh({
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        expiryDate: refreshed.expiryDate,
      });
    }
    res = await runCreate();
  }

  if (!res.ok) {
    throw new Error("Could not create Zoom meeting.");
  }

  const data = (await res.json().catch(() => ({}))) as ZoomMeetingResponse;
  return {
    joinUrl: typeof data.join_url === "string" ? data.join_url : null,
    meetingId: data.id != null ? String(data.id) : null,
  };
}
