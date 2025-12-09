"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

function DFIRLogTamperingPageContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const assignmentId = searchParams.get("assignment");
  
  const [analysis, setAnalysis] = useState("");
  const [userId, setUserId] = useState("");
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
            if (savedFlag) setUserId(savedFlag);
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
          flag: userId,
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

    if (!userId.trim()) {
      alert("Please provide the recovered user ID");
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
          flag: userId,
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
      challengeTitle="DFIR: Multi-Layer Log Tampering Detection"
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
                DFIR Log Analysis Tutorial
              </h3>
              <button type="button" onClick={() => setShowTutorial(false)} className="rounded-lg border border-blue-300 px-3 py-1 text-sm hover:bg-blue-100">
                Hide Tutorial
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-semibold text-blue-700">How to Approach This Challenge:</h4>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-slate-700">
                  <li>Decompress the .gz log file from disk slack space</li>
                  <li>Repair corrupted or partial log entries using log structure knowledge</li>
                  <li>Rebuild the timeline of events chronologically</li>
                  <li>Correlate syscall sequences to identify privilege escalation patterns</li>
                  <li>Look for anomalies in user ID transitions (UID changes)</li>
                  <li>Identify the user ID leveraged in the escalation attack</li>
                </ol>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-green-700">Learning Objectives:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Understand Linux audit log structure and format</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Learn log tampering detection techniques</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Practice timeline reconstruction from partial logs</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Analyze syscall sequences for privilege escalation</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Develop DFIR investigation skills</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-2 font-semibold">Tools & Techniques:</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-slate-700">
                <li>Use <code className="bg-slate-100 px-1 rounded">gunzip</code> or Python's <code className="bg-slate-100 px-1 rounded">gzip</code> module to decompress</li>
                <li>Linux audit log format: <code className="bg-slate-100 px-1 rounded">type=SYSCALL msg=audit(timestamp:ID) ... uid=...</code></li>
                <li>Look for <code className="bg-slate-100 px-1 rounded">setuid</code>, <code className="bg-slate-100 px-1 rounded">setgid</code>, <code className="bg-slate-100 px-1 rounded">execve</code> syscalls</li>
                <li>Correlate UID changes with process execution events</li>
                <li>Use timeline analysis tools or custom scripts to rebuild chronological order</li>
              </ul>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              A threat actor modified Linux audit logs to hide a privilege escalation. A compressed .gz log from disk slack space preserves partial records. Decompress, repair the timeline, correlate syscall sequences, and recover the user ID leveraged in the escalation. Flag format: flag{'{'}uid1234{'}'}
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Compressed Log File (Base64 encoded gzip):</p>
                <code className="block rounded-lg bg-white p-2 text-xs font-mono break-all">
                  H4sICAAAAAAC/audit.log.gz
                </code>
                <p className="mt-2 text-sm font-semibold text-purple-800">Log Content (after decompression, partial/corrupted):</p>
                <pre className="mt-2 rounded-lg bg-white p-3 text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto">
{`type=SYSCALL msg=audit(1704067200.123:12345): arch=c000003e syscall=59 success=yes exit=0 a0=7fff12345678 a1=7fff12345690 a2=0 items=2 ppid=1234 pid=5678 auid=1000 uid=1000 gid=1000 euid=1000 suid=1000 fsuid=1000 egid=1000 sgid=1000 fsgid=1000 tty=pts0 ses=1 comm="bash" exe="/usr/bin/bash" key="shell_cmd"
type=EXECVE msg=audit(1704067200.123:12345): argc=2 a0="sudo" a1="-u"
type=CWD msg=audit(1704067200.123:12345): cwd="/home/user"
type=PATH msg=audit(1704067200.123:12345): item=0 name="/usr/bin/sudo" inode=12345 dev=08:01 mode=0104755 ouid=0 ogid=0 rdev=00:00
[PARTIAL/CORRUPTED ENTRY - Missing UID field]
type=SYSCALL msg=audit(1704067201.456:12346): arch=c000003e syscall=59 success=yes exit=0 a0=7fff12345678 a1=7fff12345690 a2=0 items=2 ppid=5678 pid=7890 auid=1000 uid=??? gid=1000 euid=??? suid=??? fsuid=??? egid=1000 sgid=1000 fsgid=1000 tty=pts0 ses=1 comm="id" exe="/usr/bin/id"
type=EXECVE msg=audit(1704067201.456:12346): argc=1 a0="id"
type=CWD msg=audit(1704067201.456:12346): cwd="/root"
type=PATH msg=audit(1704067201.456:12346): item=0 name="/usr/bin/id" inode=67890 dev=08:01 mode=0100755 ouid=0 ogid=0 rdev=00:00
type=SYSCALL msg=audit(1704067202.789:12347): arch=c000003e syscall=2 success=yes exit=3 a0=7fff12345678 a1=0 a2=0 items=1 ppid=7890 pid=9012 auid=1000 uid=0 gid=0 euid=0 suid=0 fsuid=0 egid=0 sgid=0 fsgid=0 tty=pts0 ses=1 comm="cat" exe="/usr/bin/cat" key="file_access"
type=OPEN msg=audit(1704067202.789:12347): items=1 name="/etc/shadow" inode=11111 dev=08:01 mode=0100640 ouid=0 ogid=0`}
                </pre>
                <p className="mt-2 text-xs text-purple-700">The log shows a privilege escalation sequence. The corrupted entry (uid=???) contains the user ID that was leveraged. Correlate the syscall sequence: sudo -u [UID] was executed, then commands ran as that UID, then root access was gained.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Log Analysis & Timeline Reconstruction:
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Document your approach to decompressing, repairing, and analyzing the tampered logs. Explain how you reconstructed the timeline and identified the privilege escalation pattern.
              </p>
              <textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                rows={8}
                placeholder="Describe your log analysis methodology..."
              />
              <p className="mt-1 text-xs text-slate-400">{analysis.length} characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Recovered User ID (Flag):
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Enter the user ID leveraged in the privilege escalation. Format: flag{'{'}uid1234{'}'}
              </p>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="flag{'{'}uid1234{'}'}"
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
              <button type="button" onClick={handleSubmit} disabled={!userId.trim() || submitted || isSaving} className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {submitted ? "Submitted" : isSaving ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChallengeLayout>
  );
}

export default function DFIRLogTamperingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="text-center"><div className="text-lg text-slate-600">Loading...</div></div></div>}>
      <DFIRLogTamperingPageContent />
    </Suspense>
  );
}

