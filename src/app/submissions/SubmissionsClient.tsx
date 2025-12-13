"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminSidebar } from "@/app/components/AdminSidebar";

type SubmissionWithDetails = {
  id: string;
  assignmentId: string;
  teamId: string;
  plan: string;
  findings: string;
  flag: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "approved" | "rejected";
  pointsAwarded: number;
  adminNotes: string;
  reviewedAt: string | null;
  team?: {
    id: string;
    name: string;
    username: string;
  };
  task?: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    points: number;
    flag: string;
  };
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

export function SubmissionsClient() {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<{
    submissionId: string;
    status: "approved" | "rejected";
    pointsAwarded: number;
    adminNotes: string;
  } | null>(null);

  const refreshSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await request<SubmissionWithDetails[]>("/api/submissions");
      setSubmissions(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    refreshSubmissions().then(() => {
      if (!mounted) return;
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount


  const handleDelete = async (submissionId: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;

    try {
      // Note: We'd need a DELETE endpoint for this, but for now we'll skip it
      // await request(`/api/submissions/${submissionId}`, { method: "DELETE" });
      await refreshSubmissions();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to delete submission");
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

  const pendingSubmissions = submissions.filter((s) => s.status === "pending");
  const approvedSubmissions = submissions.filter((s) => s.status === "approved");
  const rejectedSubmissions = submissions.filter((s) => s.status === "rejected");

  const getFilteredSubmissions = () => {
    switch (activeTab) {
      case "pending":
        return pendingSubmissions;
      case "approved":
        return approvedSubmissions;
      case "rejected":
        return rejectedSubmissions;
      default:
        return pendingSubmissions;
    }
  };

  const filteredSubmissions = getFilteredSubmissions();

  const getTitle = () => {
    switch (activeTab) {
      case "pending":
        return "Pending Submissions";
      case "approved":
        return "Approved Submissions";
      case "rejected":
        return "Rejected Submissions";
      default:
        return "Submissions";
    }
  };

  const formatTeamAnswer = (submission: SubmissionWithDetails) => {
    try {
      // Try to parse as JSON for better formatting
      const parsed = JSON.parse(submission.flag);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return submission.flag;
    }
  };

  const getFieldLabels = (submission: SubmissionWithDetails) => {
    const taskTitle = submission.task?.title?.toLowerCase() || "";
    const taskCategory = submission.task?.category?.toLowerCase() || "";
    
    // Spot the Phish
    if (taskTitle.includes("phishing") || taskTitle.includes("phish")) {
      return {
        plan: "Advanced Red Flags Identified",
        findings: "Enterprise Prevention Strategies",
        flag: "Selected Phishing Emails",
      };
    }
    
    // SQL Injection
    if (taskTitle.includes("sql injection") || taskTitle.includes("sqli")) {
      return {
        plan: "Vulnerability Analysis",
        findings: "Secure Solution Implementation",
        flag: "Flag or Answer",
      };
    }
    
    // Bug Hunt / Code Review
    if (taskTitle.includes("bug hunt") || taskTitle.includes("code review")) {
      return {
        plan: "",
        findings: "Comprehensive Security Analysis",
        flag: "Flag or Answer",
      };
    }
    
    // Network Traffic
    if (taskTitle.includes("network traffic") || taskTitle.includes("threat hunting")) {
      return {
        plan: "",
        findings: "Comprehensive Threat Intelligence Report",
        flag: "Flag or Answer",
      };
    }
    
    // Terms & Conditions
    if (taskTitle.includes("terms") || taskTitle.includes("conditions") || taskTitle.includes("legal")) {
      return {
        plan: "",
        findings: "Comprehensive Legal Security Audit",
        flag: "Flag or Answer",
      };
    }
    
    // Cipher Analysis
    if (taskTitle.includes("cipher") || taskTitle.includes("cryptographic") || (taskTitle.includes("crypto") && !taskTitle.includes("ecdsa"))) {
      return {
        plan: "",
        findings: "Cryptanalysis Methodology",
        flag: "Decoded Ciphers",
      };
    }
    
    // Social Media Detector
    if (taskTitle.includes("social media") || (taskTitle.includes("osint") && !taskTitle.includes("phishing infra"))) {
      return {
        plan: "",
        findings: "Security Analysis",
        flag: "Flag or Answer",
      };
    }
    
    // Cyber Mad Libs
    if (taskTitle.includes("mad libs") || taskTitle.includes("scenario")) {
      return {
        plan: "",
        findings: "Completed Story",
        flag: "Flag or Answer",
      };
    }
    
    // Malware Analysis
    if (taskTitle.includes("malware") || taskTitle.includes("beacon chain")) {
      return {
        plan: "",
        findings: "Decryption Methodology",
        flag: "Decrypted Command",
      };
    }
    
    // DFIR
    if (taskTitle.includes("dfir") || taskTitle.includes("log tampering")) {
      return {
        plan: "",
        findings: "Log Analysis & Timeline Reconstruction",
        flag: "Recovered User ID",
      };
    }
    
    // Email Forensics
    if (taskTitle.includes("email forensics") || taskTitle.includes("polyglot")) {
      return {
        plan: "",
        findings: "Email Analysis & Extraction Methodology",
        flag: "C2 Domain",
      };
    }
    
    // Reverse Engineering
    if (taskTitle.includes("reverse engineering") || taskTitle.includes("vm-based")) {
      return {
        plan: "",
        findings: "Reverse Engineering Analysis",
        flag: "API Token",
      };
    }
    
    // Network Forensics
    if (taskTitle.includes("network forensics") || taskTitle.includes("timing channel")) {
      return {
        plan: "",
        findings: "Network Analysis & Timing Channel Extraction",
        flag: "Hidden Operator Message",
      };
    }
    
    // Firmware Security
    if (taskTitle.includes("firmware") || taskTitle.includes("nor dump")) {
      return {
        plan: "",
        findings: "Firmware Analysis & LFSR Reverse Engineering",
        flag: "Rootfs Password",
      };
    }
    
    // Web Exploitation
    if (taskTitle.includes("web exploitation") || taskTitle.includes("deserialization")) {
      return {
        plan: "",
        findings: "Exploitation Chain Analysis",
        flag: "ADMIN_SECRET",
      };
    }
    
    // OSINT Phishing Infra
    if (taskTitle.includes("phishing infra") || taskTitle.includes("threat intel")) {
      return {
        plan: "",
        findings: "OSINT Investigation & Infrastructure Attribution",
        flag: "Hosting Provider Account Name",
      };
    }
    
    // Crypto ECDSA
    if (taskTitle.includes("ecdsa") || taskTitle.includes("nonce leakage")) {
      return {
        plan: "",
        findings: "Lattice Reduction Analysis",
        flag: "Private Key",
      };
    }
    
    // Cloud Security
    if (taskTitle.includes("cloud security") || taskTitle.includes("iam") || taskTitle.includes("shadow role")) {
      return {
        plan: "",
        findings: "Cloud Security Analysis & Exploitation Chain",
        flag: "COMPROMISED_KEY",
      };
    }
    
    // Base64 Detective
    if (taskTitle.includes("base64") && taskTitle.includes("detective")) {
      return {
        plan: "Decoding Methodology",
        findings: "Decoded Message",
        flag: "Flag",
      };
    }
    
    // ROT All The Things
    if (taskTitle.includes("rot all the things") || (taskTitle.includes("rot") && taskTitle.includes("all"))) {
      return {
        plan: "Decoding Methodology",
        findings: "Decoded Message",
        flag: "Flag",
      };
    }
    
    // Hex Dump Message
    if (taskTitle.includes("hex dump") || (taskTitle.includes("hex") && taskTitle.includes("message"))) {
      return {
        plan: "Conversion Methodology",
        findings: "Decoded Message",
        flag: "Flag",
      };
    }
    
    // Active Directory Privilege Escalation
    if (taskTitle.includes("active directory") || (taskTitle.includes("ad") && taskTitle.includes("privilege"))) {
      return {
        plan: "Escalation Methodology",
        findings: "Escalation Path",
        flag: "Flag",
      };
    }
    
    // Blockchain Smart Contract Exploit
    if (taskTitle.includes("blockchain") || (taskTitle.includes("smart contract") && taskTitle.includes("exploit"))) {
      return {
        plan: "Exploitation Methodology",
        findings: "Exploit Details",
        flag: "Flag",
      };
    }
    
    // Port Knock Sequence
    if (taskTitle.includes("port knock") || taskTitle.includes("port sequence")) {
      return {
        plan: "Analysis Methodology",
        findings: "Next 3 Ports",
        flag: "Flag",
      };
    }
    
    // SQL Injection Theory
    if (taskTitle.includes("sql injection theory") || (taskTitle.includes("sql") && taskTitle.includes("theory"))) {
      return {
        plan: "Analysis Methodology",
        findings: "SQL Injection Payload",
        flag: "Flag",
      };
    }
    
    // OSINT Challenge
    if (taskTitle.includes("osint challenge") || (taskTitle.includes("osint") && !taskTitle.includes("phishing infra"))) {
      return {
        plan: "Investigation Methodology",
        findings: "Answers",
        flag: "Flag",
      };
    }
    
    // Hash Cracker
    if (taskTitle.includes("hash cracker") || (taskTitle.includes("hash") && taskTitle.includes("crack"))) {
      return {
        plan: "Cracking Methodology",
        findings: "Cracked Passwords",
        flag: "Flag",
      };
    }
    
    // Caesar Cipher With Twist
    if (taskTitle.includes("caesar cipher") || (taskTitle.includes("caesar") && taskTitle.includes("twist"))) {
      return {
        plan: "Decryption Methodology",
        findings: "Decrypted Message",
        flag: "Flag",
      };
    }
    
    // JWT Decode Challenge
    if (taskTitle.includes("jwt decode") || (taskTitle.includes("jwt") && taskTitle.includes("decode"))) {
      return {
        plan: "Decoding Methodology",
        findings: "Decoded Payload",
        flag: "Flag",
      };
    }
    
    // Python Code Review
    if (taskTitle.includes("python code review") || (taskTitle.includes("python") && taskTitle.includes("code review"))) {
      return {
        plan: "Review Methodology",
        findings: "Identified Vulnerabilities",
        flag: "Flag",
      };
    }
    
    // OAuth Flow Exploit
    if (taskTitle.includes("oauth flow") || (taskTitle.includes("oauth") && taskTitle.includes("exploit"))) {
      return {
        plan: "Exploitation Methodology",
        findings: "Exploit Details",
        flag: "Flag",
      };
    }
    
    // Cipher Chain
    if (taskTitle.includes("cipher chain") || (taskTitle.includes("cipher") && taskTitle.includes("chain"))) {
      return {
        plan: "Decoding Methodology",
        findings: "Decoded Message",
        flag: "Flag",
      };
    }
    
    // RSA Small Exponent
    if (taskTitle.includes("rsa small") || (taskTitle.includes("rsa") && taskTitle.includes("exponent"))) {
      return {
        plan: "Decryption Methodology",
        findings: "Decrypted Message",
        flag: "Flag",
      };
    }
    
    // Memory Dump Analysis
    if (taskTitle.includes("memory dump") || (taskTitle.includes("memory") && taskTitle.includes("dump"))) {
      return {
        plan: "Analysis Methodology",
        findings: "Extracted Data",
        flag: "Flag",
      };
    }
    
    // Regex Bypass
    if (taskTitle.includes("regex bypass") || (taskTitle.includes("regex") && taskTitle.includes("bypass"))) {
      return {
        plan: "Bypass Methodology",
        findings: "Bypass Payload",
        flag: "Flag",
      };
    }
    
    // Logic Bomb Discovery
    if (taskTitle.includes("logic bomb") || (taskTitle.includes("logic") && taskTitle.includes("bomb"))) {
      return {
        plan: "Analysis Methodology",
        findings: "Identified Logic Bombs",
        flag: "Flag",
      };
    }
    
    // Default fallback
    return {
      plan: "Recon Plan",
      findings: "Findings",
      flag: "Flag or Answer",
    };
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex max-w-7xl gap-6">
        <AdminSidebar onLogout={handleAdminLogout} />
        <div className="flex-1 space-y-6">
          <header className="rounded-3xl bg-white px-8 py-6 shadow">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-900">
                  {getTitle()}
                </h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("pending")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      activeTab === "pending"
                        ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent"
                    }`}
                  >
                    Pending Review ({pendingSubmissions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("approved")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      activeTab === "approved"
                        ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent"
                    }`}
                  >
                    Approved ({approvedSubmissions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("rejected")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      activeTab === "rejected"
                        ? "bg-red-100 text-red-800 border-2 border-red-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent"
                    }`}
                  >
                    Rejected ({rejectedSubmissions.length})
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => refreshSubmissions()}
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
              Loading submissions...
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center text-slate-500 shadow">
              {activeTab === "pending" && "No pending submissions."}
              {activeTab === "approved" && "No approved submissions."}
              {activeTab === "rejected" && "No rejected submissions."}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-3xl bg-white p-6 shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {submission.team?.name || "Unknown Team"} - {submission.task?.title || "Unknown Challenge"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Submitted: {new Date(submission.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          submission.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : submission.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {submission.status === "pending"
                          ? "Pending Review"
                          : submission.status === "approved"
                            ? "Approved"
                            : "Rejected"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(submission.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                        title="Delete submission"
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
                    </div>
                  </div>

                  {(() => {
                    const fieldLabels = getFieldLabels(submission);
                    return (
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">
                            {fieldLabels.flag}
                          </h3>
                          <pre className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                            {formatTeamAnswer(submission)}
                          </pre>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">
                            Expected Answer
                          </h3>
                          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-slate-700">
                            {submission.task?.flag || "N/A"}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const fieldLabels = getFieldLabels(submission);
                    return (
                      <div className="grid gap-6 md:grid-cols-2 mt-6">
                        {fieldLabels.plan && (
                          <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">
                              {fieldLabels.plan}
                            </h3>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 whitespace-pre-wrap min-h-[100px]">
                              {submission.plan || <span className="text-slate-400 italic">No {fieldLabels.plan.toLowerCase()} provided</span>}
                            </div>
                          </div>
                        )}
                        <div className={fieldLabels.plan ? "" : "md:col-span-2"}>
                          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">
                            {fieldLabels.findings}
                          </h3>
                          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 whitespace-pre-wrap min-h-[100px]">
                            {submission.findings || <span className="text-slate-400 italic">No {fieldLabels.findings.toLowerCase()} provided</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {submission.status === "pending" && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Points to Award
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={submission.task?.points || 1000}
                          value={
                            reviewForm?.submissionId === submission.id
                              ? reviewForm.pointsAwarded
                              : 0
                          }
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            if (reviewForm?.submissionId === submission.id) {
                              setReviewForm({
                                ...reviewForm,
                                pointsAwarded: value,
                              });
                            } else {
                              setReviewForm({
                                submissionId: submission.id,
                                status: "approved",
                                pointsAwarded: value,
                                adminNotes: "",
                              });
                            }
                          }}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Admin Notes
                        </label>
                        <textarea
                          value={
                            reviewForm?.submissionId === submission.id
                              ? reviewForm.adminNotes
                              : ""
                          }
                          onChange={(e) => {
                            if (reviewForm?.submissionId === submission.id) {
                              setReviewForm({
                                ...reviewForm,
                                adminNotes: e.target.value,
                              });
                            } else {
                              setReviewForm({
                                submissionId: submission.id,
                                status: "approved",
                                pointsAwarded: 0,
                                adminNotes: e.target.value,
                              });
                            }
                          }}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2"
                          rows={3}
                          placeholder="Optional feedback..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={async () => {
                            const form = {
                              submissionId: submission.id,
                              status: "approved" as const,
                              pointsAwarded: reviewForm?.submissionId === submission.id ? reviewForm.pointsAwarded : 0,
                              adminNotes: reviewForm?.submissionId === submission.id ? reviewForm.adminNotes : "",
                            };
                            setReviewForm(form);
                            setReviewingId(submission.id);
                            try {
                              await request("/api/submissions", {
                                method: "PATCH",
                                headers: jsonHeaders,
                                body: JSON.stringify(form),
                              });
                              setReviewForm(null);
                              await refreshSubmissions();
                              // Switch to approved tab after approval
                              setActiveTab("approved");
                            } catch (err) {
                              console.error(err);
                              setError(err instanceof Error ? err.message : "Failed to review submission");
                            } finally {
                              setReviewingId(null);
                            }
                          }}
                          disabled={reviewingId === submission.id}
                          className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {reviewingId === submission.id ? "Processing..." : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const form = {
                              submissionId: submission.id,
                              status: "rejected" as const,
                              pointsAwarded: 0,
                              adminNotes: reviewForm?.submissionId === submission.id ? reviewForm.adminNotes : "",
                            };
                            setReviewForm(form);
                            setReviewingId(submission.id);
                            try {
                              await request("/api/submissions", {
                                method: "PATCH",
                                headers: jsonHeaders,
                                body: JSON.stringify(form),
                              });
                              setReviewForm(null);
                              await refreshSubmissions();
                              // Switch to rejected tab after rejection
                              setActiveTab("rejected");
                            } catch (err) {
                              console.error(err);
                              setError(err instanceof Error ? err.message : "Failed to review submission");
                            } finally {
                              setReviewingId(null);
                            }
                          }}
                          disabled={reviewingId === submission.id}
                          className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          {reviewingId === submission.id ? "Processing..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  )}

                  {submission.status !== "pending" && (
                    <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-slate-700">
                          Points Awarded: {submission.pointsAwarded}
                        </span>
                        {submission.reviewedAt && (
                          <span className="text-xs text-slate-500">
                            Reviewed: {new Date(submission.reviewedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {submission.adminNotes && (
                        <p className="text-sm text-slate-600 mt-2">
                          {submission.adminNotes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

