"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";
import { useChallengeSubmission } from "../hooks/useChallengeSubmission";

function ActiveDirectoryPrivilegeEscalationPageContent() {
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
  const escalationPath = submissionData.findings || "";
  const flag = submissionData.flag || "";

  const setMethodology = (value: string) => updateSubmissionData("plan", value);
  const setEscalationPath = (value: string) => updateSubmissionData("findings", value);
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
    alert("Submission successful! Great work on the AD privilege escalation.");
  };

  return (
    <ChallengeLayout
      challengeTitle="Active Directory Privilege Escalation"
      difficulty="HARD"
      points={300}
    >
      <div className="space-y-6">
        {showTutorial && (
          <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                AD Privilege Escalation Tutorial
              </h3>
              <button type="button" onClick={() => setShowTutorial(false)} className="rounded-lg border border-blue-300 px-3 py-1 text-sm hover:bg-blue-100">
                Hide Tutorial
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-semibold text-blue-700">Common AD Escalation Techniques:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li><strong>Kerberoasting:</strong> Extract service account hashes</li>
                  <li><strong>AS-REP Roasting:</strong> Target accounts with pre-auth disabled</li>
                  <li><strong>DCSync:</strong> Replicate password hashes from DC</li>
                  <li><strong>Unconstrained Delegation:</strong> Abuse service accounts</li>
                  <li><strong>Constrained Delegation:</strong> Abuse S4U2Self/S4U2Proxy</li>
                  <li><strong>ACL Abuse:</strong> Exploit misconfigured permissions</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-green-700">Tools & Techniques:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Impacket: GetNPUsers, GetUserSPNs, secretsdump</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>BloodHound: Map AD attack paths</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Rubeus: Kerberos ticket manipulation</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>PowerView: AD enumeration</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              You have low-privilege credentials to a Windows domain. Escalate privileges to Domain Admin and retrieve the flag from the DC. 
              Domain Controller: 192.168.100.10
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Initial Credentials:</p>
                <pre className="rounded-lg bg-white p-3 text-sm font-mono">
{`Username: intern@corp.local
Password: Summer2024!
Domain: CORP.LOCAL
Domain Controller: 192.168.100.10`}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Domain Information:</p>
                <pre className="rounded-lg bg-white p-3 text-sm font-mono">
{`Domain: CORP.LOCAL
DC IP: 192.168.100.10
Your Account: intern@corp.local
Initial Group: Domain Users`}
                </pre>
              </div>
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Hint:</strong> Enumerate the domain structure, look for misconfigured service accounts, and identify privilege escalation paths. The flag is stored in a file on the Domain Controller.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Escalation Methodology:
              </label>
              <textarea
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                rows={8}
                placeholder="Describe your privilege escalation approach..."
              />
              <p className="mt-1 text-xs text-slate-400">{methodology.length} characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Escalation Path:
              </label>
              <textarea
                value={escalationPath}
                onChange={(e) => setEscalationPath(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                rows={4}
                placeholder="Document the steps taken to escalate privileges..."
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
                placeholder="flag{'{'}domain_admin_flag{'}'}"
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

export default function ActiveDirectoryPrivilegeEscalationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600">Loading challenge...</div>
        </div>
      </div>
    }>
      <ActiveDirectoryPrivilegeEscalationPageContent />
    </Suspense>
  );
}

