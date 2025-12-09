"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

function EmailPolyglotLurePageContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const assignmentId = searchParams.get("assignment");
  
  const [analysis, setAnalysis] = useState("");
  const [c2Domain, setC2Domain] = useState("");
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
            if (savedFlag) setC2Domain(savedFlag);
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
          flag: c2Domain,
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

    if (!c2Domain.trim()) {
      alert("Please provide the C2 domain");
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
          flag: c2Domain,
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
      challengeTitle="Email Forensics: Multipart Polyglot Lure"
      difficulty="HARD"
      points={240}
    >
      <div className="space-y-6">
        {showTutorial && (
          <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Email Forensics Tutorial
              </h3>
              <button type="button" onClick={() => setShowTutorial(false)} className="rounded-lg border border-blue-300 px-3 py-1 text-sm hover:bg-blue-100">
                Hide Tutorial
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-semibold text-blue-700">How to Approach This Challenge:</h4>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-slate-700">
                  <li>Examine the email structure and identify the multipart/alternative MIME type</li>
                  <li>Locate the Base64-encoded section within the polyglot</li>
                  <li>Extract and decode the Base64 content</li>
                  <li>Parse the decoded HTML content carefully</li>
                  <li>Look for hidden elements, especially those with <code className="bg-slate-100 px-1 rounded">font-size:0px</code> or similar obfuscation</li>
                  <li>Extract the C2 domain from the hidden span tag</li>
                </ol>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-green-700">Learning Objectives:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Understand multipart MIME email structure</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Learn about polyglot files (valid in multiple formats)</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Practice Base64 decoding and HTML parsing</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Identify obfuscation techniques in phishing emails</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Develop email forensics investigation skills</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-2 font-semibold">Tools & Techniques:</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-slate-700">
                <li>Use email analysis tools like <code className="bg-slate-100 px-1 rounded">eml_parser</code> or manual inspection</li>
                <li>Python's <code className="bg-slate-100 px-1 rounded">base64</code> module for decoding</li>
                <li>HTML parsers like <code className="bg-slate-100 px-1 rounded">BeautifulSoup</code> to extract hidden content</li>
                <li>Look for CSS obfuscation: <code className="bg-slate-100 px-1 rounded">display:none</code>, <code className="bg-slate-100 px-1 rounded">font-size:0px</code>, <code className="bg-slate-100 px-1 rounded">opacity:0</code></li>
                <li>Check for invisible Unicode characters or zero-width spaces</li>
              </ul>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              A phishing email embeds its payload inside a multipart/alternative polyglot that doubles as valid HTML and Base64. Extract the Base64 section, decode it, and identify the C2 domain hidden in a <code className="bg-slate-100 px-1 rounded">&lt;span style="font-size:0px"&gt;</code> tag. Flag format: flag{'{'}c2.example.com{'}'}
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Phishing Email (Raw MIME):</p>
                <pre className="rounded-lg bg-white p-3 text-xs font-mono overflow-x-auto max-h-80 overflow-y-auto">
{`From: security@github.com
To: user@example.com
Subject: Security Alert: New Device Login
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="----=_NextPart_000_0000_01DA123456789ABC"

------=_NextPart_000_0000_01DA123456789ABC
Content-Type: text/plain; charset=utf-8

A new device signed in to your GitHub account.

------=_NextPart_000_0000_01DA123456789ABC
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<body>
<h1>Security Alert</h1>
<p>A new device signed in to your GitHub account.</p>
</body>
</html>

------=_NextPart_000_0000_01DA123456789ABC
Content-Type: text/html; charset=utf-8
Content-Transfer-Encoding: base64

PCFET0NUWVBFIGh0bWw+CjxodG1sPgo8Ym9keT4KPGgxPlNlY3VyaXR5IEFsZXJ0PC9oMT4KPHA+QSBuZXcgZGV2aWNlIHNpZ25lZCBpbiB0byB5b3VyIEdpdEh1YiBhY2NvdW50LjwvcD4KPHNwYW4gc3R5bGU9ImZvbnQtc2l6ZToweCI+ZmxhZ3tjMi1tYWx3YXJlLWNvbW1hbmQtY29udHJvbC5vcmd9PC9zcGFuPgo8L2JvZHk+CjwvaHRtbD4=

------=_NextPart_000_0000_01DA123456789ABC--`}
                </pre>
                <p className="mt-2 text-xs text-purple-700">The email contains a multipart/alternative MIME structure. One part is Base64-encoded HTML. Decode it and look for hidden content in the span tag with font-size:0px.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Analysis & Extraction Methodology:
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Document your approach to analyzing the polyglot email, extracting the Base64 content, and identifying the hidden C2 domain.
              </p>
              <textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                rows={8}
                placeholder="Describe your email forensics methodology..."
              />
              <p className="mt-1 text-xs text-slate-400">{analysis.length} characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                C2 Domain (Flag):
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Enter the C2 domain extracted from the hidden span tag. Format: flag{'{'}c2.example.com{'}'}
              </p>
              <input
                type="text"
                value={c2Domain}
                onChange={(e) => setC2Domain(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="flag{'{'}c2.example.com{'}'}"
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
              <button type="button" onClick={handleSubmit} disabled={!c2Domain.trim() || submitted || isSaving} className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {submitted ? "Submitted" : isSaving ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChallengeLayout>
  );
}

export default function EmailPolyglotLurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="text-center"><div className="text-lg text-slate-600">Loading...</div></div></div>}>
      <EmailPolyglotLurePageContent />
    </Suspense>
  );
}

