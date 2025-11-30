import { NextResponse } from "next/server";

import { listAssignmentsForTeam } from "@/lib/store";

type Params = {
  params: Promise<{
    teamId: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { teamId } = await params;

  if (!teamId) {
    return NextResponse.json(
      { error: "teamId is required" },
      { status: 400 },
    );
  }

  const assignments = await listAssignmentsForTeam(teamId);
  return NextResponse.json(assignments);
}
