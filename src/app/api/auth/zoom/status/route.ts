import { NextRequest, NextResponse } from "next/server";
import { getZoomConnectionStatus } from "../../../../../lib/server/zoomTokenStore";

export async function GET(req: NextRequest) {
  const coachId = req.nextUrl.searchParams.get("coachId");
  if (!coachId) {
    return NextResponse.json({ message: "coachId is required" }, { status: 400 });
  }
  return NextResponse.json(getZoomConnectionStatus(coachId));
}
