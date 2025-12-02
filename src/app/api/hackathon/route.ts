import { NextResponse } from "next/server";

import {
  getHackathonStatus,
  setHackathonTimer,
  startHackathon,
  stopHackathon,
} from "@/lib/store";

export async function GET() {
  try {
    const status = await getHackathonStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Failed to get hackathon status:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get hackathon status" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const action = payload?.action;

  if (!action) {
    return NextResponse.json(
      { error: "Action is required" },
      { status: 400 },
    );
  }

  try {
    if (action === "start") {
      const status = await startHackathon();
      return NextResponse.json(status);
    } else if (action === "stop") {
      const status = await stopHackathon();
      return NextResponse.json(status);
    } else if (action === "set-timer") {
      const { startTime, endTime, isActive } = payload;
      if (!startTime || !endTime) {
        return NextResponse.json(
          { error: "startTime and endTime are required" },
          { status: 400 },
        );
      }
      const status = await setHackathonTimer(startTime, endTime, Boolean(isActive));
      return NextResponse.json(status);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'start', 'stop', or 'set-timer'" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Hackathon action failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action failed" },
      { status: 400 },
    );
  }
}

