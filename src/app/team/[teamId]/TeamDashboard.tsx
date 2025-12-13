"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { AssignmentWithTask, Team } from "@/lib/store";

const statusOptions: AssignmentWithTask["status"][] = [
  "assigned",
  "in-progress",
  "completed",
];

type Props = {
  team: Team;
  initialAssignments: AssignmentWithTask[];
};

const jsonHeaders = { "Content-Type": "application/json" } as const;

// Mapping of challenge titles to their interactive challenge routes
const challengeRouteMap: Record<string, string> = {
  "Base64 Detective": "/challenges/base64-detective",
  "ROT All The Things": "/challenges/rot-all-the-things",
  "Hex Dump Message": "/challenges/hex-dump-message",
  "Active Directory Privilege Escalation": "/challenges/active-directory-privilege-escalation",
  "Blockchain Smart Contract Exploit": "/challenges/blockchain-smart-contract-exploit",
  "Port Knock Sequence": "/challenges/port-knock-sequence",
  "SQL Injection Theory": "/challenges/sql-injection-theory",
  "OSINT Challenge": "/challenges/osint-challenge",
  "Hash Cracker": "/challenges/hash-cracker",
  "Caesar Cipher With Twist": "/challenges/caesar-cipher-with-twist",
  "JWT Decode Challenge": "/challenges/jwt-decode-challenge",
  "Python Code Review": "/challenges/python-code-review",
  "OAuth Flow Exploit": "/challenges/oauth-flow-exploit",
  "Cipher Chain": "/challenges/cipher-chain",
  "RSA Small Exponent": "/challenges/rsa-small-exponent",
  "Memory Dump Analysis": "/challenges/memory-dump-analysis",
  "Regex Bypass": "/challenges/regex-bypass",
  "Logic Bomb Discovery": "/challenges/logic-bomb-discovery",
};

// Helper function to get challenge route
const getChallengeRoute = (task: AssignmentWithTask["task"]): string | null => {
  if (!task) return null;
  
  // First, check if resources already contain a /challenges/ path
  const resourceLink = task.resources?.find((resource: string) =>
    resource.startsWith("/challenges/")
  );
  if (resourceLink) {
    return resourceLink;
  }
  
  // Fallback: check title mapping
  if (task.title && challengeRouteMap[task.title]) {
    return challengeRouteMap[task.title];
  }
  
  return null;
};

