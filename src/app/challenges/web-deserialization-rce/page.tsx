"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

function WebDeserializationRCEPageContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const assignmentId = searchParams.get("assignment");
  
  const [analysis, setAnalysis] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
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
            if (savedFlag) setAdminSecret(savedFlag);
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
          flag: adminSecret,
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

    if (!adminSecret.trim()) {
      alert("Please provide the ADMIN_SECRET");
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
          flag: adminSecret,
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
      challengeTitle="Web Exploitation: Chained Deserialization RCE"
      difficulty="HARD"
      points={280}
    >
      <div className="space-y-6">
        {showTutorial && (
          <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Web Exploitation Tutorial
              </h3>
              <button type="button" onClick={() => setShowTutorial(false)} className="rounded-lg border border-blue-300 px-3 py-1 text-sm hover:bg-blue-100">
                Hide Tutorial
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-semibold text-blue-700">How to Approach This Challenge:</h4>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-slate-700">
                  <li>Identify the express-session custom serializer vulnerability</li>
                  <li>Research Node.js deserialization gadget chains (node-serialize, etc.)</li>
                  <li>Craft a malicious session payload with RCE gadget</li>
                  <li>Trigger the SSTI (Server-Side Template Injection) logging bug</li>
                  <li>Chain the deserialization with template rendering for code execution</li>
                  <li>Execute commands to dump ADMIN_SECRET from environment variables</li>
                </ol>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-green-700">Learning Objectives:</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Understand insecure deserialization vulnerabilities</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Learn about gadget chain exploitation</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Practice chaining multiple vulnerabilities</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Develop web application security testing skills</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>Understand SSTI and RCE exploitation techniques</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-2 font-semibold">Tools & Techniques:</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-slate-700">
                <li>Burp Suite or similar proxy for request manipulation</li>
                <li>Node.js deserialization gadgets: node-serialize, serialize-to-js</li>
                <li>SSTI payloads: Handlebars, EJS, or Pug template injection</li>
                <li>Command execution: <code className="bg-slate-100 px-1 rounded">process.env.ADMIN_SECRET</code> or <code className="bg-slate-100 px-1 rounded">child_process.exec()</code></li>
                <li>Session cookie manipulation and encoding</li>
              </ul>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              An express-session custom serializer plus an SSTI logging bug can be chained for code execution. Craft the gadget payload, trigger the log rendering, achieve RCE, and dump ADMIN_SECRET from the backend environment. Flag format: flag{'{'}secret_here{'}'}
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Vulnerable Application Code:</p>
                <pre className="rounded-lg bg-white p-3 text-xs font-mono overflow-x-auto">
{`// server.js - Vulnerable Express Application
const express = require('express');
const session = require('express-session');
const serialize = require('node-serialize');

const app = express();

// Vulnerable custom serializer
app.use(session({
  secret: 'weak-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  store: new (require('express-session').MemoryStore)(),
  serializeUser: (user, done) => {
    done(null, serialize.serialize(user)); // VULNERABLE!
  },
  deserializeUser: (data, done) => {
    done(null, serialize.unserialize(data)); // VULNERABLE!
  }
}));

// SSTI vulnerability in logging
app.use((req, res, next) => {
  const logMessage = \`User: \${req.session.user || 'anonymous'}\`;
  console.log(logMessage); // VULNERABLE: User input in template
  next();
});

app.get('/login', (req, res) => {
  const username = req.query.username || 'guest';
  req.session.user = username;
  res.send('Logged in as: ' + username);
});

app.get('/admin', (req, res) => {
  if (process.env.ADMIN_SECRET) {
    res.send('Admin panel - Secret: ' + process.env.ADMIN_SECRET);
  } else {
    res.send('Admin panel - No secret configured');
  }
});

app.listen(3000);`}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Environment Variable:</p>
                <code className="block rounded-lg bg-white p-2 text-sm font-mono">ADMIN_SECRET=flag{'{'}exploit_chain_rce_2024{'}'}</code>
              </div>
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Hint:</strong> The application uses node-serialize which is vulnerable to RCE. Craft a malicious session cookie using the serialize function with an IIFE (Immediately Invoked Function Expression) that executes code. Then trigger the SSTI in the logging middleware to render the session data.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Exploitation Chain Analysis:
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Document your approach to identifying the vulnerabilities, crafting the exploit chain, and achieving remote code execution.
              </p>
              <textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                rows={8}
                placeholder="Describe your exploitation methodology..."
              />
              <p className="mt-1 text-xs text-slate-400">{analysis.length} characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                ADMIN_SECRET (Flag):
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Enter the ADMIN_SECRET extracted from the backend environment. Format: flag{'{'}secret_here{'}'}
              </p>
              <input
                type="text"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="flag{'{'}secret_here{'}'}"
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
              <button type="button" onClick={handleSubmit} disabled={!adminSecret.trim() || submitted || isSaving} className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {submitted ? "Submitted" : isSaving ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChallengeLayout>
  );
}

export default function WebDeserializationRCEPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="text-center"><div className="text-lg text-slate-600">Loading...</div></div></div>}>
      <WebDeserializationRCEPageContent />
    </Suspense>
  );
}

