import { NextResponse } from "next/server";

import { createTeam, listTeams } from "@/lib/store";

export async function GET() {
  try {
    const teams = await listTeams();
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Teams GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch teams" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const name = payload?.name?.trim();

  if (!name) {
    return NextResponse.json(
      { error: "Team name is required" },
      { status: 400 },
    );
  }

  const team = await createTeam(name);
  return NextResponse.json(team, { status: 201 });
}
