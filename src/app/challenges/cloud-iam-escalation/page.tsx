"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

function CloudIAMEscalationPageContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const assignmentId = searchParams.get("assignment");
  
  const [analysis, setAnalysis] = useState("");
  const [compromisedKey, setCompromisedKey] = useState("");
  const [showTutorial, setShowTutorial] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!assignmentId) return;
    
    const loadSubmission = async () => {
      try {
        const response = await fetch(`/api/submissions?assignmentId=${assignmentId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.submission) {
            const savedFindings = data.submission.findings || "";
            const savedFlag = data.submission.flag || "";
            if (savedFindings) setAnalysis(savedFindings);
            if (savedFlag) setCompromisedKey(savedFlag);
          }
        }
      } catch (error) {
        console.error("Failed to load submission:", error);
      }
    };
    
    loadSubmission();
  }, [assignmentId]);

  const handleSave = async () => {
    if (!teamId || !assignmentId) {
      setSaveMessage("Team or assignment information missing");
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          teamId,
          plan: "",
          findings: analysis,
          flag: compromisedKey,
        }),
      });

      if (response.ok) {
        setSaveMessage("Progress saved successfully!");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage("Failed to save progress");
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveMessage("Error saving progress");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!teamId || !assignmentId) {
      alert("Team or assignment information missing");
      return;
    }

    if (!compromisedKey.trim()) {
      alert("Please provide the COMPROMISED_KEY");
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          teamId,
          plan: "",
          findings: analysis,
          flag: compromisedKey,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setSaveMessage("Submission successful!");
      } else {
        const errorData = await response.json();
        setSaveMessage(errorData.error || "Failed to submit");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setSaveMessage("Error submitting answer");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ChallengeLayout
      challengeTitle="Cloud Security: IAM Shadow Role Escalation"
      difficulty="HARD"
      points={260}
    >
      <div className="space-y-6">
        {showTutorial && (
          <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Cloud Security Tutorial
              </h3>
              <button type="button" onClick={() => setShowTutorial(false)} className="rounded-lg border border-blue-300 px-3 py-1 text-sm hover:bg-blue-100">
                Hide Tutorial
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-semibold text-blue-700">How to Approach This Challenge:</h4>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-slate-700">
                  <li>Understand the compromised identity's permissions (can only update IAM role tags)</li>
                  <li>Identify the shadow role with misconfigured trust policy</li>
                  <li>Analyze how IAM role tags can be exploited in trust policies</li>
                  <li>Craft malicious tags that satisfy the trust policy conditions</li>
                  <li>Use AssumeRole to escalate privileges to the shadow role</li>
                  <li>Access CloudWatch logs to extract COMPROMISED_KEY</li>
                </ol>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-green-700">Learning Objectives:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Understand AWS IAM role trust policies and tag-based conditions</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Learn about privilege escalation via shadow roles</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Practice cloud security testing and exploitation</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Develop AWS security assessment skills</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Understand the importance of proper IAM policy design</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-2 font-semibold">Tools & Techniques:</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-slate-700">
                <li>AWS CLI or boto3 (Python SDK) for IAM operations</li>
                <li>IAM policy analysis: Understand trust policy conditions and tag evaluation</li>
                <li>Tag manipulation: <code className="bg-slate-100 px-1 rounded">aws iam tag-role</code> with crafted tags</li>
                <li>AssumeRole: <code className="bg-slate-100 px-1 rounded">aws sts assume-role</code> to escalate privileges</li>
                <li>CloudWatch Logs: <code className="bg-slate-100 px-1 rounded">aws logs get-log-events</code> to extract secrets</li>
              </ul>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              A compromised AWS identity can only update IAM role tags. Exploit the misconfigured shadow role trust policy to AssumeRole via crafted tags, escalate privileges, and extract COMPROMISED_KEY from the role's CloudWatch logs. Flag format: flag{'{'}key_here{'}'}
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Compromised IAM Identity:</p>
                <code className="block rounded-lg bg-white p-2 text-sm font-mono">arn:aws:iam::123456789012:user/compromised-user</code>
                <p className="mt-1 text-xs text-purple-700">Permissions: iam:TagRole, iam:UntagRole</p>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Shadow Role Trust Policy (misconfigured):</p>
                <pre className="rounded-lg bg-white p-3 text-xs font-mono overflow-x-auto">
{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Environment": "Production",
          "aws:RequestTag/Project": "Critical"
        }
      }
    }
  ]
}`}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Shadow Role ARN:</p>
                <code className="block rounded-lg bg-white p-2 text-sm font-mono">arn:aws:iam::123456789012:role/shadow-admin-role</code>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">CloudWatch Log Group:</p>
                <code className="block rounded-lg bg-white p-2 text-sm font-mono">/aws/lambda/shadow-admin-role-handler</code>
                <p className="mt-1 text-xs text-purple-700">Log entry contains: COMPROMISED_KEY=flag{'{'}iam_shadow_escalation_2024{'}'}</p>
              </div>
              <p className="mt-2 text-xs text-purple-700">The trust policy checks for tags on the principal. Tag the compromised user with Environment=Production, then tag the role with Project=Critical to satisfy the condition.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Cloud Security Analysis & Exploitation Chain:
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Document your approach to analyzing the IAM configuration, crafting the tag-based exploit, and escalating privileges to extract the key.
              </p>
              <textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                rows={8}
                placeholder="Describe your cloud security exploitation methodology..."
              />
              <p className="mt-1 text-xs text-slate-400">{analysis.length} characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                COMPROMISED_KEY (Flag):
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Enter the COMPROMISED_KEY extracted from CloudWatch logs. Format: flag{'{'}key_here{'}'}
              </p>
              <input
                type="text"
                value={compromisedKey}
                onChange={(e) => setCompromisedKey(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="flag{'{'}key_here{'}'}"
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
              <button type="button" onClick={handleSave} disabled={isSaving} className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {isSaving ? "Saving..." : "Save Progress"}
              </button>
              <button type="button" onClick={handleSubmit} disabled={!compromisedKey.trim() || submitted || isSaving} className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {submitted ? "Submitted" : isSaving ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChallengeLayout>
  );
}

export default function CloudIAMEscalationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="text-center"><div className="text-lg text-slate-600">Loading...</div></div></div>}>
      <CloudIAMEscalationPageContent />
    </Suspense>
  );
}

