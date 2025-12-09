"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

function FirmwareNORDumpPageContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const assignmentId = searchParams.get("assignment");
  
  const [analysis, setAnalysis] = useState("");
  const [password, setPassword] = useState("");
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
            if (savedFlag) setPassword(savedFlag);
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
          flag: password,
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

    if (!password.trim()) {
      alert("Please provide the rootfs password");
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
          flag: password,
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
      challengeTitle="Firmware Security: NOR Dump Deobfuscation"
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
                Firmware Analysis Tutorial
              </h3>
              <button type="button" onClick={() => setShowTutorial(false)} className="rounded-lg border border-blue-300 px-3 py-1 text-sm hover:bg-blue-100">
                Hide Tutorial
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-semibold text-blue-700">How to Approach This Challenge:</h4>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-slate-700">
                  <li>Examine the NOR flash dump structure and locate bootloader environment variables</li>
                  <li>Identify the XOR obfuscation pattern and LFSR characteristics</li>
                  <li>Reverse engineer the LFSR polynomial from the keystream</li>
                  <li>Rebuild the LFSR keystream generator with the correct polynomial</li>
                  <li>XOR the obfuscated data with the regenerated keystream</li>
                  <li>Extract the plaintext boot arguments and find rootfs_pass value</li>
                </ol>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-green-700">Learning Objectives:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Understand firmware dump analysis and bootloader structures</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Learn about Linear Feedback Shift Registers (LFSR)</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Practice reverse engineering cryptographic obfuscation</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Develop firmware security analysis skills</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Extract secrets from embedded device firmware</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-2 font-semibold">Tools & Techniques:</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-slate-700">
                <li>Hex editors: HxD, xxd, or Python's <code className="bg-slate-100 px-1 rounded">struct</code> module</li>
                <li>LFSR analysis: Berlekamp-Massey algorithm or manual polynomial recovery</li>
                <li>XOR decryption: Python bitwise operations or <code className="bg-slate-100 px-1 rounded">numpy</code></li>
                <li>Bootloader formats: U-Boot, RedBoot, or vendor-specific formats</li>
                <li>Environment variable parsing: key=value pairs in bootloader dumps</li>
              </ul>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              A router NOR flash dump contains bootloader environment variables XORed with a rolling 16-bit LFSR. Reverse the polynomial, rebuild the keystream, and recover the plaintext boot arguments to obtain the rootfs_pass value. Flag format: flag{'{'}password_here{'}'}
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">NOR Flash Dump (Obfuscated Bootloader Environment):</p>
                <pre className="rounded-lg bg-white p-3 text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto">
{`Offset 0x0000: 42 4F 4F 54 4C 4F 41 44 45 52 3D 55 2D 42 4F 4F 54
Offset 0x0010: 42 41 55 44 52 41 54 45 3D 31 31 35 32 30 30 00
Offset 0x0020: 4B 45 52 4E 45 4C 3D 2F 62 6F 6F 74 2F 7A 49 6D
Offset 0x0030: 61 67 65 00 52 4F 4F 54 46 53 3D 2F 64 65 76 2F
Offset 0x0040: 6D 74 64 30 00 52 4F 4F 54 46 53 5F 50 41 53 53
Offset 0x0050: 3D 58 4F 52 45 44 5F 44 41 54 41 5F 48 45 52 45
Offset 0x0060: 00 00 00 00 00 00 00 00`}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">LFSR Initial State (first 4 bytes of obfuscated data):</p>
                <code className="block rounded-lg bg-white p-2 text-sm font-mono">0x424F4F54</code>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Known Plaintext (BOOTLOADER=U-BOOT):</p>
                <code className="block rounded-lg bg-white p-2 text-sm font-mono">42 4F 4F 54 4C 4F 41 44 45 52 3D 55 2D 42 4F 4F 54</code>
              </div>
              <p className="mt-2 text-xs text-purple-700">The LFSR uses taps at positions 16, 14, 13, 11 (polynomial x^16 + x^14 + x^13 + x^11 + 1). Use the known plaintext to recover the keystream and decrypt ROOTFS_PASS.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Firmware Analysis & LFSR Reverse Engineering:
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Document your approach to analyzing the NOR dump, reverse engineering the LFSR, and recovering the bootloader environment variables.
              </p>
              <textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                rows={8}
                placeholder="Describe your firmware analysis methodology..."
              />
              <p className="mt-1 text-xs text-slate-400">{analysis.length} characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Rootfs Password (Flag):
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Enter the rootfs_pass value recovered from the bootloader environment. Format: flag{'{'}password_here{'}'}
              </p>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="flag{'{'}password_here{'}'}"
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
              <button type="button" onClick={handleSubmit} disabled={!password.trim() || submitted || isSaving} className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {submitted ? "Submitted" : isSaving ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChallengeLayout>
  );
}

export default function FirmwareNORDumpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="text-center"><div className="text-lg text-slate-700">Loading...</div></div></div>}>
      <FirmwareNORDumpPageContent />
    </Suspense>
  );
}

