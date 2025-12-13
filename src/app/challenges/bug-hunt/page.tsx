"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

const vulnerableCode = `// Vulnerable login function
function login(username, password) {
  if (username === 'admin' && password === 'password123') {
    return true;
  }
  return false;
}

// Vulnerable user data retrieval
function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return database.execute(query);
}

// Vulnerable file upload
function uploadFile(file) {
  const allowedTypes = ['jpg', 'png', 'gif'];
  // No file type validation
  saveFile(file);
}

// Vulnerable authentication check
function isAdmin(userId) {
  const user = getUserData(userId);
  return user.role === 'admin';
}

// Vulnerable password reset
function resetPassword(email) {
  const user = findUserByEmail(email);
  const newPassword = generateRandomPassword();
  user.password = newPassword; // Stored in plain text
  sendEmail(email, newPassword);
}

// Vulnerable session management
function createSession(userId) {
  const sessionId = userId.toString(); // Predictable session ID
  sessions[sessionId] = { userId, expires: Date.now() + 3600000 };
  return sessionId;
}`;

function BugHuntPageContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const assignmentId = searchParams.get("assignment");
  
  const [analysis, setAnalysis] = useState("");
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
            if (savedFindings) setAnalysis(savedFindings);
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
          flag: "",
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
    if (!analysis.trim()) {
      alert("Please provide your security analysis before submitting.");
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
            findings: analysis,
            flag: "",
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
    
    alert("Security code review submitted! Excellent work on the enterprise bug hunting analysis.");
    setSubmitted(true);
  };

  return (
    <ChallengeLayout
      challengeTitle="Security Code Review: Enterprise Bug Hunting"
      difficulty="HARD"
      points={450}
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
                Security Bug Hunt Tutorial
              </h3>
              <button
                type="button"
                onClick={() => setShowTutorial(false)}
                className="rounded-lg border border-blue-300 px-3 py-1 text-sm hover:bg-blue-100"
              >
                Hide Tutorial
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-semibold text-red-700">
                  Common Security Vulnerabilities to Look For:
                </h4>
                <ul className="ml-4 list-disc space-y-2 text-sm text-slate-700">
                  <li>
                    <strong>Hardcoded Credentials:</strong> Passwords or secrets
                    stored directly in code
                  </li>
                  <li>
                    <strong>SQL Injection:</strong> User input directly
                    concatenated into SQL queries
                  </li>
                  <li>
                    <strong>Insecure Authentication:</strong> Weak password
                    policies, predictable session IDs
                  </li>
                  <li>
                    <strong>Missing Input Validation:</strong> No checks on user
                    input before processing
                  </li>
                  <li>
                    <strong>Insecure File Handling:</strong> No file type
                    validation, path traversal vulnerabilities
                  </li>
                  <li>
                    <strong>Plain Text Storage:</strong> Passwords or sensitive
                    data stored without encryption
                  </li>
                  <li>
                    <strong>Authorization Bypass:</strong> Missing or weak
                    permission checks
                  </li>
                  <li>
                    <strong>Session Management Issues:</strong> Predictable or
                    insecure session handling
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-green-700">
                  Security Best Practices:
                </h4>
                <ul className="ml-4 list-disc space-y-2 text-sm text-slate-700">
                  <li>
                    Use parameterized queries or ORMs to prevent SQL injection
                  </li>
                  <li>Store passwords using secure hashing (bcrypt, Argon2)</li>
                  <li>Validate and sanitize all user inputs</li>
                  <li>Use strong, unpredictable session IDs</li>
                  <li>Implement proper file type and size validation</li>
                  <li>Follow principle of least privilege for authorization</li>
                  <li>Never hardcode credentials - use environment variables</li>
                  <li>Encrypt sensitive data at rest and in transit</li>
                </ul>
              </div>

              <div className="rounded-lg border border-blue-300 bg-white p-4">
                <h4 className="mb-2 font-semibold">Analysis Checklist:</h4>
                <ul className="ml-4 list-disc space-y-1 text-sm text-slate-700">
                  <li>Review each function for security vulnerabilities</li>
                  <li>Check how user input is handled</li>
                  <li>Examine authentication and authorization logic</li>
                  <li>Look for hardcoded values or secrets</li>
                  <li>Identify missing security controls</li>
                  <li>Consider the impact of each vulnerability</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Challenge Section */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              Conduct a comprehensive security code review of enterprise-grade applications. Identify 
              critical vulnerabilities including authentication bypasses, authorization flaws, cryptographic 
              weaknesses, business logic errors, and insecure design patterns. Provide detailed remediation 
              strategies with complete secure code examples.
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Vulnerable Application Code:</p>
                <div className="rounded-lg border-2 border-red-200 bg-white p-4">
                  <pre className="overflow-x-auto text-xs font-mono">
                    <code>{vulnerableCode}</code>
                  </pre>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Review each function carefully. Look for common vulnerabilities like hardcoded credentials, SQL injection, insecure authentication, missing input validation, insecure file handling, plain text storage, authorization bypass, and session management issues.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Comprehensive Security Analysis:
              </label>
              <p className="mb-2 text-sm text-slate-600">
              Provide a detailed security code review. For each vulnerability, identify: vulnerability type 
              (CWE classification), severity (CVSS score if applicable), attack vectors, exploitation scenarios, 
              business impact, and complete remediation code. Include secure coding best practices and 
              defense-in-depth strategies.
            </p>
            <textarea
              value={analysis}
              onChange={(e) => setAnalysis(e.target.value)}
              placeholder="Provide comprehensive security analysis with CWE classifications, CVSS scores, exploitation scenarios, and complete remediation code..."
              className="min-h-[300px] w-full rounded-lg border border-slate-300 p-3 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              {analysis.length} characters
            </p>
            </div>
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
                disabled={!analysis.trim() || submitted || isSaving}
                className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitted ? "Analysis Submitted" : "Submit Analysis"}
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

export default function BugHuntPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-slate-600">Loading challenge...</div>
        </div>
      </div>
    }>
      <BugHuntPageContent />
    </Suspense>
  );
}

