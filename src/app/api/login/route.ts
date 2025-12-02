import { NextResponse } from "next/server";

import { getHackathonStatus, validateTeamLogin } from "@/lib/store";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const username = payload?.username?.trim();
  const password = payload?.password?.trim();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 },
    );
  }

  // Check if hackathon is active
  const hackathonStatus = await getHackathonStatus();
  if (!hackathonStatus.isActive) {
    return NextResponse.json(
      { error: "Hackathon is not currently active. Please wait for the admin to start it." },
      { status: 403 },
    );
  }

  const result = await validateTeamLogin(username, password);

  if (!result) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 },
    );
  }

  return NextResponse.json(result);
}
