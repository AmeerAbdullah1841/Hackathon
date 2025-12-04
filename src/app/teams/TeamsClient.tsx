"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminSidebar } from "@/app/components/AdminSidebar";

type Team = {
  id: string;
  name: string;
  username: string;
  password: string;
  createdAt: string;
};

const jsonHeaders = { "Content-Type": "application/json" } as const;

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return res.json();
}

export function TeamsClient() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const refreshTeams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await request<Team[]>("/api/teams");
      setTeams(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    refreshTeams().then(() => {
      if (!mounted) return;
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleResetPassword = async (teamId: string) => {
    if (!confirm("Are you sure you want to reset this team's password? This will generate new credentials.")) {
      return;
    }

    setActionLoading(`password-${teamId}`);
    try {
      const updatedTeam = await request<Team>(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ action: "reset-password" }),
      });
      
      setTeams((current) =>
        current.map((team) => (team.id === teamId ? updatedTeam : team)),
      );
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetSubmissions = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete all submissions for this team? This action cannot be undone.")) {
      return;
    }

    setActionLoading(`submissions-${teamId}`);
    try {
      await request(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ action: "reset-submissions" }),
      });
      
      setError(null);
      // Optionally refresh teams to show updated data
      await refreshTeams();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to reset submissions");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete "${teamName}"? This will permanently delete the team, all their assignments, and all their submissions. This action cannot be undone.`)) {
      return;
    }

    setActionLoading(`delete-${teamId}`);
    try {
      await request(`/api/teams/${teamId}`, {
        method: "DELETE",
      });
      
      setError(null);
      // Remove the team from the list
      setTeams((current) => current.filter((team) => team.id !== teamId));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to delete team");
    } finally {
      setActionLoading(null);
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
        <div className="flex-1 space-y-6">
          <header className="rounded-3xl bg-white px-8 py-6 shadow">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">Teams</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Manage team credentials and reset submissions
                </p>
              </div>
              <button
                type="button"
                onClick={() => refreshTeams()}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </header>

          {error && (
            <div className="rounded-3xl bg-red-50 border border-red-200 px-6 py-4 text-red-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl bg-white p-12 text-center text-slate-500 shadow">
              Loading teams...
            </div>
          ) : teams.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center text-slate-500 shadow">
              No teams found.
            </div>
          ) : (
            <div className="rounded-3xl bg-white shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Team Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Username
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Password
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {teams.map((team) => (
                      <tr key={team.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-900">
                            {team.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600 font-mono">
                            {team.username}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600 font-mono">
                            {team.password}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-500">
                            {new Date(team.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleResetPassword(team.id)}
                              disabled={actionLoading === `password-${team.id}` || actionLoading === `delete-${team.id}`}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === `password-${team.id}` ? "Resetting..." : "Reset Password"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResetSubmissions(team.id)}
                              disabled={actionLoading === `submissions-${team.id}` || actionLoading === `delete-${team.id}`}
                              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === `submissions-${team.id}` ? "Deleting..." : "Reset Submissions"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTeam(team.id, team.name)}
                              disabled={actionLoading !== null && actionLoading !== `delete-${team.id}`}
                              className="rounded-lg border border-red-500 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === `delete-${team.id}` ? "Deleting..." : "Delete Team"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

