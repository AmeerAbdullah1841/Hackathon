"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";
import { useChallengeSubmission } from "../hooks/useChallengeSubmission";

function Base64DetectivePageContent() {
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
  const decodedMessage = submissionData.findings || "";
  const flag = submissionData.flag || "";

  const setMethodology = (value: string) => updateSubmissionData("plan", value);
  const setDecodedMessage = (value: string) => updateSubmissionData("findings", value);
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
    alert("Submission successful! Great work on the base64 decoding.");
  };

  return (
    <ChallengeLayout
      challengeTitle="Base64 Detective"
      difficulty="EASY"
      points={100}
    >
      <div className="space-y-6">
        {showTutorial && (
          <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Base64 Decoding Tutorial
              </h3>
              <button type="button" onClick={() => setShowTutorial(false)} className="rounded-lg border border-blue-300 px-3 py-1 text-sm hover:bg-blue-100">
                Hide Tutorial
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-semibold text-blue-700">How to Approach This Challenge:</h4>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-slate-700">
                  <li>Identify Base64 encoded strings (typically contain A-Z, a-z, 0-9, +, /, and = padding)</li>
                  <li>Use online tools or command-line utilities to decode</li>
                  <li>Look for multiple layers of encoding (Base64 within Base64)</li>
                  <li>Check if the decoded output is another encoded format</li>
                  <li>Continue decoding until you reach plaintext</li>
                </ol>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-green-700">Tools & Techniques:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Online: base64decode.org, cyberchef.io</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Command-line: base64 -d (Linux/Mac), certutil -decode (Windows)</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Python: base64.b64decode()</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Look for flag format: {'flag{...}'}</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              Decode the Base64 encoded message to reveal the hidden flag. The message may be encoded multiple times. 
              Flag format: flag{'{'}decoded_text{'}'}
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Base64 Encoded Message:</p>
                <code className="block rounded-lg bg-white p-3 text-sm font-mono break-all">
                  VGhlIGZsYWcgaXMgZmxhZ3tkZXRlY3RpdmVfYmFzZTY0X2RlY29kZXJ9
                </code>
              </div>
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Hint:</strong> This is a single-layer Base64 encoding. Decode it once to get the flag.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Decoding Methodology:
              </label>
              <textarea
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                rows={6}
                placeholder="Describe your decoding approach..."
              />
              <p className="mt-1 text-xs text-slate-400">{methodology.length} characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Decoded Message:
              </label>
              <input
                type="text"
                value={decodedMessage}
                onChange={(e) => setDecodedMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Enter decoded message..."
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
                placeholder="flag{'{'}decoded_text{'}'}"
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

export default function Base64DetectivePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600">Loading challenge...</div>
        </div>
      </div>
    }>
      <Base64DetectivePageContent />
    </Suspense>
  );
}

