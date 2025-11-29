import { NextResponse } from "next/server";

import { deleteTeamSubmissions, resetTeamPassword } from "@/lib/store";

type Params = {
  params: {
    teamId: string;
  };
};

export async function PATCH(
  request: Request,
  { params }: Params,
) {
  const { teamId } = await Promise.resolve(params);
  const payload = await request.json().catch(() => null);
  const action = payload?.action;

  if (!action) {
    return NextResponse.json(
      { error: "Action is required" },
      { status: 400 },
    );
  }

  try {
    if (action === "reset-password") {
      const team = await resetTeamPassword(teamId);
      return NextResponse.json(team);
    } else if (action === "reset-submissions") {
      await deleteTeamSubmissions(teamId);
      return NextResponse.json({ success: true, message: "Submissions deleted successfully" });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'reset-password' or 'reset-submissions'" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Team action failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action failed" },
      { status: 400 },
    );
  }
}
