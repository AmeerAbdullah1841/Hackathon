import Link from "next/link";
import { notFound } from "next/navigation";

import { ChallengeWorkspace } from "./ChallengeWorkspace";
import { LogoutButton } from "./LogoutButton";

import { findAssignmentById, findTeamById, getHackathonStatus } from "@/lib/store";

type Params = {
  params: Promise<{
    teamId: string;
    assignmentId: string;
  }>;
};

export default async function AssignmentDetailPage({ params }: Params) {
  const { teamId, assignmentId } = await params;

  const team = await findTeamById(teamId);
  if (!team) {
    notFound();
  }

  // Check if hackathon is active
  const hackathonStatus = await getHackathonStatus();
  if (!hackathonStatus.isActive) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link
              href={`/team/${team.id}`}
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Back to mission queue
            </Link>
            <LogoutButton />
          </div>
          <div className="rounded-3xl bg-white p-12 text-center shadow">
            <h1 className="text-3xl font-semibold text-slate-900 mb-4">
              Hackathon Not Active
            </h1>
            <p className="text-lg text-slate-600">
              The hackathon is currently not active. You cannot access challenges at this time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const assignment = await findAssignmentById(assignmentId);
  if (!assignment || assignment.teamId !== team.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/team/${team.id}`}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Back to mission queue
          </Link>
          <LogoutButton />
        </div>
        <ChallengeWorkspace team={team} assignment={assignment} />
      </div>
    </div>
  );
}

