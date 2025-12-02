"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminSidebar } from "../components/AdminSidebar";

type Team = {
  id: string;
  name: string;
  username: string;
  password: string;
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  points: number;
};

type Submission = {
  id: string;
  assignmentId: string;
  teamId: string;
  plan: string;
  findings: string;
  flag: string;
  createdAt: string;
  updatedAt: string;
};

type Assignment = {
  id: string;
  teamId: string;
  taskId: string;
  status: "assigned" | "in-progress" | "completed";
  lastUpdated: string;
  task?: Task;
  team?: Team;
  submission?: Submission;
};

const statusOptions: Assignment["status"][] = [
  "assigned",
  "in-progress",
  "completed",
];

const jsonHeaders = { "Content-Type": "application/json" } as const;

async function request<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    credentials: "include",
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload?.error ?? "Unexpected API error");
  }
  return res.json();
}

export function AssignmentsClient() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamSearch, setTeamSearch] = useState("");
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(
    () => new Set(),
  );

  const refreshAssignments = useCallback(async () => {
    try {
      setLoadingAssignments(true);
      const [assignmentData, teamData] = await Promise.all([
        request<Assignment[]>("/api/assignments"),
        request<Team[]>("/api/teams"),
      ]);
      setAssignments(assignmentData);
      setTeams(teamData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load assignments");
    } finally {
      setLoadingAssignments(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    refreshAssignments().then(() => {
      if (!mounted) return;
    }).catch((err) => {
      if (mounted) console.error(err);
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const groupedTeams = useMemo(() => {
    const map = new Map<
      string,
      {
        team: Team;
        assignments: Assignment[];
      }
    >();

    teams.forEach((team) => {
      map.set(team.id, { team, assignments: [] });
    });

    assignments.forEach((assignment) => {
      const existing = map.get(assignment.teamId);
      if (existing) {
        existing.assignments.push(assignment);
      } else if (assignment.team) {
        map.set(assignment.teamId, {
          team: assignment.team,
          assignments: [assignment],
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.team.name.localeCompare(b.team.name),
    );
  }, [assignments, teams]);

  const filteredTeams = useMemo(() => {
    if (!teamSearch.trim()) {
      if (!selectedTeamId) return groupedTeams;
      return groupedTeams.filter(({ team }) => team.id === selectedTeamId);
    }

    const term = teamSearch.trim().toLowerCase();
    return groupedTeams.filter(({ team }) => {
      const name = team.name?.toLowerCase() ?? "";
      const username = team.username?.toLowerCase() ?? "";
      const match = name.includes(term) || username.includes(term);
      if (selectedTeamId) {
        return match && team.id === selectedTeamId;
      }
      return match;
    });
  }, [groupedTeams, selectedTeamId, teamSearch]);

  const toggleTeamPanel = (teamId: string) => {
    setExpandedTeams((current) => {
      const next = new Set(current);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  const handleStatusUpdate = async (
    assignmentId: string,
    status: Assignment["status"],
  ) => {
    try {
      await request<Assignment>("/api/assignments", {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ assignmentId, status }),
      });
      await refreshAssignments();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleAdminLogout = async () => {
    try {
      await request("/api/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error(err);
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex max-w-7xl gap-6">
        <AdminSidebar onLogout={handleAdminLogout} />
        <div className="flex-1 space-y-10">
          <header className="rounded-3xl bg-white px-8 py-6 shadow">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Assignments
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                  Review task progress
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Filter by team to focus on the tasks they currently own, update
                  statuses, and monitor recent submissions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => refreshAssignments()}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                disabled={loadingAssignments}
              >
                {loadingAssignments ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </header>

          <main className="space-y-6 rounded-3xl bg-white p-6 shadow">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Team filter
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Monitor assignments per team
                </h2>
                <p className="text-sm text-slate-500">
                  Search or narrow down to a single team to focus on their workload.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={teamSearch}
                  onChange={(event) => setTeamSearch(event.target.value)}
                  placeholder="Search by team or username"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm sm:w-64"
                />
                <select
                  value={selectedTeamId}
                  onChange={(event) => setSelectedTeamId(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm"
                >
                  <option value="">All teams</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {filteredTeams.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                {teamSearch
                  ? "No teams match this search."
                  : selectedTeamId
                    ? "This team has no assignments yet."
                    : "No assignments have been created yet."}
              </p>
            ) : (
              <div className="space-y-4">
                {filteredTeams.map(({ team, assignments: teamAssignments }) => {
                  const completed = teamAssignments.filter(
                    (item) => item.status === "completed",
                  ).length;
                  const inProgress = teamAssignments.filter(
                    (item) => item.status === "in-progress",
                  ).length;
                  const assigned =
                    teamAssignments.filter((item) => item.status === "assigned")
                      .length;
                  const isExpanded = expandedTeams.has(team.id);

                  return (
                    <article
                      key={team.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTeamPanel(team.id)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            Team
                          </p>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {team.name}
                          </h3>
                          <p className="text-sm text-slate-500">{team.username}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <span>{teamAssignments.length} tasks</span>
                          <span className="text-emerald-600">{completed} done</span>
                          <span className="text-amber-500">
                            {inProgress} in progress
                          </span>
                          <span className="text-slate-500">{assigned} assigned</span>
                          <span
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${
                              isExpanded
                                ? "border-slate-900 text-slate-900"
                                : "border-slate-300 text-slate-500"
                            }`}
                          >
                            {isExpanded ? "−" : "+"}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 space-y-3">
                          {teamAssignments.length === 0 ? (
                            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                              No tasks assigned yet.
                            </p>
                          ) : (
                            teamAssignments.map((assignment) => (
                              <div
                                key={assignment.id}
                                className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                              >
                                <div className="max-w-2xl space-y-1">
                                  <p className="text-xs uppercase tracking-wide text-slate-400">
                                    {assignment.task?.category} ·{" "}
                                    {assignment.task?.points} pts
                                  </p>
                                  <h4 className="text-lg font-semibold text-slate-900">
                                    {assignment.task?.title ?? "Unknown task"}
                                  </h4>
                                  <p className="text-slate-500">
                                    {assignment.task?.description}
                                  </p>
                                  {assignment.submission?.flag ? (
                                    <p className="text-xs text-slate-500">
                                      Latest submission:{" "}
                                      <span className="font-mono">
                                        {assignment.submission.flag}
                                      </span>
                                      {assignment.submission.updatedAt ? (
                                        <span className="text-slate-400">
                                          {" "}
                                          ·{" "}
                                          {new Date(
                                            assignment.submission.updatedAt,
                                          ).toLocaleString()}
                                        </span>
                                      ) : null}
                                    </p>
                                  ) : (
                                    <p className="text-xs italic text-slate-400">
                                      No submission yet
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <select
                                    value={assignment.status}
                                    onChange={(event) =>
                                      handleStatusUpdate(
                                        assignment.id,
                                        event.target.value as Assignment["status"],
                                      )
                                    }
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                  >
                                    {statusOptions.map((status) => (
                                      <option key={status} value={status}>
                                        {status}
                                      </option>
                                    ))}
                                  </select>
                                  <p className="text-xs text-slate-400">
                                    Updated{" "}
                                    {new Date(
                                      assignment.lastUpdated,
                                    ).toLocaleString(undefined, {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

