import { NextResponse } from "next/server";

import { getHackathonStatus, listSubmissionsWithDetails, reviewSubmission, upsertSubmission } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");
    
    if (assignmentId) {
      // Get submission for specific assignment
      const { findSubmissionByAssignmentId } = await import("@/lib/store");
      const submission = await findSubmissionByAssignmentId(assignmentId);
      return NextResponse.json({ submission });
    }
    
    // Otherwise return all submissions
    const submissions = await listSubmissionsWithDetails();
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Failed to list submissions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list submissions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  // Check if hackathon is active
  const hackathonStatus = await getHackathonStatus();
  if (!hackathonStatus.isActive) {
    return NextResponse.json(
      { error: "Hackathon is not currently active. Submissions are disabled." },
      { status: 403 },
    );
  }

  const payload = await request.json().catch(() => null);
  const assignmentId = payload?.assignmentId;
  const teamId = payload?.teamId;
  const plan = typeof payload?.plan === "string" ? payload.plan : "";
  const findings = typeof payload?.findings === "string" ? payload.findings : "";
  const flag = typeof payload?.flag === "string" ? payload.flag : "";

  if (!assignmentId || !teamId) {
    return NextResponse.json(
      { error: "assignmentId and teamId are required" },
      { status: 400 },
    );
  }

  try {
    const submission = await upsertSubmission({
      assignmentId,
      teamId,
      plan,
      findings,
      flag,
    });
    return NextResponse.json(submission);
  } catch (error) {
    console.error("Submission upsert failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Submission failed" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const payload = await request.json().catch(() => null);
  const submissionId = payload?.submissionId;
  const status = payload?.status;
  const pointsAwarded = payload?.pointsAwarded;
  const adminNotes = payload?.adminNotes;

  if (!submissionId || !status) {
    return NextResponse.json(
      { error: "submissionId and status are required" },
      { status: 400 },
    );
  }

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json(
      { error: "status must be 'approved' or 'rejected'" },
      { status: 400 },
    );
  }

  try {
    const submission = await reviewSubmission(
      submissionId,
      status,
      typeof pointsAwarded === "number" ? pointsAwarded : 0,
      typeof adminNotes === "string" ? adminNotes : "",
    );
    return NextResponse.json(submission);
  } catch (error) {
    console.error("Failed to review submission:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to review submission" },
      { status: 400 },
    );
  }
}

