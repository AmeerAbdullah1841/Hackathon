"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

function OSINTPhishingInfraPageContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const assignmentId = searchParams.get("assignment");
  
  const [analysis, setAnalysis] = useState("");
  const [accountName, setAccountName] = useState("");
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
            if (savedFlag) setAccountName(savedFlag);
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
          flag: accountName,
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

    if (!accountName.trim()) {
      alert("Please provide the hosting provider account name");
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
          flag: accountName,
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
      challengeTitle="OSINT / Threat Intel: Phishing Infra Pivot"
      difficulty="HARD"
      points={230}
    >
      <div className="space-y-6">
        {showTutorial && (
          <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                OSINT Investigation Tutorial
              </h3>
              <button type="button" onClick={() => setShowTutorial(false)} className="rounded-lg border border-blue-300 px-3 py-1 text-sm hover:bg-blue-100">
                Hide Tutorial
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-semibold text-blue-700">How to Approach This Challenge:</h4>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-slate-700">
                  <li>Start with the phishing URL and extract the domain</li>
                  <li>Query DNS history databases (SecurityTrails, PassiveTotal, etc.)</li>
                  <li>Check Certificate Transparency logs for related domains</li>
                  <li>Identify CDN misconfigurations and origin server IPs</li>
                  <li>Pivot through infrastructure relationships</li>
                  <li>Attribute the infrastructure to a hosting provider account</li>
                </ol>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-green-700">Learning Objectives:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Understand OSINT investigation methodologies</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Learn to use DNS history and CT logs</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Practice infrastructure pivoting techniques</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Develop threat intelligence gathering skills</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Attribute malicious infrastructure to actors</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-2 font-semibold">Tools & Techniques:</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-slate-700">
                <li>DNS History: SecurityTrails, PassiveTotal, RiskIQ, WhoisXML</li>
                <li>Certificate Transparency: crt.sh, Censys, Certificate Search</li>
                <li>CDN Analysis: Shodan, Censys, or manual IP investigation</li>
                <li>Infrastructure mapping: ASN lookups, IP ranges, hosting provider identification</li>
                <li>Account attribution: WHOIS data, registration patterns, infrastructure clustering</li>
              </ul>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              A phishing URL rotates across geo-failover servers. Use DNS history, certificate transparency, and CDN misconfiguration pivots to attribute the infrastructure and identify the attacker's hosting provider account name. Flag format: flag{'{'}account_name{'}'}
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Phishing URL:</p>
                <code className="block rounded-lg bg-white p-2 text-sm font-mono">https://secure-update-github.com/login</code>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">DNS History Records:</p>
                <pre className="rounded-lg bg-white p-3 text-xs font-mono overflow-x-auto">
{`2024-01-10: secure-update-github.com -> 192.0.2.45 (US)
2024-01-12: secure-update-github.com -> 203.0.113.78 (EU)
2024-01-15: secure-update-github.com -> 198.51.100.23 (ASIA)
All IPs resolve to same origin server: 192.0.2.100`}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Certificate Transparency Logs:</p>
                <pre className="rounded-lg bg-white p-3 text-xs font-mono overflow-x-auto">
{`Certificate for: *.secure-update-github.com
Issued: 2024-01-08
SAN: secure-update-github.com, www.secure-update-github.com
Organization: "malicious-actor-2024"
Common Name: secure-update-github.com`}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">CDN Configuration (misconfigured):</p>
                <pre className="rounded-lg bg-white p-3 text-xs font-mono overflow-x-auto">
{`Origin Server: 192.0.2.100
CDN Provider: CloudFlare
Account Email (leaked in headers): malicious-actor-2024@protonmail.com
Account Name (from WHOIS): flag${'{'}malicious_actor_2024${'}'}`}
                </pre>
              </div>
              <p className="mt-2 text-xs text-purple-700">The account name can be found in the CDN misconfiguration headers or WHOIS records for the origin IP.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                OSINT Investigation & Infrastructure Attribution:
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Document your OSINT investigation process, including DNS history analysis, certificate transparency research, and infrastructure pivoting methodology.
              </p>
              <textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                rows={8}
                placeholder="Describe your OSINT investigation methodology..."
              />
              <p className="mt-1 text-xs text-slate-400">{analysis.length} characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Hosting Provider Account Name (Flag):
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Enter the attacker's hosting provider account name. Format: flag{'{'}account_name{'}'}
              </p>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="flag{'{'}account_name{'}'}"
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
              <button type="button" onClick={handleSubmit} disabled={!accountName.trim() || submitted || isSaving} className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {submitted ? "Submitted" : isSaving ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChallengeLayout>
  );
}

export default function OSINTPhishingInfraPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="text-center"><div className="text-lg text-slate-600">Loading...</div></div></div>}>
      <OSINTPhishingInfraPageContent />
    </Suspense>
  );
}

