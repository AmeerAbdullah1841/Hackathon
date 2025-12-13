"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";
import { useChallengeSubmission } from "../hooks/useChallengeSubmission";

function SQLInjectionTheoryPageContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const assignmentId = searchParams.get("assignment");

  const {
    submissionData,
    updateSubmissionData,
    saveSubmission,
    isSaving,
    saveMessage,
  } = useChallengeSubmission(teamId, assignmentId);

  const [showTutorial, setShowTutorial] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const methodology = submissionData.plan || "";
  const payload = submissionData.findings || "";
  const flag = submissionData.flag || "";

  const setMethodology = (value: string) => updateSubmissionData("plan", value);
  const setPayload = (value: string) => updateSubmissionData("findings", value);
  const setFlag = (value: string) => updateSubmissionData("flag", value);

  const handleSave = async () => {
    await saveSubmission();
  };

  const handleSubmit = async () => {
    if (!flag.trim()) {
      alert("Please provide the flag before submitting.");
      return;
    }
    await saveSubmission();
    setSubmitted(true);
    alert("Submission successful! Great work on the SQL injection theory.");
  };

  return (
    <ChallengeLayout
      challengeTitle="SQL Injection Theory"
      difficulty="EASY"
      points={150}
    >
      <div className="space-y-6">
        {showTutorial && (
          <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                SQL Injection Tutorial
              </h3>
              <button type="button" onClick={() => setShowTutorial(false)} className="rounded-lg border border-blue-300 px-3 py-1 text-sm hover:bg-blue-100">
                Hide Tutorial
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-semibold text-blue-700">SQL Injection Basics:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>SQL injection occurs when user input is directly concatenated into SQL queries</li>
                  <li>Attackers can inject SQL code to manipulate the query</li>
                  <li>Common techniques: comment out rest of query (-- or #), use OR 1=1, UNION SELECT</li>
                  <li>Goal: bypass authentication or extract data</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-green-700">Common Payloads:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>admin' -- (comment out password check)</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>' OR '1'='1 (always true condition)</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>' UNION SELECT * FROM users --</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              Given a vulnerable SQL query, construct a payload that would bypass authentication and return all users. 
              Flag format: flag{'{'}your_sql_injection_payload{'}'}
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Vulnerable SQL Query:</p>
                <pre className="rounded-lg bg-white p-3 text-sm font-mono">
{`SELECT * FROM users 
WHERE username='$user' AND password='$pass'`}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Question:</p>
                <p className="text-sm text-slate-700">What input for $user would bypass authentication? Construct the payload that would return all users.</p>
              </div>
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Hint:</strong> You need to close the username string, add a condition that's always true (like OR 1=1), and comment out the password check. Example: admin' OR '1'='1' --
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Analysis Methodology:
              </label>
              <textarea
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                rows={6}
                placeholder="Explain how you constructed the SQL injection payload..."
              />
              <p className="mt-1 text-xs text-slate-400">{methodology.length} characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                SQL Injection Payload:
              </label>
              <input
                type="text"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-mono"
                placeholder="admin' OR '1'='1' --"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Flag:
              </label>
              <input
                type="text"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="flag{'{'}your_sql_injection_payload{'}'}"
              />
            </div>

            {saveMessage && (
              <div className={`rounded-lg p-3 text-sm ${
                saveMessage.includes("success") || saveMessage.includes("Submission successful")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}>
                {saveMessage}
              </div>
            )}

            <div className="flex gap-3">
              {teamId && assignmentId && (
                <button type="button" onClick={handleSave} disabled={isSaving} className="flex-1 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Progress"}
                </button>
              )}
              <button type="button" onClick={handleSubmit} disabled={!flag.trim() || submitted || isSaving} className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {submitted ? "Submitted" : isSaving ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChallengeLayout>
  );
}

export default function SQLInjectionTheoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600">Loading challenge...</div>
        </div>
      </div>
    }>
      <SQLInjectionTheoryPageContent />
    </Suspense>
  );
}

