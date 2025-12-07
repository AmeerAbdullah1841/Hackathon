import { NextResponse } from "next/server";

import { deleteTeam, deleteTeamSubmissions, findTeamById, resetTeamPassword } from "@/lib/store";

type Params = {
  params: Promise<{
    teamId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Params,
) {
  const { teamId } = await params;
  
  try {
    const team = await findTeamById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ team });
  } catch (error) {
    console.error("Failed to fetch team:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch team" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Params,
) {
  const { teamId } = await params;
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

export async function DELETE(
  request: Request,
  { params }: Params,
) {
  const { teamId } = await params;

  try {
    await deleteTeam(teamId);
    return NextResponse.json({ success: true, message: "Team deleted successfully" });
  } catch (error) {
    console.error("Team deletion failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete team" },
      { status: 400 },
    );
  }
}