export function TeamDashboard({ team, initialAssignments }: Props) {
  const router = useRouter();
  const [assignments, setAssignments] =
    useState<AssignmentWithTask[]>(initialAssignments);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [updatingAssignmentId, setUpdatingAssignmentId] = useState<string | null>(
    null,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hackathonActive, setHackathonActive] = useState(true);

  // Check hackathon status periodically
  const checkHackathonStatus = useCallback(async () => {
    try {
      const status = await fetch("/api/hackathon").then((res) => res.json());
      setHackathonActive(status.isActive);
      if (!status.isActive) {
        setStatusMessage("Hackathon has ended. You can no longer submit challenges.");
      }
    } catch (error) {
      console.error("Failed to check hackathon status:", error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    checkHackathonStatus().then(() => {
      if (!mounted) return;
    });
    const interval = setInterval(() => {
      if (mounted) checkHackathonStatus();
    }, 30000); // Check every 30 seconds
    return () => {
      mounted = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const progress = useMemo(() => {
    if (!assignments.length) return 0;
    const completed = assignments.filter(
      (assignment) => assignment.status === "completed",
    ).length;
    return Math.round((completed / assignments.length) * 100);
  }, [assignments]);

  const completedCount = useMemo(
    () => assignments.filter((a) => a.status === "completed").length,
    [assignments],
  );

  const inProgressCount = useMemo(
    () => assignments.filter((assignment) => assignment.status === "in-progress").length,
    [assignments],
  );

  const resourcesCount = useMemo(
    () =>
      assignments.reduce(
        (count, assignment) => count + (assignment.task?.resources?.length ?? 0),
        0,
      ),
    [assignments],
  );

  const handleStatusChange = useCallback(async (
    assignmentId: string,
    status: AssignmentWithTask["status"],
  ) => {
    if (!hackathonActive) {
      setStatusMessage("Hackathon is not active. Cannot update status.");
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setUpdatingAssignmentId(assignmentId);
    try {
      await fetch("/api/assignments", {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ assignmentId, status }),
      });

      setAssignments((current) =>
        current.map((assignment) =>
          assignment.id === assignmentId ? { ...assignment, status } : assignment,
        ),
      );
      setStatusMessage("Progress saved.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to update status.");
    } finally {
      setUpdatingAssignmentId(null);
      setTimeout(() => setStatusMessage(null), 2500);
    }
  }, [hackathonActive]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: jsonHeaders,
      });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect to login page even if API call fails
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-sm uppercase tracking-[0.2em] text-white/50">
                Welcome back
              </p>
              <h1 className="mt-2 text-4xl font-semibold">{team.name}</h1>
              <p className="mt-4 max-w-2xl text-slate-200">
                Track your cyber challenges, open detailed briefs, and capture
                findings in one focused workspace.
              </p>
            </div>
            <div className="flex flex-col items-end gap-4 md:flex-row md:items-center">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="group flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-white/20 disabled:hover:bg-white/5 disabled:hover:shadow-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </button>
              <div className="w-full max-w-xs rounded-2xl border border-white/20 p-5 text-center">
                <p className="text-sm text-white/70">Overall progress</p>
                <p className="mt-2 text-4xl font-semibold">{progress}%</p>
                <p className="text-sm text-white/60">
                  {completedCount} of {assignments.length} challenges
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          <section className="rounded-3xl bg-white p-6 shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  Assigned challenges
                </p>
                <h2 className="mt-1 text-2xl font-semibold">Challenges</h2>
              </div>
              {statusMessage && (
                <p className="text-xs font-medium text-emerald-600">
                  {statusMessage}
                </p>
              )}
            </div>

            {!assignments.length ? (
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                No challenges yet. Ping your administrator for assignments.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {assignments.map((assignment) => (
                  <article
                    key={assignment.id}
                    className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                          {assignment.task?.category ?? "Challenge"}
                        </p>
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          {assignment.task?.title ?? "Untitled challenge"}
                        </h3>
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            assignment.task?.difficulty === "beginner"
                              ? "bg-green-100 text-green-700"
                              : assignment.task?.difficulty === "intermediate"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {assignment.task?.difficulty?.toUpperCase() ?? "INTERMEDIATE"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {assignment.task?.points ?? 0} points
                          </span>
                        </div>
                        <div className="mb-4">
                          <select
                            value={assignment.status}
                            onChange={(event) =>
                              handleStatusChange(
                                assignment.id,
                                event.target.value as AssignmentWithTask["status"],
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            disabled={updatingAssignmentId === assignment.id}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-auto">
                        {(() => {
                          // Check if this is an interactive challenge
                          const challengeLink = getChallengeRoute(assignment.task);
                          
                          if (challengeLink) {
                            // Link directly to interactive challenge page
                            return (
                              <Link
                                href={`${challengeLink}?team=${team.id}&assignment=${assignment.id}`}
                                className="block w-full text-center rounded-xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
                              >
                                Open Challenge
                              </Link>
                            );
                          }
                          
                          // Regular challenge - link to assignment detail page
                          return (
                            <Link
                              href={`/team/${team.id}/assignments/${assignment.id}`}
                              className="block w-full text-center rounded-xl px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-900 hover:bg-slate-200 transition"
                            >
                              Open Challenge
                            </Link>
                          );
                        })()}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-3xl bg-white p-6 shadow">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Quick stats
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Engagement radar</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  In progress
                </p>
                <p className="text-2xl font-semibold">{inProgressCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Resources bookmarked
                </p>
                <p className="text-2xl font-semibold">{resourcesCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Last sync
                </p>
                <p className="text-2xl font-semibold">
                  {assignments[0]?.lastUpdated
                    ? new Date(assignments[0].lastUpdated).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          </aside>
        </main>

        <section className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow">
          <p>
            Select “Open challenge” to review the mission brief, resources, and
            submit drafts on a dedicated workspace page.
          </p>
        </section>
      </div>
    </div>
  );
}

