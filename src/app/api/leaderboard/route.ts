import { NextResponse } from "next/server";

import { getLeaderboard } from "@/lib/store";

export async function GET() {
  try {
    const leaderboard = await getLeaderboard();
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Failed to get leaderboard:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get leaderboard" },
      { status: 500 },
    );
  }
}

