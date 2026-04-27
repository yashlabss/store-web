type ConfirmationEmailParams = {
  coachEmail?: string | null;
  clientEmail: string;
  clientName: string;
  meetLink?: string;
  startTime: string;
  endTime: string;
  sessionType: string;
};

export type BookingEmailResult =
  | { sent: true }
  | { sent: false; reason: string };

export async function sendBookingConfirmationEmails(
  params: ConfirmationEmailParams
): Promise<BookingEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.BOOKING_FROM_EMAIL?.trim() || "onboarding@resend.dev";
  const recipients = [
    ...new Set([params.clientEmail, params.coachEmail || ""].filter(Boolean)),
  ];
  if (!apiKey) {
    console.log("booking-confirmation-fallback", params);
    return {
      sent: false,
      reason: "Confirmation email skipped: add RESEND_API_KEY (and BOOKING_FROM_EMAIL) to store-web/.env.local, then restart npm run dev.",
    };
  }
  if (recipients.length === 0) {
    return { sent: false, reason: "Confirmation email skipped: no recipient addresses." };
  }

  const when = `${new Date(params.startTime).toLocaleString()} - ${new Date(params.endTime).toLocaleTimeString()}`;
  const subject = `Booking confirmed: ${params.sessionType}`;
  const text = [
    `Hi ${params.clientName},`,
    "",
    `Your ${params.sessionType} is confirmed.`,
    `Time: ${when}`,
    params.meetLink ? `Google Meet: ${params.meetLink}` : "Meeting link will be shared by the coach.",
    "",
    "Thank you.",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipients,
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("booking-confirmation-email-failed", body);
    return {
      sent: false,
      reason: `Email failed (${res.status}). Check RESEND_API_KEY and BOOKING_FROM_EMAIL in .env.local.`,
    };
  }
  return { sent: true };
}
