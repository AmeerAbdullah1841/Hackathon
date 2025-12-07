"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ReactNode, Suspense, useEffect, useState } from "react";

type ChallengeLayoutProps = {
  children: ReactNode;
  teamName?: string;
  challengeTitle: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  onLogout?: () => void;
};

function ChallengeLayoutContent({
  children,
  teamName: propTeamName,
  challengeTitle,
  difficulty,
  points,
  onLogout,
}: ChallengeLayoutProps) {
  const [showTutorial, setShowTutorial] = useState(true);
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const assignmentId = searchParams.get("assignment");
  const [teamName, setTeamName] = useState(propTeamName || "Team");

  useEffect(() => {
    if (teamId) {
      // Fetch team name from API
      fetch(`/api/teams/${teamId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.team) {
            setTeamName(data.team.name);
          }
        })
        .catch(() => {
          // Fallback to prop or default
          setTeamName(propTeamName || "Team");
        });
    }
  }, [teamId, propTeamName]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold">{teamName}'s Dashboard</h1>
              <div className="mt-2 flex gap-4 text-sm">
                <Link
                  href={teamId ? `/team/${teamId}` : "/"}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-slate-600 hover:text-slate-900"
                >
                  Leaderboard
                </Link>
                <Link
                  href="/build-an-app"
                  className="text-slate-600 hover:text-slate-900"
                >
                  Build-an-App
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowTutorial(!showTutorial)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              {showTutorial ? "Hide Tutorial" : "Show Tutorial"}
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Challenge Header */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-3xl font-bold">{challengeTitle}</h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    difficulty === "EASY"
                      ? "bg-green-100 text-green-700"
                      : difficulty === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {difficulty}
                </span>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  {points} POINTS
                </span>
              </div>
            </div>
            <Link
              href={teamId ? `/team/${teamId}` : "/"}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ChallengeLayout(props: ChallengeLayoutProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600">Loading...</div>
        </div>
      </div>
    }>
      <ChallengeLayoutContent {...props} />
    </Suspense>
  );
}

