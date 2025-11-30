import { notFound } from "next/navigation";

import { TeamDashboard } from "./TeamDashboard";

import { findTeamById, getHackathonStatus, listAssignmentsForTeam } from "@/lib/store";

// Configure caching to reduce unnecessary RSC requests
export const revalidate = 0;
export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    teamId: string;
  }>;
};

export default async function TeamPage({ params }: Params) {
  const { teamId } = await params;
  const team = await findTeamById(teamId);

  if (!team) {
    notFound();
  }

  // Check if hackathon is active
  const hackathonStatus = await getHackathonStatus();
  if (!hackathonStatus.isActive) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="rounded-3xl bg-white p-12 text-center shadow">
            <h1 className="text-3xl font-semibold text-slate-900 mb-4">
              Hackathon Not Active
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              The hackathon is currently not active. Please wait for the admin to start it.
            </p>
            {hackathonStatus.startTime && (
              <p className="text-sm text-slate-500">
                Scheduled Start: {new Date(hackathonStatus.startTime).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const assignments = await listAssignmentsForTeam(team.id);

  return <TeamDashboard team={team} initialAssignments={assignments} />;
}

