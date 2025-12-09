"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

function ReverseEngineeringVMPageContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const assignmentId = searchParams.get("assignment");
  
  const [analysis, setAnalysis] = useState("");
  const [apiToken, setApiToken] = useState("");
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
            if (savedFlag) setApiToken(savedFlag);
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
          flag: apiToken,
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

    if (!apiToken.trim()) {
      alert("Please provide the API token");
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
          flag: apiToken,
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
      challengeTitle="Reverse Engineering: Obfuscated Loader (VM-Based)"
      difficulty="HARD"
      points={320}
    >
      <div className="space-y-6">
        {showTutorial && (
          <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Reverse Engineering Tutorial
              </h3>
              <button type="button" onClick={() => setShowTutorial(false)} className="rounded-lg border border-blue-300 px-3 py-1 text-sm hover:bg-blue-100">
                Hide Tutorial
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-semibold text-blue-700">How to Approach This Challenge:</h4>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-slate-700">
                  <li>Load the Windows loader binary in a disassembler (IDA Pro, Ghidra, or Binary Ninja)</li>
                  <li>Identify the VM-based obfuscation layer and locate bytecode handlers</li>
                  <li>Reverse engineer the custom instruction set and opcode mappings</li>
                  <li>Emulate or trace the VM execution to understand the unpacking routine</li>
                  <li>Recover the decrypted payload from memory or disk</li>
                  <li>Extract the embedded API token used for C2 authentication</li>
                </ol>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-green-700">Learning Objectives:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Understand VM-based code obfuscation techniques</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Learn to reverse engineer custom instruction sets</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Practice dynamic analysis and emulation</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Develop skills in unpacking obfuscated malware</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Extract embedded secrets from malware payloads</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-2 font-semibold">Tools & Techniques:</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-slate-700">
                <li>Disassemblers: IDA Pro, Ghidra, Binary Ninja, or Radare2</li>
                <li>Debuggers: x64dbg, WinDbg, or GDB for dynamic analysis</li>
                <li>VM emulation: Write custom scripts or use Unicorn Engine</li>
                <li>Look for dispatcher loops, opcode tables, and handler functions</li>
                <li>Memory dumps during execution to capture decrypted payloads</li>
              </ul>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              A Windows loader hides its unpacking routine behind a custom VM. Reverse the bytecode handlers, emulate the instruction set, recover the decrypted payload, and extract the embedded API token the malware uses for C2 auth. Flag format: flag{'{'}token_here{'}'}
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">VM Bytecode (Hex):</p>
                <code className="block rounded-lg bg-white p-2 text-xs font-mono break-all">
                  01 04 00 00 00 02 05 41 50 49 03 06 54 4F 4B 45 4E 07 08 66 6C 61 67 7B 76 6D 5F 72 65 76 65 72 73 65 5F 74 6F 6B 65 6E 5F 32 30 32 34 7D 09
                </code>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">VM Instruction Set:</p>
                <pre className="rounded-lg bg-white p-3 text-xs font-mono overflow-x-auto">
{`Opcode 0x01: PUSH <value> - Push immediate value to stack
Opcode 0x02: POP - Pop value from stack
Opcode 0x03: XOR <key> - XOR top of stack with key
Opcode 0x04: LOAD <addr> - Load value from memory address
Opcode 0x05: STORE <addr> - Store value to memory address
Opcode 0x06: CALL <handler> - Call handler function
Opcode 0x07: RET - Return from handler
Opcode 0x08: DECRYPT - Decrypt top of stack using key
Opcode 0x09: EXTRACT - Extract API token from decrypted payload`}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Encryption Key (found in handler 0x06):</p>
                <code className="block rounded-lg bg-white p-2 text-sm font-mono">0x5A</code>
              </div>
              <p className="mt-2 text-xs text-purple-700">The bytecode uses a simple XOR cipher. Handler 0x06 performs decryption. The API token is embedded in the decrypted payload.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Reverse Engineering Analysis:
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Document your approach to reversing the VM-based obfuscation, including bytecode handler analysis, instruction set mapping, and payload extraction methodology.
              </p>
              <textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                rows={8}
                placeholder="Describe your reverse engineering methodology..."
              />
              <p className="mt-1 text-xs text-slate-400">{analysis.length} characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                API Token (Flag):
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Enter the embedded API token extracted from the decrypted payload. Format: flag{'{'}token_here{'}'}
              </p>
              <input
                type="text"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="flag{'{'}token_here{'}'}"
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
              <button type="button" onClick={handleSubmit} disabled={!apiToken.trim() || submitted || isSaving} className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {submitted ? "Submitted" : isSaving ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChallengeLayout>
  );
}

export default function ReverseEngineeringVMPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="text-center"><div className="text-lg text-slate-600">Loading...</div></div></div>}>
      <ReverseEngineeringVMPageContent />
    </Suspense>
  );
}

