import { NextResponse } from "next/server";

import { listAssignmentsForTeam } from "@/lib/store";

type Params = {
  params: {
    teamId: string;
  };
};

export async function GET(_request: Request, context: Params) {
  const { teamId } = context.params;

  if (!teamId) {
    return NextResponse.json(
      { error: "teamId is required" },
      { status: 400 },
    );
  }

  const assignments = await listAssignmentsForTeam(teamId);
  return NextResponse.json(assignments);
}
