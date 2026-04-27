import { NextRequest, NextResponse } from "next/server";
import { getGoogleConnectionStatus } from "../../../../../lib/server/googleTokenStore";

export async function GET(req: NextRequest) {
  const coachId = req.nextUrl.searchParams.get("coachId");
  if (!coachId) {
    return NextResponse.json({ message: "coachId is required" }, { status: 400 });
  }
  const status = getGoogleConnectionStatus(coachId);
  return NextResponse.json(status);
}
