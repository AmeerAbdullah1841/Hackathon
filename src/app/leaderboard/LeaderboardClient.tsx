"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminSidebar } from "@/app/components/AdminSidebar";

type LeaderboardEntry = {
  rank: number;
  team: {
    id: string;
    name: string;
    username: string;
  };
  score: number;
  challengesCompleted: number;
  totalChallenges: number;
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

export function LeaderboardClient() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await request<LeaderboardEntry[]>("/api/leaderboard");
      setLeaderboard(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    refreshLeaderboard().then(() => {
      if (!mounted) return;
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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
                <h1 className="text-3xl font-semibold text-slate-900">
                  Current Leaderboard
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Teams ranked by total points from approved submissions
                </p>
              </div>
              <button
                type="button"
                onClick={() => refreshLeaderboard()}
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
              Loading leaderboard...
            </div>
          ) : (
            <div className="rounded-3xl bg-white shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Team
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Challenges
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        App Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          No teams found
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((entry) => (
                        <tr
                          key={entry.team.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                                entry.rank === 1
                                  ? "bg-yellow-100 text-yellow-800"
                                  : entry.rank === 2
                                    ? "bg-slate-100 text-slate-800"
                                    : entry.rank === 3
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-50 text-slate-600"
                              }`}
                            >
                              #{entry.rank}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-slate-900">
                              {entry.team.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              @{entry.team.username}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-slate-900">
                              {entry.score}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-600">
                              {entry.challengesCompleted}/{entry.totalChallenges}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-500">No</span>
                          </td>
                        </tr>
                      ))
                    )}
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

