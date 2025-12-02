"use client";

import { useCallback, useEffect, useState } from "react";

import type { AssignmentWithTask, Team } from "@/lib/store";

type SubmissionDraft = {
  plan: string;
  findings: string;
  flag: string;
};

type Props = {
  team: Team;
  assignment: AssignmentWithTask;
};

const jsonHeaders = { "Content-Type": "application/json" } as const;

export function ChallengeWorkspace({ team, assignment }: Props) {
  const [currentAssignment, setCurrentAssignment] =
    useState<AssignmentWithTask>(assignment);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingSubmission, setIsSavingSubmission] = useState(false);
  const [draft, setDraft] = useState<SubmissionDraft>({
    plan: assignment.submission?.plan ?? "",
    findings: assignment.submission?.findings ?? "",
    flag: assignment.submission?.flag ?? "",
  });
  const [hackathonActive, setHackathonActive] = useState(true);

  // Check hackathon status periodically
  const checkHackathonStatus = useCallback(async () => {
    try {
      const status = await fetch("/api/hackathon").then((res) => res.json());
      setHackathonActive(status.isActive);
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

  const updateDraft = (nextDraft: SubmissionDraft) => {
    setDraft(nextDraft);
  };

  const handleStatusChange = async (status: AssignmentWithTask["status"]) => {
    if (!hackathonActive) {
      setStatusMessage("Hackathon is not active. Cannot update status.");
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await fetch("/api/assignments", {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ assignmentId: assignment.id, status }),
      });
      setCurrentAssignment((current) => ({
        ...current,
        status,
        lastUpdated: new Date().toISOString(),
      }));
      setStatusMessage("Progress saved.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const handleSubmissionSave = async () => {
    if (!hackathonActive) {
      setStatusMessage("Hackathon is not active. Cannot submit challenges.");
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setIsSavingSubmission(true);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          assignmentId: assignment.id,
          teamId: team.id,
          plan: draft.plan,
          findings: draft.findings,
          flag: draft.flag,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Failed to save submission.");
      }

      const savedSubmission = await response.json();
      setCurrentAssignment((current) => ({
        ...current,
        submission: savedSubmission,
      }));
      setStatusMessage("Submission synced with HQ.");
    } catch (error) {
      console.error(error);
      setStatusMessage(
        error instanceof Error ? error.message : "Failed to save submission.",
      );
    } finally {
      setIsSavingSubmission(false);
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const task = currentAssignment.task;

  return (
    <section className="rounded-3xl bg-white p-6 shadow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Challenge brief
          </p>
          <h1 className="text-3xl font-semibold">
            {task?.title ?? "Untitled challenge"}
          </h1>
          <p className="text-sm text-slate-500">
            {task?.category ?? "Cyber operation"} ·{" "}
            {task?.difficulty ?? "intermediate"} · {task?.points ?? 0} points
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Current status
          </p>
          <select
            value={currentAssignment.status}
            onChange={(event) =>
              handleStatusChange(event.target.value as AssignmentWithTask["status"])
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            disabled={isUpdatingStatus}
          >
            {["assigned", "in-progress", "completed"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {statusMessage && (
            <p className="text-xs font-medium text-emerald-600">{statusMessage}</p>
          )}
          {currentAssignment.submission?.updatedAt ? (
            <p className="text-xs text-slate-500">
              Last submission:{" "}
              {new Date(currentAssignment.submission.updatedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        {task?.description ??
          "Your admin has not shared a description for this challenge yet."}
      </p>

      {task?.resources?.length ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Field kit
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {task.resources.map((resource, index) => (
              <li key={resource + index}>
                <a
                  href={resource}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-900 underline"
                >
                  {resource}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <label className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 text-sm">
          <span className="font-semibold text-slate-700">Recon plan</span>
          <textarea
            value={draft.plan}
            onChange={(event) =>
              updateDraft({
                ...draft,
                plan: event.target.value,
              })
            }
            placeholder="Outline how you will approach this mission..."
            className="min-h-[120px] rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 text-sm">
          <span className="font-semibold text-slate-700">Findings</span>
          <textarea
            value={draft.findings}
            onChange={(event) =>
              updateDraft({
                ...draft,
                findings: event.target.value,
              })
            }
            placeholder="Document artifacts, indicators, payloads..."
            className="min-h-[120px] rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 text-sm">
          <span className="font-semibold text-slate-700">Flag or answer</span>
          <textarea
            value={draft.flag}
            onChange={(event) =>
              updateDraft({
                ...draft,
                flag: event.target.value,
              })
            }
            placeholder="flag{...} / remediation summary"
            className="min-h-[120px] rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSubmissionSave}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          disabled={isSavingSubmission || !hackathonActive}
        >
          {isSavingSubmission ? "Saving..." : "Save submission"}
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("in-progress")}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          disabled={isUpdatingStatus || !hackathonActive}
        >
          Mark in progress
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("completed")}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-60"
          disabled={isUpdatingStatus || !hackathonActive}
        >
          Mark complete
        </button>
      </div>
      {!hackathonActive && (
        <div className="mt-4 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          Hackathon is not active. You cannot submit or update challenges at this time.
        </div>
      )}
    </section>
  );
}

