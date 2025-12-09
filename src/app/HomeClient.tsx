"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminSidebar } from "./components/AdminSidebar";

// Known seed task IDs that should be protected from deletion
const protectedSeedTaskIds = [
  "challenge-malware-beacon-chain",
  "challenge-dfir-log-tampering",
  "challenge-email-polyglot-lure",
  "challenge-reverse-engineering-vm",
  "challenge-network-timing-channel",
  "challenge-firmware-nor-dump",
  "challenge-web-deserialization-rce",
  "challenge-osint-phishing-infra",
  "challenge-crypto-ecdsa-nonce",
  "challenge-cloud-iam-escalation",
  "challenge-phishing-email-detection",
  "challenge-sql-injection",
  "challenge-network-traffic",
  "challenge-terms-trap",
  "challenge-cipher-analysis",
  "challenge-dark-web-myths",
  "challenge-social-media-detector",
  "challenge-cyber-mad-libs",
  "challenge-bug-hunt",
];

type HomeClientProps = {
  initialAdminStatus: "authenticated" | "unauthenticated";
};

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
  resources: string[];
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
  status?: "pending" | "approved" | "rejected";
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

const difficulties = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
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

export function HomeClient({ initialAdminStatus }: HomeClientProps) {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  // Always start with the server-provided status - don't override it
  const [adminStatus, setAdminStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >(initialAdminStatus === "authenticated" ? "authenticated" : "unauthenticated");
  const [authMode, setAuthMode] = useState<"admin" | "team">("admin");
  const [adminLogin, setAdminLogin] = useState({ username: "", password: "" });
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [teamCreatedMessage, setTeamCreatedMessage] = useState<string | null>(
    null,
  );

  const [taskForm, setTaskForm] = useState({
    title: "",
    category: "",
    difficulty: "beginner",
    points: 100,
    description: "",
    resources: "",
    flag: "flag{custom_task}",
  });

  const [assignmentForm, setAssignmentForm] = useState({
    teamId: "",
    taskIds: [] as string[],
  });
  const [taskFilter, setTaskFilter] = useState("");

  const [teamLogin, setTeamLogin] = useState({ username: "", password: "" });
  const [teamSession, setTeamSession] = useState<{
    team: Team;
    assignments: Assignment[];
  } | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(
    () => new Set(),
  );
  const [hackathonStatus, setHackathonStatus] = useState<{
    isActive: boolean;
    startTime: string | null;
    endTime: string | null;
    updatedAt: string;
    selectedTasks?: string[];
  } | null>(null);
  const [selectedHackathonTasks, setSelectedHackathonTasks] = useState<string[]>([]);
  const [hackathonTaskFilter, setHackathonTaskFilter] = useState("");
  const [timerForm, setTimerForm] = useState({
    startTime: "",
    endTime: "",
    isActive: false,
  });
  const [hackathonLoading, setHackathonLoading] = useState(false);
  const hasUnsavedTaskSelectionRef = useRef(false);

  const refreshDashboard = useCallback(async () => {
    const [teamData, taskData, assignmentData] = await Promise.all([
      request<Team[]>("/api/teams"),
      request<Task[]>("/api/tasks"),
      request<Assignment[]>("/api/assignments"),
    ]);

    setTeams(teamData);
    setTasks(taskData);
    setAssignments(assignmentData);
  }, []);

  const fetchAdminSession = useCallback(async () => {
    try {
      const session = await request<{ authenticated: boolean }>(
        "/api/admin/session",
      );
      setAdminStatus(session.authenticated ? "authenticated" : "unauthenticated");
    } catch (error) {
      console.error(error);
      setAdminStatus("unauthenticated");
    }
  }, []);

  const fetchHackathonStatus = useCallback(async (skipTaskUpdate = false) => {
    try {
      const status = await request<{
        isActive: boolean;
        startTime: string | null;
        endTime: string | null;
        updatedAt: string;
        selectedTasks?: string[];
      }>("/api/hackathon");
      setHackathonStatus(status);
      // Only update selected tasks from server if:
      // 1. We're not skipping (initial load or explicit refresh), AND
      // 2. There are no unsaved local changes
      if (status.selectedTasks && !skipTaskUpdate && !hasUnsavedTaskSelectionRef.current) {
        setSelectedHackathonTasks(status.selectedTasks);
      }
      if (status.startTime && status.endTime) {
        setTimerForm({
          startTime: status.startTime,
          endTime: status.endTime,
          isActive: status.isActive,
        });
      }
    } catch (error) {
      console.error("Failed to fetch hackathon status:", error);
    }
  }, []);

  // On mount, verify server-side authentication status
  // If server says unauthenticated, ensure we stay unauthenticated
  useEffect(() => {
    // Always respect the server's initial status
    // If server says unauthenticated, don't check for session (prevents stale cookies)
    if (initialAdminStatus === "unauthenticated") {
      setAdminStatus("unauthenticated");
      // Don't check session - server already determined we're not authenticated
      return;
    }
    
    // Only verify session if server says we might be authenticated
    if (initialAdminStatus === "authenticated") {
      // Verify the session is still valid
      fetchAdminSession().catch(() => {
        setAdminStatus("unauthenticated");
      });
    }
  }, [initialAdminStatus, fetchAdminSession]);

  useEffect(() => {
    if (adminStatus === "authenticated") {
      let mounted = true;
      refreshDashboard().then(() => {
        if (!mounted) return;
      }).catch((error) => {
        if (mounted) console.error(error);
      });
      fetchHackathonStatus(false); // Initial load - update tasks
      // Poll hackathon status every 30 seconds to check for auto-end
      // Skip task updates during polling to preserve user selections
      const interval = setInterval(() => fetchHackathonStatus(true), 30000);
      return () => {
        mounted = false;
        clearInterval(interval);
      };
    } else if (adminStatus === "unauthenticated") {
      setTeams([]);
      setTasks([]);
      setAssignments([]);
      setHackathonStatus(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminStatus]); // Only depend on adminStatus
  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAdminError(null);
    setAdminLoading(true);

    try {
      await request("/api/admin/login", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(adminLogin),
      });
      setAdminStatus("authenticated");
      refreshDashboard();
    } catch (error) {
      setAdminStatus("unauthenticated");
      setAdminError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await request("/api/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setAdminStatus("unauthenticated");
      router.push("/");
    }
  };

  const handleStartHackathon = async () => {
    if (selectedHackathonTasks.length === 0) {
      alert("Please select at least one task before starting the hackathon.");
      return;
    }
    setHackathonLoading(true);
    try {
      const status = await request<{
        isActive: boolean;
        startTime: string | null;
        endTime: string | null;
        updatedAt: string;
        selectedTasks?: string[];
      }>("/api/hackathon", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ action: "start" }),
      });
      setHackathonStatus(status);
      if (status.selectedTasks) {
        setSelectedHackathonTasks(status.selectedTasks);
      }
      hasUnsavedTaskSelectionRef.current = false; // Tasks are saved
      await fetchHackathonStatus(false); // Refresh with task updates
      await refreshDashboard();
    } catch (error) {
      console.error("Failed to start hackathon:", error);
      alert(error instanceof Error ? error.message : "Failed to start hackathon");
    } finally {
      setHackathonLoading(false);
    }
  };

  const handleStopHackathon = async () => {
    setHackathonLoading(true);
    try {
      const status = await request<{
        isActive: boolean;
        startTime: string | null;
        endTime: string | null;
        updatedAt: string;
        selectedTasks?: string[];
      }>("/api/hackathon", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ action: "stop" }),
      });
      setHackathonStatus(status);
      if (status.selectedTasks) {
        setSelectedHackathonTasks(status.selectedTasks);
      }
      hasUnsavedTaskSelectionRef.current = false;
      await fetchHackathonStatus(false); // Refresh with task updates
    } catch (error) {
      console.error("Failed to stop hackathon:", error);
    } finally {
      setHackathonLoading(false);
    }
  };

  const handleSetTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timerForm.startTime || !timerForm.endTime) {
      alert("Please set both start and end times");
      return;
    }
    setHackathonLoading(true);
    try {
      // timerForm.startTime and endTime are already in ISO format from datetime-local input
      const startTime = timerForm.startTime.includes("T") 
        ? timerForm.startTime 
        : new Date(timerForm.startTime).toISOString();
      const endTime = timerForm.endTime.includes("T")
        ? timerForm.endTime
        : new Date(timerForm.endTime).toISOString();
      
      const status = await request<{
        isActive: boolean;
        startTime: string | null;
        endTime: string | null;
        updatedAt: string;
        selectedTasks?: string[];
      }>("/api/hackathon", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          action: "set-timer",
          startTime,
          endTime,
          isActive: timerForm.isActive,
        }),
      });
      setHackathonStatus(status);
      if (status.selectedTasks) {
        setSelectedHackathonTasks(status.selectedTasks);
      }
      await fetchHackathonStatus(false); // Refresh with task updates
    } catch (error) {
      console.error("Failed to set timer:", error);
    } finally {
      setHackathonLoading(false);
    }
  };

  const handleSelectHackathonTasks = async () => {
    if (selectedHackathonTasks.length === 0) {
      alert("Please select at least one task.");
      return;
    }
    setHackathonLoading(true);
    try {
      const status = await request<{
        isActive: boolean;
        startTime: string | null;
        endTime: string | null;
        updatedAt: string;
        selectedTasks?: string[];
      }>("/api/hackathon", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          action: "select-tasks",
          taskIds: selectedHackathonTasks,
        }),
      });
      setHackathonStatus(status);
      if (status.selectedTasks) {
        setSelectedHackathonTasks(status.selectedTasks);
        hasUnsavedTaskSelectionRef.current = false; // Changes are now saved
      }
      alert(`Selected ${selectedHackathonTasks.length} task(s) for the hackathon.`);
    } catch (error) {
      console.error("Failed to select tasks:", error);
      alert(error instanceof Error ? error.message : "Failed to select tasks");
    } finally {
      setHackathonLoading(false);
    }
  };

  const toggleHackathonTaskSelection = (taskId: string) => {
    setSelectedHackathonTasks((current) => {
      const selected = new Set(current);
      if (selected.has(taskId)) {
        selected.delete(taskId);
      } else {
        selected.add(taskId);
      }
      return Array.from(selected);
    });
    // Mark that user has unsaved changes
    hasUnsavedTaskSelectionRef.current = true;
  };

  const handleSelectAllFilteredHackathonTasks = () => {
    setSelectedHackathonTasks(filteredHackathonTasks.map((task) => task.id));
    hasUnsavedTaskSelectionRef.current = true;
  };

  const handleClearSelectedHackathonTasks = () => {
    setSelectedHackathonTasks([]);
    hasUnsavedTaskSelectionRef.current = true;
  };


  const handleCreateTeam = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!teamName.trim()) return;

    try {
      const team = await request<Team>("/api/teams", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ name: teamName }),
      });
      setTeamCreatedMessage(
        `Credentials for ${team.name}: ${team.username} / ${team.password}`,
      );
      setTeamName("");
      refreshDashboard();
    } catch (error) {
      setTeamCreatedMessage(error instanceof Error ? error.message : null);
    }
  };

  const handleCreateTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskForm.title.trim()) return;

    try {
      await request<Task>("/api/tasks", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          title: taskForm.title,
          category: taskForm.category,
          difficulty: taskForm.difficulty,
          points: taskForm.points,
          description: taskForm.description,
          resources: taskForm.resources
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          flag: taskForm.flag,
        }),
      });
      setTaskForm({
        title: "",
        category: "",
        difficulty: "beginner",
        points: 100,
        description: "",
        resources: "",
        flag: "flag{custom_task}",
      });
      refreshDashboard();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assignmentForm.teamId || assignmentForm.taskIds.length === 0) return;

    try {
      await Promise.all(
        assignmentForm.taskIds.map((taskId) =>
          request("/api/assignments", {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify({
              teamId: assignmentForm.teamId,
              taskId,
            }),
          }),
        ),
      );
      setAssignmentForm((current) => ({ ...current, taskIds: [] }));
      refreshDashboard();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setTeamError(null);
    setLoading(true);

    try {
      const session = await request<{ team: Team; assignments: Assignment[] }>(
        "/api/login",
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify(teamLogin),
        },
      );
      setTeamSession(session);
      router.push(`/team/${session.team.id}`);
    } catch (error) {
      setTeamSession(null);
      setTeamError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    const term = taskFilter.toLowerCase();
    if (!term) {
      return tasks;
    }
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(term) ||
        task.category.toLowerCase().includes(term),
    );
  }, [tasks, taskFilter]);

  const filteredHackathonTasks = useMemo(() => {
    const term = hackathonTaskFilter.toLowerCase();
    if (!term) {
      return tasks;
    }
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(term) ||
        task.category.toLowerCase().includes(term),
    );
  }, [tasks, hackathonTaskFilter]);

  const toggleTaskSelection = (taskId: string) => {
    setAssignmentForm((current) => {
      const selected = new Set(current.taskIds);
      if (selected.has(taskId)) {
        selected.delete(taskId);
      } else {
        selected.add(taskId);
      }
      return { ...current, taskIds: Array.from(selected) };
    });
  };

  const handleSelectAllFiltered = () => {
    setAssignmentForm((current) => ({
      ...current,
      taskIds: filteredTasks.map((task) => task.id),
    }));
  };

  const handleClearSelectedTasks = () => {
    setAssignmentForm((current) => ({ ...current, taskIds: [] }));
  };

  const groupedAssignments = useMemo(() => {
    const map = new Map<string, { team: Team; assignments: Assignment[] }>();

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

    return Array.from(map.values());
  }, [assignments, teams]);

  const filteredTeams = useMemo(() => {
    const term = teamSearch.trim().toLowerCase();
    if (!term) {
      return groupedAssignments;
    }
    return groupedAssignments.filter(({ team }) => {
      const name = team.name?.toLowerCase() ?? "";
      const username = team.username?.toLowerCase() ?? "";
      return name.includes(term) || username.includes(term);
    });
  }, [groupedAssignments, teamSearch]);

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

  if (adminStatus !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
        <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Secure Access
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Choose how you want to sign in
              </h1>
            </div>
            <div className="flex rounded-2xl border border-slate-200 p-1 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setAuthMode("admin")}
                className={`rounded-xl px-3 py-2 ${
                  authMode === "admin"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("team")}
                className={`rounded-xl px-3 py-2 ${
                  authMode === "team"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500"
                }`}
              >
                Team
              </button>
            </div>
          </div>

          {authMode === "admin" ? (
            <>
              {adminStatus === "loading" ? (
                <p className="mt-6 text-sm text-slate-500">
                  Checking existing session...
                </p>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={handleAdminLogin}>
                  <input
                    value={adminLogin.username}
                    onChange={(event) =>
                      setAdminLogin((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                    placeholder="Admin username"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    required
                  />
                  <input
                    type="password"
                    value={adminLogin.password}
                    onChange={(event) =>
                      setAdminLogin((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    disabled={adminLoading}
                  >
                    {adminLoading ? "Authorizing..." : "Enter dashboard"}
                  </button>
                </form>
              )}
              {adminError && (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {adminError}
                </p>
              )}
            </>
          ) : (
            <section className="mt-8 rounded-3xl border border-dashed border-slate-200 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Team Portal
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Use the credentials shared by your admin
              </h2>
              <form className="mt-6 flex flex-col gap-3 md:flex-row" onSubmit={handleLogin}>
                <input
                  value={teamLogin.username}
                  onChange={(event) =>
                    setTeamLogin((current) => ({ ...current, username: event.target.value }))
                  }
                  placeholder="Team username"
                  className="rounded-xl border border-slate-200 px-3 py-2"
                  required
                />
                <input
                  type="password"
                  value={teamLogin.password}
                  onChange={(event) =>
                    setTeamLogin((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Password"
                  className="rounded-xl border border-slate-200 px-3 py-2"
                  required
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-6 py-2 text-white"
                  disabled={loading}
                >
                  {loading ? "Checking..." : "Access"}
                </button>
              </form>

              {teamError && (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {teamError}
                </p>
              )}

              {teamSession && (
                <div className="mt-6">
                  <p className="text-sm text-slate-500">
                    Logged in as {teamSession.team.name} ({teamSession.team.username})
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {teamSession.assignments.length === 0 && (
                      <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                        No assignments yet. Ping the admin!
                      </p>
                    )}
                    {teamSession.assignments.map((assignment) => (
                      <article key={assignment.id} className="rounded-2xl border border-slate-200 p-4">
                        <h3 className="font-semibold">
                          {assignment.task?.title ?? "Unknown task"}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Status: {assignment.status}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {assignment.task?.description}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex max-w-7xl items-start gap-6">
        <AdminSidebar onLogout={handleAdminLogout} />
        <div className="flex-1 space-y-10">
          <header className="rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    Hackathon Control Tower
                  </p>
                  <h1 className="mt-2 text-4xl font-semibold">
                    Admin Dashboard
                  </h1>
                  <p className="mt-4 max-w-3xl text-slate-300">
                    Spin up teams, keep assignments organized, Point Top performing teams in one Admin workspace.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleStartHackathon}
                    disabled={hackathonLoading || hackathonStatus?.isActive || selectedHackathonTasks.length === 0}
                    className="rounded-xl border-2 border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={selectedHackathonTasks.length === 0 ? "Please select tasks before starting" : ""}
                  >
                    Start Hackathon
                  </button>
                  <button
                    type="button"
                    onClick={handleStopHackathon}
                    disabled={hackathonLoading || !hackathonStatus?.isActive}
                    className="rounded-xl border-2 border-red-500 bg-red-500/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Stop Hackathon
                  </button>
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="rounded-xl border-2 border-slate-400 bg-slate-400/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-400/20"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {hackathonStatus && (
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="rounded-3xl bg-white p-6 shadow">
                <h2 className="text-xl font-semibold mb-4">Hackathon Status</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-500">Status: </span>
                    <span className={`text-sm font-semibold ${hackathonStatus.isActive ? "text-emerald-600" : "text-slate-600"}`}>
                      {hackathonStatus.isActive ? "Live" : "Stopped"}
                    </span>
                  </div>
                  {hackathonStatus.startTime && (
                    <div>
                      <span className="text-sm text-slate-500">Start: </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {new Date(hackathonStatus.startTime).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {hackathonStatus.endTime && (
                    <div>
                      <span className="text-sm text-slate-500">End: </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {new Date(hackathonStatus.endTime).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-slate-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-slate-700">Set Timer Manually</h3>
                  </div>
                  <form onSubmit={handleSetTimer} className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        value={timerForm.startTime && hackathonStatus?.startTime 
                          ? new Date(hackathonStatus.startTime).toISOString().slice(0, 16) 
                          : ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            const date = new Date(e.target.value);
                            setTimerForm({
                              ...timerForm,
                              startTime: date.toISOString(),
                            });
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        value={timerForm.endTime && hackathonStatus?.endTime 
                          ? new Date(hackathonStatus.endTime).toISOString().slice(0, 16) 
                          : ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            const date = new Date(e.target.value);
                            setTimerForm({
                              ...timerForm,
                              endTime: date.toISOString(),
                            });
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="hackathonActive"
                        checked={timerForm.isActive}
                        onChange={(e) => setTimerForm({ ...timerForm, isActive: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      <label htmlFor="hackathonActive" className="text-sm text-slate-700">
                        Hackathon Active
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={hackathonLoading}
                      className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      {hackathonLoading ? "Updating..." : "Update Timer"}
                    </button>
                  </form>
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow">
                <h2 className="text-xl font-semibold mb-4">Statistics</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-500">Total Teams: </span>
                    <span className="text-sm font-semibold text-slate-900">{teams.length}</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Total Submissions: </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {assignments.filter((a) => a.submission).length}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Pending Review: </span>
                    <span className="text-sm font-semibold text-red-600">
                      {assignments.filter((a) => a.submission?.status === "pending").length}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Approved: </span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {assignments.filter((a) => a.submission?.status === "approved").length}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Are you sure you want to reset all submissions? This cannot be undone.")) {
                        // This would need an API endpoint
                        await refreshDashboard();
                      }
                    }}
                    className="w-full rounded-xl border-2 border-red-500 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                  >
                    Reset All Submissions
                  </button>
                </div>
              </section>
            </div>
          )}

          <main className="grid gap-8 items-start lg:grid-cols-3">
          <section className="space-y-6 rounded-3xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Admin Workspace</h2>
            <form className="space-y-3" onSubmit={handleCreateTeam}>
              <p className="text-sm font-medium text-slate-500">Create team</p>
              <div className="flex gap-2">
                <input
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  placeholder="Team name"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  required
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Generate
                </button>
              </div>
              {teamCreatedMessage && (
                <p className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700">
                  {teamCreatedMessage}
                </p>
              )}
            </form>

            <form className="space-y-3" onSubmit={handleCreateTask}>
              <p className="text-sm font-medium text-slate-500">Add custom task</p>
              <input
                value={taskForm.title}
                onChange={(event) =>
                  setTaskForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Task title"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={taskForm.category}
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, category: event.target.value }))
                  }
                  placeholder="Category"
                  className="rounded-xl border border-slate-200 px-3 py-2"
                  required
                />
                <select
                  value={taskForm.difficulty}
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, difficulty: event.target.value }))
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2"
                >
                  {difficulties.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={taskForm.description}
                onChange={(event) =>
                  setTaskForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Task description"
                className="min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={taskForm.points}
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, points: Number(event.target.value) }))
                  }
                  min={10}
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
                <input
                  value={taskForm.flag}
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, flag: event.target.value }))
                  }
                  placeholder="flag{custom_task}"
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
              <input
                value={taskForm.resources}
                onChange={(event) =>
                  setTaskForm((current) => ({ ...current, resources: event.target.value }))
                }
                placeholder="Comma-separated resources"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Publish Task
              </button>
            </form>

            {!hackathonStatus?.isActive && (
              <div className="space-y-3 rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">Select Tasks for Hackathon</p>
                <p className="text-xs text-blue-700">
                  Select tasks that will be automatically assigned to all teams when the hackathon starts.
                </p>
                <div className="space-y-2 rounded-xl border border-blue-200 bg-white p-3">
                  <input
                    type="text"
                    value={hackathonTaskFilter}
                    onChange={(event) => setHackathonTaskFilter(event.target.value)}
                    placeholder="Filter by title or category"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <button
                      type="button"
                      onClick={handleSelectAllFilteredHackathonTasks}
                      className="rounded-full bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700"
                      disabled={filteredHackathonTasks.length === 0}
                    >
                      Select all ({filteredHackathonTasks.length})
                    </button>
                    <button
                      type="button"
                      onClick={handleClearSelectedHackathonTasks}
                      className="rounded-full border border-slate-300 px-3 py-1 text-slate-600 hover:border-slate-400"
                      disabled={selectedHackathonTasks.length === 0}
                    >
                      Clear selected
                    </button>
                    <span className="self-center text-slate-500">
                      Selected: {selectedHackathonTasks.length || 0}
                    </span>
                  </div>
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-2">
                    {filteredHackathonTasks.length === 0 && (
                      <p className="text-sm text-slate-500">No tasks match this filter.</p>
                    )}
                    {filteredHackathonTasks.map((task) => {
                      const checked = selectedHackathonTasks.includes(task.id);
                      return (
                        <label
                          key={task.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                            checked
                              ? "border-blue-500 bg-blue-100"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleHackathonTaskSelection(task.id)}
                            className="mt-1"
                          />
                          <span className="flex flex-col">
                            <span className="font-semibold text-slate-900">{task.title}</span>
                            <span className="text-xs uppercase text-slate-500">
                              {task.category} · {task.points} pts
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSelectHackathonTasks}
                  className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={selectedHackathonTasks.length === 0 || hackathonLoading}
                >
                  {hackathonLoading ? "Saving..." : `Save Selected Tasks (${selectedHackathonTasks.length})`}
                </button>
                {hackathonStatus?.selectedTasks && hackathonStatus.selectedTasks.length > 0 && (
                  <p className="text-xs text-blue-600">
                    ✓ {hackathonStatus.selectedTasks.length} task(s) currently selected for hackathon
                  </p>
                )}
              </div>
            )}

            <form className="space-y-3" onSubmit={handleAssignment}>
              <p className="text-sm font-medium text-slate-500">
                {hackathonStatus?.isActive 
                  ? "Manual task assignment (disabled during hackathon)" 
                  : "Assign task to team (manual)"}
              </p>
              <select
                value={assignmentForm.teamId}
                onChange={(event) =>
                  setAssignmentForm((current) => ({ ...current, teamId: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={hackathonStatus?.isActive}
              >
                <option value="">Select team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <div className="space-y-2 rounded-2xl border border-slate-200 p-3">
                <label className="text-xs uppercase tracking-wide text-slate-400">
                  Select one or more tasks
                </label>
                <input
                  type="text"
                  value={taskFilter}
                  onChange={(event) => setTaskFilter(event.target.value)}
                  placeholder="Filter by title or category"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="rounded-full bg-slate-900 px-3 py-1 text-white transition hover:bg-slate-800"
                    disabled={filteredTasks.length === 0}
                  >
                    Select all ({filteredTasks.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSelectedTasks}
                    className="rounded-full border border-slate-300 px-3 py-1 text-slate-600 hover:border-slate-400"
                    disabled={assignmentForm.taskIds.length === 0}
                  >
                    Clear selected
                  </button>
                  <span className="self-center text-slate-500">
                    Active: {assignmentForm.taskIds.length || 0}
                  </span>
                </div>
                <div className="max-h-56 space-y-2 overflow-y-auto pr-2">
                  {filteredTasks.length === 0 && (
                    <p className="text-sm text-slate-500">No tasks match this filter.</p>
                  )}
                  {filteredTasks.map((task) => {
                    const checked = assignmentForm.taskIds.includes(task.id);
                    return (
                      <label
                        key={task.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                          checked
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTaskSelection(task.id)}
                          className="mt-1"
                        />
                        <span className="flex flex-col">
                          <span className="font-semibold text-slate-900">{task.title}</span>
                          <span className="text-xs uppercase text-slate-500">
                            {task.category} · {task.points} pts
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!assignmentForm.teamId || assignmentForm.taskIds.length === 0 || hackathonStatus?.isActive}
              >
                {hackathonStatus?.isActive ? "Disabled during hackathon" : "Assign"}
              </button>
              {hackathonStatus?.isActive && (
                <p className="text-xs text-slate-500">
                  Manual assignments are disabled while the hackathon is active. All teams have been assigned the selected tasks automatically.
                </p>
              )}
            </form>
          </section>

          <section className="space-y-4 rounded-3xl bg-white p-6 shadow lg:col-span-2">
            <h2 className="text-xl font-semibold">Live Challenge Board</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {tasks.map((task) => {
                const isInteractiveChallenge = task.resources?.some(resource => 
                  resource.startsWith('/challenges/')
                );
                const challengeLink = task.resources?.find(resource => 
                  resource.startsWith('/challenges/')
                );
                const isSeedTask = task.id && protectedSeedTaskIds.includes(task.id);
                
                return (
                  <article key={task.id} className="relative rounded-2xl border border-slate-200 p-4">
                    {!isSeedTask && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`Are you sure you want to delete "${task.title}"? This will also delete all related assignments and submissions. This action cannot be undone.`)) {
                            return;
                          }
                          
                          try {
                            const response = await fetch(`/api/tasks?id=${task.id}`, {
                              method: "DELETE",
                            });
                            
                            if (response.ok) {
                              // Refresh tasks list
                              const tasksResponse = await fetch("/api/tasks");
                              if (tasksResponse.ok) {
                                const updatedTasks = await tasksResponse.json();
                                setTasks(updatedTasks);
                              }
                            } else {
                              const error = await response.json();
                              alert(error.error || "Failed to delete challenge");
                            }
                          } catch (error) {
                            console.error("Delete error:", error);
                            alert("Failed to delete challenge. Please try again.");
                          }
                        }}
                        className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Delete challenge"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-y-1 text-xs uppercase tracking-wide text-slate-400">
                      <span>{task.category}</span>
                      <span className="font-semibold text-slate-600">
                        {task.points} pts · {task.difficulty}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{task.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 break-words">
                      {task.description}
                    </p>
                    {isInteractiveChallenge && challengeLink ? (
                      <div className="mt-3">
                        <a
                          href={challengeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition"
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
                              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                            />
                          </svg>
                          Open Interactive Challenge
                        </a>
                      </div>
                    ) : task.resources?.length ? (
                      <ul className="mt-3 space-y-1 text-xs text-slate-500">
                        {task.resources.map((resource, index) => (
                          <li key={resource + index} className="break-words">
                            <a
                              href={resource}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              🔗 {resource}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                );
              })}
            </div>

          </section>
        </main>

        <section className="rounded-3xl bg-white p-6 shadow">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Team Portal
              </p>
              <h2 className="text-2xl font-semibold">
                Secure login for competitors
              </h2>
            </div>
            <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleLogin}>
              <input
                value={teamLogin.username}
                onChange={(event) =>
                  setTeamLogin((current) => ({ ...current, username: event.target.value }))
                }
                placeholder="Username"
                className="rounded-xl border border-slate-200 px-3 py-2"
                required
              />
              <input
                type="password"
                value={teamLogin.password}
                onChange={(event) =>
                  setTeamLogin((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Password"
                className="rounded-xl border border-slate-200 px-3 py-2"
                required
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-6 py-2 text-white"
                disabled={loading}
              >
                {loading ? "Checking..." : "Access"}
              </button>
            </form>
          </div>

          {teamError && (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {teamError}
            </p>
          )}

          {teamSession && (
            <div className="mt-6">
              <p className="text-sm text-slate-500">
                Logged in as {teamSession.team.name} ({teamSession.team.username})
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {teamSession.assignments.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                    No assignments yet. Ping the admin!
                  </p>
                )}
                {teamSession.assignments.map((assignment) => (
                  <article key={assignment.id} className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="font-semibold">
                      {assignment.task?.title ?? "Unknown task"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Status: {assignment.status}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {assignment.task?.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
        </div>
      </div>
    </div>
  );
}

export default HomeClient;
