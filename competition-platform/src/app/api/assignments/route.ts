import { NextResponse } from "next/server";

import {
  assignTask,
  getHackathonStatus,
  listAssignments,
  listSubmissions,
  listTasks,
  listTeams,
  upsertAssignmentStatus,
} from "@/lib/store";

const buildDetailedAssignments = async () => {
  const [assignments, teams, tasks, submissions] = await Promise.all([
    listAssignments(),
    listTeams(),
    listTasks(),
    listSubmissions(),
  ]);

  return assignments.map((assignment) => ({
    ...assignment,
    team: teams.find((team) => team.id === assignment.teamId),
    task: tasks.find((task) => task.id === assignment.taskId),
    submission: submissions.find(
      (submission) => submission.assignmentId === assignment.id,
    ),
  }));
};

export async function GET() {
  try {
    const detailedAssignments = await buildDetailedAssignments();
    return NextResponse.json(detailedAssignments);
  } catch (error) {
    console.error("Assignments GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch assignments" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const teamId = payload?.teamId;
  const taskId = payload?.taskId;
  const status = payload?.status;

  if (!teamId || !taskId) {
    return NextResponse.json(
      { error: "teamId and taskId are required" },
      { status: 400 },
    );
  }

  try {
    const assignment = await assignTask(teamId, taskId);

    if (status) {
      await upsertAssignmentStatus(assignment.id, status);
    }

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assignment failed" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  // Check if hackathon is active (only for status updates from teams)
  const hackathonStatus = await getHackathonStatus();
  if (!hackathonStatus.isActive) {
    return NextResponse.json(
      { error: "Hackathon is not currently active. Status updates are disabled." },
      { status: 403 },
    );
  }

  const payload = await request.json().catch(() => null);
  const assignmentId = payload?.assignmentId;
  const status = payload?.status;

  if (!assignmentId || !status) {
    return NextResponse.json(
      { error: "assignmentId and status are required" },
      { status: 400 },
    );
  }

  try {
    const assignment = await upsertAssignmentStatus(assignmentId, status);
    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 400 },
    );
  }
}
