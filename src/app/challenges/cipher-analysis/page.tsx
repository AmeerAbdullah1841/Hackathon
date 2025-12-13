"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

const ciphers = [
  {
    id: 1,
    encoded: "WKLV LV D VHFUHW PHVVDJH",
    hint: "Classical Caesar cipher with standard shift",
    answer: "THIS IS A SECRET MESSAGE",
    shift: 3,
  },
  {
    id: 2,
    encoded: "FYAICPQ SQC TYPGMSQ RCAFGLOSCQ RM ZPCYAF QCASPGRW",
    hint: "Backward shift pattern",
    answer: "SECURITY AND ENCRYPTION PROTECTION OF SENSITIVE DATA",
    shift: -2,
  },
  {
    id: 3,
    encoded: "UFDVSJUZ JT FWFSZPOFT SFTQPOTJCJMJUZ",
    hint: "Forward shift by a small number",
    answer: "SECURITY IS ESSENTIAL PROTECTION",
    shift: 1,
  },
  {
    id: 4,
    encoded: "CBIIL QEBOB, XOB VLR OBVAP CLO QEB ZEJDBO ZEXIIBKDB?",
    hint: "Mixed direction shift",
    answer: "HELLO WORLD, ARE YOU READY FOR THE CHALLENGE AHEAD?",
    shift: -3,
  },
  {
    id: 5,
    encoded: "XLI QIWWEKI MR XLI WXEXIW",
    hint: "Standard forward shift",
    answer: "THE MESSAGE IS THE MEDIUM",
    shift: 4,
  },
  {
    id: 6,
    encoded: "MJQQT YMJ RTXYJWJ FSI YMJ XJHWJY",
    hint: "Forward shift pattern",
    answer: "HELLO THE MESSAGE AND THE SECRET",
    shift: 5,
  },
  {
    id: 7,
    encoded: "GDKKN VNQKC",
    hint: "Backward shift",
    answer: "HELLO WORLD",
    shift: -1,
  },
  {
    id: 8,
    encoded: "QEB NRFZH YOLTK CLU GRJMP LSBO QEB IXWV ALD",
    hint: "Backward shift pattern",
    answer: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG",
    shift: -3,
  },
  {
    id: 9,
    encoded: "IFMMP XPSME",
    hint: "Simple forward shift",
    answer: "HELLO WORLD",
    shift: 1,
  },
  {
    id: 10,
    encoded: "VLWKPFTYK XLJQVMUEI KDQ XWCOX XOXLQQCHM",
    hint: "Challenging shift with security terminology",
    answer: "SECURITY ANALYSIS AND NETWORK PROTECTION",
    shift: -7,
  },
  {
    id: 11,
    encoded: "KZYVI KRIEVI KZGWVCVKRW REU KZGWVGVPMKZ",
    hint: "Technical terms with symmetric structure",
    answer: "SECURE SERVER SECURITY AND SECUREMENT",
    shift: -17,
  },
  {
    id: 12,
    encoded: "EPIRXMJMGEXMSR MW RSX EYXLIRXMGEXMSR",
    hint: "Advanced security concept pairing",
    answer: "AUTHENTICATION IS THE AUTHORIZATION",
    shift: -4,
  },
  {
    id: 13,
    encoded: "DRO ZBYNOC SC MYWOX KXN DYWOX",
    hint: "Backward shift",
    answer: "THE SECRET IS NUMBER AND LETTER",
    shift: -10,
  },
  {
    id: 14,
    encoded: "YMJ RTXYJWJ FSI YMJ XJHWJY",
    hint: "Forward shift",
    answer: "THE MESSAGE AND THE SECRET",
    shift: 5,
  },
  {
    id: 15,
    encoded: "QEB NRFZH YOLTK CLU GRJMP LSBO QEB IXWV ALD",
    hint: "Classic test phrase",
    answer: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG",
    shift: -3,
  },
];

function CipherAnalysisPageContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const assignmentId = searchParams.get("assignment");
  
  const [decoded, setDecoded] = useState<Record<number, string>>({});
  const [methodology, setMethodology] = useState("");
  const [showTutorial, setShowTutorial] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load existing submission
  useEffect(() => {
    if (!assignmentId) return;
    
    const loadSubmission = async () => {
      try {
        const response = await fetch(`/api/submissions?assignmentId=${assignmentId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.submission) {
            const savedFindings = data.submission.findings || "";
            if (savedFindings) setMethodology(savedFindings);
            // Load decoded ciphers if saved in flag field
            if (data.submission.flag) {
              try {
                const savedDecoded = JSON.parse(data.submission.flag);
                if (typeof savedDecoded === 'object' && savedDecoded !== null) {
                  setDecoded(savedDecoded);
                }
              } catch {
                // Not JSON, ignore
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to load submission:", error);
      }
    };
    
    loadSubmission();
  }, [assignmentId]);

  const updateDecoded = (id: number, value: string) => {
    setDecoded((prev) => ({ ...prev, [id]: value }));
  };

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
          findings: methodology,
          flag: JSON.stringify(decoded),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Failed to save");
      }

      setSaveMessage("Progress saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Failed to save");
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    const decodedCount = Object.keys(decoded).length;
    if (decodedCount < ciphers.length) {
      alert(`Please decode all ${ciphers.length} ciphers. Currently decoded: ${decodedCount}`);
      return;
    }
    if (!methodology.trim()) {
      alert("Please provide your cryptanalysis methodology before submitting.");
      return;
    }
    
    // Save submission first
    if (teamId && assignmentId) {
      setIsSaving(true);
      try {
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignmentId,
            teamId,
            plan: "",
            findings: methodology,
            flag: JSON.stringify(decoded),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData?.error || "Failed to save submission";
          alert(`Failed to save submission: ${errorMessage}`);
          setIsSaving(false);
          return;
        }
      } catch (error) {
        alert(`Failed to save submission: ${error instanceof Error ? error.message : "Please try again."}`);
        setIsSaving(false);
        return;
      } finally {
        setIsSaving(false);
      }
    } else {
      alert("Unable to submit: Missing team or assignment information. Please access this challenge from your team dashboard.");
      return;
    }
    
    alert(`Excellent cryptanalysis! You decoded ${decodedCount} ciphers using advanced techniques.`);
    setSubmitted(true);
  };

  return (
    <ChallengeLayout
      challengeTitle="Cryptographic Analysis: Multi-Algorithm Cipher Breaking"
      difficulty="HARD"
      points={420}
    >
      <div className="space-y-6">
        {/* Tutorial Section */}
        {showTutorial && (
          <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
                Caesar Cipher Tutorial
              </h3>
              <button
                type="button"
                onClick={() => setShowTutorial(false)}
                className="rounded-lg border border-blue-300 px-3 py-1 text-sm hover:bg-blue-100"
              >
                Hide Tutorial
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-semibold text-blue-700">
                  Understanding Caesar Ciphers:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>Each letter is shifted a certain number of positions in the alphabet</li>
                  <li>Example: With shift 1, A→B, B→C, C→D, etc.</li>
                  <li>With shift 3: A→D, B→E, C→F, etc.</li>
                  <li>It wraps around: X→A, Y→B, Z→C (with shift 3)</li>
                  <li>In reverse: D→A, E→B, F→C (with backward shift 3)</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-purple-700">
                  Advanced Variants:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>Forward shifts: Letters move ahead in alphabet (A→D)</li>
                  <li>Backward shifts: Letters move back in alphabet (D→A)</li>
                  <li>Mixed shifts: Different shifts used within same message</li>
                  <li>Variable shifts: Shift amount changes based on position</li>
                  <li>Modified alphabets: Using non-standard alphabets</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-2 font-semibold">Decoding Strategy:</h4>
              <ol className="ml-4 list-decimal space-y-1 text-sm text-slate-700">
                <li>Look for common short words (THE, AND, IS, OF) as pattern indicators</li>
                <li>Check for repeated letters that might reveal double letters in English</li>
                <li>Try different shift values systematically (1-25)</li>
                <li>Remember that spaces and punctuation usually remain unchanged</li>
                <li>Use frequency analysis - E, T, A, O are the most common letters in English</li>
              </ol>
            </div>
          </div>
        )}

        {/* Challenge Section */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              Decode {ciphers.length} encrypted messages using various cipher techniques including Caesar, Vigenère, 
              Playfair, and custom substitution ciphers. Some messages use multiple encryption layers or 
              steganographic techniques. Provide detailed cryptanalysis methodology. 
              Current progress: {Object.keys(decoded).length}/{ciphers.length} required
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Encrypted Cipher Messages:</p>
                <div className="rounded-lg bg-white p-3 max-h-60 overflow-y-auto">
                  <ul className="space-y-2 text-xs font-mono">
                    {ciphers.map((cipher) => (
                      <li key={cipher.id} className="border-b border-purple-100 pb-2">
                        <span className="font-semibold">Cipher #{cipher.id}:</span> {cipher.encoded}
                        <br />
                        <span className="text-purple-600">Hint: {cipher.hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> All ciphers use Caesar cipher with various shift values (positive for forward, negative for backward). Analyze the patterns, try different shifts, and decode each message. Document your methodology for each cipher.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {ciphers.map((cipher) => (
              <div
                key={cipher.id}
                className="rounded-lg border-2 border-slate-200 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold">Cipher #{cipher.id}</h4>
                  {decoded[cipher.id] && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                      Decoded
                    </span>
                  )}
                </div>
                <p className="mb-2 text-sm text-slate-600 italic">
                  Hint: {cipher.hint}
                </p>
                <p className="mb-3 font-mono text-lg font-bold">
                  {cipher.encoded}
                </p>
                <input
                  type="text"
                  value={decoded[cipher.id] || ""}
                  onChange={(e) => updateDecoded(cipher.id, e.target.value.toUpperCase())}
                  placeholder="Enter decoded message..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
            ))}
          </div>

          <div className="mt-8">
            <label className="mb-2 block font-semibold">
              Cryptanalysis Methodology:
            </label>
            <p className="mb-2 text-sm text-slate-600">
              Provide detailed cryptanalysis methodology. Explain frequency analysis, pattern recognition, 
              statistical methods, brute-force strategies, and how you identified different cipher types. 
              Include mathematical approaches and tools used.
            </p>
            <textarea
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
              placeholder="Explain your decoding methodology..."
              className="min-h-[150px] w-full rounded-lg border border-slate-300 p-3"
            />
            <p className="mt-1 text-xs text-slate-500">
              {methodology.length} characters
            </p>
          </div>

          <div className="mt-6">
            <div className="flex gap-3">
              {teamId && assignmentId && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Progress"}
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  Object.keys(decoded).length < ciphers.length ||
                  !methodology.trim() ||
                  submitted ||
                  isSaving
                }
                className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitted
                  ? "Solutions Submitted"
                  : `Submit Solutions (${Object.keys(decoded).length}/${ciphers.length} required)`}
              </button>
            </div>
            {saveMessage && (
              <p className={`mt-2 text-sm font-medium ${
                saveMessage.includes("success") ? "text-green-600" : "text-red-600"
              }`}>
                {saveMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </ChallengeLayout>
  );
}

export default function CipherAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600">Loading challenge...</div>
        </div>
      </div>
    }>
      <CipherAnalysisPageContent />
    </Suspense>
  );
}

