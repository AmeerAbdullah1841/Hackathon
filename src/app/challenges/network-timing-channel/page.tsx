"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

function NetworkTimingChannelPageContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const assignmentId = searchParams.get("assignment");
  
  const [analysis, setAnalysis] = useState("");
  const [hiddenData, setHiddenData] = useState("");
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
            if (savedFlag) setHiddenData(savedFlag);
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
          flag: hiddenData,
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

    if (!hiddenData.trim()) {
      alert("Please provide the hidden operator message");
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
          flag: hiddenData,
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
      challengeTitle="Network Forensics: Covert Timing Channel"
      difficulty="HARD"
      points={250}
    >
      <div className="space-y-6">
        {showTutorial && (
          <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Network Forensics Tutorial
              </h3>
              <button type="button" onClick={() => setShowTutorial(false)} className="rounded-lg border border-blue-300 px-3 py-1 text-sm hover:bg-blue-100">
                Hide Tutorial
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-semibold text-blue-700">How to Approach This Challenge:</h4>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-slate-700">
                  <li>Load the PCAP file in Wireshark or tshark</li>
                  <li>Filter packets to the suspicious IP address</li>
                  <li>Extract timestamps for each beacon packet</li>
                  <li>Calculate delta timing (time between consecutive packets)</li>
                  <li>Classify delays: short delay = 0, long delay = 1</li>
                  <li>Rebuild the bitstream from timing patterns</li>
                  <li>Decode the bitstream (may be ASCII, binary, or encoded)</li>
                </ol>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-green-700">Learning Objectives:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Understand covert timing channels in network traffic</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Learn to analyze packet timing patterns</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Practice bitstream reconstruction from timing data</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Develop network forensics investigation skills</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Identify steganographic communication methods</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-2 font-semibold">Tools & Techniques:</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-slate-700">
                <li>Wireshark/tshark for PCAP analysis</li>
                <li>Python scripts to extract timestamps and calculate deltas</li>
                <li>Determine threshold: average delay or statistical analysis</li>
                <li>Bitstream decoding: ASCII, binary to text, or custom encoding</li>
                <li>Look for patterns: 8-bit bytes, 7-bit ASCII, or variable-length encoding</li>
              </ul>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              PCAP files show unusual beacon delays to a single IP. Interpret the delta timing (short=0, long=1), rebuild the bitstream, decode the reconstructed payload, and reveal the hidden operator message. Flag format: flag{'{'}hidden_data{'}'}
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Network Packet Timestamps (to suspicious IP 192.168.1.100):</p>
                <pre className="rounded-lg bg-white p-3 text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto">
{`Packet #1: 2024-01-15 10:00:00.000
Packet #2: 2024-01-15 10:00:00.150  (delta: 150ms - SHORT)
Packet #3: 2024-01-15 10:00:00.300  (delta: 150ms - SHORT)
Packet #4: 2024-01-15 10:00:00.750  (delta: 450ms - LONG)
Packet #5: 2024-01-15 10:00:00.900  (delta: 150ms - SHORT)
Packet #6: 2024-01-15 10:00:01.050  (delta: 150ms - SHORT)
Packet #7: 2024-01-15 10:00:01.500  (delta: 450ms - LONG)
Packet #8: 2024-01-15 10:00:01.650  (delta: 150ms - SHORT)
Packet #9: 2024-01-15 10:00:01.800  (delta: 150ms - SHORT)
Packet #10: 2024-01-15 10:00:01.950 (delta: 150ms - SHORT)
Packet #11: 2024-01-15 10:00:02.400 (delta: 450ms - LONG)
Packet #12: 2024-01-15 10:00:02.550 (delta: 150ms - SHORT)
Packet #13: 2024-01-15 10:00:02.700 (delta: 150ms - SHORT)
Packet #14: 2024-01-15 10:00:02.850 (delta: 150ms - SHORT)
Packet #15: 2024-01-15 10:00:03.300 (delta: 450ms - LONG)
Packet #16: 2024-01-15 10:00:03.450 (delta: 150ms - SHORT)
Packet #17: 2024-01-15 10:00:03.600 (delta: 150ms - SHORT)
Packet #18: 2024-01-15 10:00:03.750 (delta: 150ms - SHORT)
Packet #19: 2024-01-15 10:00:03.900 (delta: 150ms - SHORT)
Packet #20: 2024-01-15 10:00:04.350 (delta: 450ms - LONG)
Packet #21: 2024-01-15 10:00:04.500 (delta: 150ms - SHORT)
Packet #22: 2024-01-15 10:00:04.650 (delta: 150ms - SHORT)
Packet #23: 2024-01-15 10:00:04.800 (delta: 150ms - SHORT)
Packet #24: 2024-01-15 10:00:04.950 (delta: 150ms - SHORT)
Packet #25: 2024-01-15 10:00:05.400 (delta: 450ms - LONG)
Packet #26: 2024-01-15 10:00:05.550 (delta: 150ms - SHORT)
Packet #27: 2024-01-15 10:00:05.700 (delta: 150ms - SHORT)
Packet #28: 2024-01-15 10:00:05.850 (delta: 150ms - SHORT)
Packet #29: 2024-01-15 10:00:06.300 (delta: 450ms - LONG)
Packet #30: 2024-01-15 10:00:06.450 (delta: 150ms - SHORT)
Packet #31: 2024-01-15 10:00:06.600 (delta: 150ms - SHORT)
Packet #32: 2024-01-15 10:00:06.750 (delta: 150ms - SHORT)
Packet #33: 2024-01-15 10:00:06.900 (delta: 150ms - SHORT)
Packet #34: 2024-01-15 10:00:07.350 (delta: 450ms - LONG)
Packet #35: 2024-01-15 10:00:07.500 (delta: 150ms - SHORT)
Packet #36: 2024-01-15 10:00:07.650 (delta: 150ms - SHORT)
Packet #37: 2024-01-15 10:00:07.800 (delta: 150ms - SHORT)
Packet #38: 2024-01-15 10:00:07.950 (delta: 150ms - SHORT)
Packet #39: 2024-01-15 10:00:08.400 (delta: 450ms - LONG)
Packet #40: 2024-01-15 10:00:08.550 (delta: 150ms - SHORT)`}
                </pre>
                <p className="mt-2 text-xs text-purple-700">Threshold: Short delay = 150ms (bit 0), Long delay = 450ms (bit 1). Rebuild the bitstream and decode as ASCII to get the hidden message.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Network Analysis & Timing Channel Extraction:
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Document your approach to analyzing the PCAP, extracting timing patterns, and decoding the covert channel.
              </p>
              <textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                rows={8}
                placeholder="Describe your network forensics methodology..."
              />
              <p className="mt-1 text-xs text-slate-400">{analysis.length} characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Hidden Operator Message (Flag):
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Enter the hidden message decoded from the timing channel. Format: flag{'{'}hidden_data{'}'}
              </p>
              <input
                type="text"
                value={hiddenData}
                onChange={(e) => setHiddenData(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="flag{'{'}hidden_data{'}'}"
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
              <button type="button" onClick={handleSubmit} disabled={!hiddenData.trim() || submitted || isSaving} className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {submitted ? "Submitted" : isSaving ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChallengeLayout>
  );
}

export default function NetworkTimingChannelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="text-center"><div className="text-lg text-slate-600">Loading...</div></div></div>}>
      <NetworkTimingChannelPageContent />
    </Suspense>
  );
}

