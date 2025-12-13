"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

type Email = {
  id: number;
  subject: string;
  from: string;
  date: string;
  body: string;
  signature: string;
  isPhishing: boolean;
  redFlags: string[];
};

const emails: Email[] = [
  {
    id: 1,
    subject: "URGENT: Account Verification Required",
    from: "security@yourbankk.com",
    date: "2024-02-15",
    body: "Dear Valued Customer, Your account has been temporarily suspended due to suspicious activity. Click here immediately to verify your account: http://verify-account-now.suspicious-site.com Failure to verify within 24 hours will result in permanent account closure.",
    signature: "Security Team",
    isPhishing: true,
    redFlags: [
      "Suspicious domain: 'yourbankk.com' (double 'k')",
      "Urgent language creating false pressure",
      "Generic greeting 'Dear Valued Customer'",
      "Suspicious URL: 'suspicious-site.com'",
      "Threat of account closure",
    ],
  },
  {
    id: 11,
    subject: "Re: Your Recent Transaction - Verification Needed",
    from: "noreply@bаnk.com",
    date: "2024-02-24",
    body: "We detected an unusual transaction on your account. Transaction ID: TXN-7F3A9B2C Amount: $2,847.50 Merchant: Unknown Please verify this transaction by clicking the secure link: https://secure-bank-verify.com/validate?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 The link will expire in 2 hours for security reasons.",
    signature: "Bank Security Department",
    isPhishing: true,
    redFlags: [
      "Homograph attack: 'bаnk.com' uses Cyrillic 'а' instead of Latin 'a'",
      "Suspicious domain: 'secure-bank-verify.com' (not official bank domain)",
      "Fake JWT token in URL (common phishing technique)",
      "Urgent 2-hour expiration",
      "Generic transaction details",
    ],
  },
  {
    id: 2,
    subject: "Your Amazon Order #A28CV97",
    from: "order-confirmation@amazon.com",
    date: "2024-02-16",
    body: "Hello, Thank you for your order. We'll send a confirmation when your item ships. Details: Order #A28CV97 Arriving: Feb 18-19 Amazon Echo Dot (4th Gen) - $49.99 Quantity: 1 You can view your order status and make changes here: https://www.amazon.com/gp/css/order-history",
    signature: "Amazon Customer Service",
    isPhishing: false,
    redFlags: [],
  },
  {
    id: 3,
    subject: "Payment Received - PayPal",
    from: "service@paypal.com",
    date: "2024-02-14",
    body: "Dear Customer, You have received a payment of $750.00 USD from FOREIGN COMPANY LTD. This transaction was unauthorized? If you did not authorize this payment of $750.00 USD, click the link below immediately to secure your account and request a refund: http://paypal-secure-center.com/dispute-resolution You have 48 hours to dispute this transaction before it becomes permanent.",
    signature: "PayPal Team",
    isPhishing: true,
    redFlags: [
      "Suspicious URL: 'paypal-secure-center.com' (not paypal.com)",
      "Urgent 48-hour deadline",
      "Poor grammar: 'This transaction was unauthorized?'",
      "HTTP instead of HTTPS",
      "Generic greeting",
    ],
  },
  {
    id: 4,
    subject: "IT Security Update",
    from: "it-security@yourcompany.com",
    date: "2024-02-17",
    body: "Dear Employee, We have updated our security policies. Please review the attached document and confirm your understanding.",
    signature: "IT Security Team",
    isPhishing: false,
    redFlags: [],
  },
  {
    id: 5,
    subject: "Your Netflix Account Has Been Suspended",
    from: "support@netflixx.com",
    date: "2024-02-18",
    body: "Your Netflix account has been suspended due to payment issues. Update your payment information immediately: http://netflix-update.phish.com",
    signature: "Netflix Support",
    isPhishing: true,
    redFlags: [
      "Suspicious domain: 'netflixx.com' (double 'x')",
      "Suspicious URL: 'phish.com'",
      "HTTP instead of HTTPS",
      "Urgent language",
    ],
  },
  {
    id: 6,
    subject: "LinkedIn: New Connection Request",
    from: "notifications@linkedin.com",
    date: "2024-02-21",
    body: "Sarah Johnson wants to connect on LinkedIn. Hello, Sarah Johnson has sent you a connection request. View their profile and respond to their request by clicking the button below.",
    signature: "LinkedIn Team",
    isPhishing: false,
    redFlags: [],
  },
  {
    id: 7,
    subject: "IRS Tax Refund - Action Required",
    from: "refund@irs-gov.fake.com",
    date: "2024-02-20",
    body: "You are eligible for a tax refund of $2,847. Click here to claim: http://irs-refund.scam.com Provide your SSN and bank details to process your refund.",
    signature: "Internal Revenue Service",
    isPhishing: true,
    redFlags: [
      "Suspicious domain: 'irs-gov.fake.com'",
      "Request for SSN and bank details",
      "Suspicious URL: 'scam.com'",
      "Too good to be true offer",
      "HTTP instead of HTTPS",
    ],
  },
  {
    id: 8,
    subject: "Weekly Team Meeting Reminder",
    from: "manager@company-internal.com",
    date: "2024-02-19",
    body: "This is a friendly reminder about our weekly team meeting scheduled for tomorrow at 10:00 AM in Conference Room A. Please come prepared with your project updates.",
    signature: "Best regards, John Smith, Project Manager",
    isPhishing: false,
    redFlags: [],
  },
  {
    id: 9,
    subject: "Your Flight Reservation Confirmation",
    from: "reservations@delta.com",
    date: "2024-02-23",
    body: "Thank you for choosing Delta Air Lines. Your flight reservation has been confirmed. Passenger: John Doe Flight: DL1234 Date: March 15, 2024 Departure: New York (JFK) - 10:30 AM Arrival: San Francisco (SFO) - 2:15 PM Manage your reservation online at delta.com or through the Delta app.",
    signature: "We look forward to welcoming you on board.",
    isPhishing: false,
    redFlags: [],
  },
  {
    id: 10,
    subject: "URGENT: Verify Your Microsoft Account",
    from: "noreply@microsoft-security.verify.com",
    date: "2024-02-22",
    body: "We detected unusual activity on your Microsoft account. Verify your identity immediately: https://microsoft-security.verify.com/login?token=abc123xyz Your account will be locked in 2 hours if you don't verify.",
    signature: "Microsoft Security Team",
    isPhishing: true,
    redFlags: [
      "Suspicious domain: 'microsoft-security.verify.com' (not microsoft.com)",
      "Urgent 2-hour deadline",
      "Generic security alert",
      "Suspicious token in URL",
      "Threat of account lockout",
    ],
  },
  {
    id: 12,
    subject: "Microsoft 365: Action Required on Your Account",
    from: "microsoft-security@microsoft.com",
    date: "2024-02-25",
    body: "Your Microsoft 365 account requires immediate attention. We've detected suspicious login attempts from an unrecognized device in a new location. IP Address: 185.220.101.47 Location: Moscow, Russia Time: 2024-02-25 14:32:18 UTC If this wasn't you, please secure your account immediately: https://account.microsoft.com/security/verify",
    signature: "Microsoft Account Security Team",
    isPhishing: false,
    redFlags: [],
  },
  {
    id: 13,
    subject: "Invoice #INV-2024-0847 - Payment Overdue",
    from: "billing@supplier-company.com",
    date: "2024-02-23",
    body: "Dear Customer, Your invoice #INV-2024-0847 for $4,250.00 is now 15 days overdue. Please remit payment immediately to avoid service interruption. Payment link: http://pay-invoice.supplier-company.com/pay?invoice=INV-2024-0847&amount=4250.00&due=2024-02-23 Note: This email was sent from an unmonitored address. Please do not reply.",
    signature: "Accounts Receivable Department",
    isPhishing: true,
    redFlags: [
      "HTTP instead of HTTPS for payment link",
      "Urgent payment demand",
      "Unmonitored email address warning",
      "Suspicious payment domain structure",
      "Generic greeting",
    ],
  },
  {
    id: 14,
    subject: "Your Package Delivery - Tracking Update",
    from: "tracking@fedex.com",
    date: "2024-02-26",
    body: "Your package is out for delivery today. Tracking Number: 123456789012 Expected Delivery: Today by 8:00 PM Track your package: https://www.fedex.com/apps/fedextrack/?tracknumbers=123456789012",
    signature: "FedEx Tracking",
    isPhishing: false,
    redFlags: [],
  },
  {
    id: 15,
    subject: "Security Alert: New Device Login Detected",
    from: "security-alerts@github.com",
    date: "2024-02-27",
    body: "A new device signed in to your GitHub account. Device: Chrome on Windows Location: San Francisco, CA, USA Time: 2024-02-27 09:15:23 UTC If this was you, no action is needed. If not, secure your account: https://github.com/settings/security",
    signature: "GitHub Security",
    isPhishing: false,
    redFlags: [],
  },
];

export function SpotThePhishClient() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const assignmentId = searchParams.get("assignment");
  
  const [selectedEmails, setSelectedEmails] = useState<Set<number>>(new Set());
  const [redFlags, setRedFlags] = useState("");
  const [prevention, setPrevention] = useState("");
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
            const savedPlan = data.submission.plan || "";
            const savedFindings = data.submission.findings || "";
            if (savedPlan) setRedFlags(savedPlan);
            if (savedFindings) setPrevention(savedFindings);
            if (data.submission.flag) {
              try {
                const savedSelections = JSON.parse(data.submission.flag);
                if (Array.isArray(savedSelections)) {
                  setSelectedEmails(new Set(savedSelections));
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

  const toggleEmail = (id: number) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!teamId || !assignmentId) {
      setSaveMessage("Team or assignment information missing");
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const submissionData = {
        plan: redFlags,
        findings: prevention,
        flag: JSON.stringify(Array.from(selectedEmails)),
      };

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          teamId,
          ...submissionData,
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
    if (!redFlags.trim() || !prevention.trim()) {
      alert("Please provide your analysis before submitting.");
      return;
    }
    
    if (teamId && assignmentId) {
      setIsSaving(true);
      try {
        const submissionData = {
          plan: redFlags,
          findings: prevention,
          flag: JSON.stringify(Array.from(selectedEmails)),
        };

        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignmentId,
            teamId,
            ...submissionData,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save submission");
        }
      } catch (error) {
        alert("Failed to save submission. Please try again.");
        setIsSaving(false);
        return;
      } finally {
        setIsSaving(false);
      }
    }

    const phishingEmails = emails.filter((e) => e.isPhishing);
    const correctSelections = phishingEmails.filter((e) =>
      selectedEmails.has(e.id),
    ).length;
    const incorrectSelections = Array.from(selectedEmails).filter(
      (id) => !emails.find((e) => e.id === id)?.isPhishing,
    ).length;

    if (correctSelections === phishingEmails.length && incorrectSelections === 0) {
      alert("Excellent analysis! You identified all phishing emails and provided comprehensive threat analysis!");
    } else {
      alert(
        `You identified ${correctSelections} out of ${phishingEmails.length} phishing emails. Review the advanced techniques and try again!`,
      );
    }
    setSubmitted(true);
  };

  return (
    <ChallengeLayout
      challengeTitle="Phishing Email Detection: Advanced Threat Analysis"
      difficulty="HARD"
      points={350}
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
                Phishing Detection Tutorial
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
                <h4 className="mb-3 font-semibold text-red-700">
                  Advanced Red Flags to Look For:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>
                      <strong>Homograph attacks:</strong> Domains using lookalike characters (Cyrillic, Greek, etc.)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>
                      <strong>Email header spoofing:</strong> Display name vs. actual sender mismatch
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>
                      <strong>Multi-stage payloads:</strong> Initial email leads to secondary malicious content
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>
                      <strong>URL obfuscation:</strong> Shortened links, redirect chains, or encoded URLs
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>
                      <strong>Brand impersonation:</strong> Sophisticated logo and design replication
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>
                      <strong>Context-aware attacks:</strong> Emails referencing recent events or personal information
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>
                      <strong>BEC (Business Email Compromise):</strong> Impersonation of executives or vendors
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>
                      <strong>Credential harvesting:</strong> Fake login pages with legitimate-looking domains
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>
                      <strong>Time-based urgency:</strong> Artificial deadlines to prevent verification
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-green-700">
                  Legitimate Email Signs:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>
                      Correct official company domains in sender address
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Personalized content addressed to you by name</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>No urgent threats or pressure tactics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Professional formatting and proper grammar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Links that match the claimed organization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Expected communications (receipts for purchases made)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>
                      Contact information that matches official sources
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-2 font-semibold">Advanced Verification Techniques:</h4>
              <ol className="ml-4 list-decimal space-y-2 text-sm text-slate-700">
                <li>
                  <strong>Inspect email headers:</strong> Check SPF, DKIM, and DMARC records. Look for 
                  "Return-Path" and "Received" headers to trace email origin
                </li>
                <li>
                  <strong>Domain analysis:</strong> Use WHOIS, DNS records, and certificate transparency 
                  logs to verify domain legitimacy. Check for recent domain registration
                </li>
                <li>
                  <strong>URL analysis:</strong> Decode shortened URLs, check redirect chains, and verify 
                  SSL certificates. Use tools like VirusTotal for URL reputation
                </li>
                <li>
                  <strong>Content analysis:</strong> Check for embedded tracking pixels, hidden content, 
                  and suspicious attachments. Analyze HTML source for obfuscation
                </li>
                <li>
                  <strong>Cross-reference:</strong> Verify claims through official channels. Check if 
                  the email matches known legitimate communications from the organization
                </li>
                <li>
                  <strong>Behavioral indicators:</strong> Legitimate emails rarely create artificial urgency. 
                  Be suspicious of requests for immediate action without verification options
                </li>
              </ol>
            </div>
            <div className="mt-4 rounded-lg border border-purple-300 bg-purple-50 p-4">
              <h4 className="mb-2 font-semibold text-purple-900">Enterprise Prevention Strategies:</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-purple-800">
                <li>Implement email security gateways with advanced threat protection</li>
                <li>Deploy DMARC, SPF, and DKIM authentication</li>
                <li>Use AI/ML-based email filtering and sandboxing</li>
                <li>Conduct regular security awareness training with phishing simulations</li>
                <li>Implement multi-factor authentication (MFA) for all accounts</li>
                <li>Establish clear reporting procedures for suspicious emails</li>
                <li>Monitor for domain spoofing and brand impersonation</li>
              </ul>
            </div>
          </div>
        )}

        {/* Challenge Instructions */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              Analyze 15 sophisticated phishing emails with advanced evasion techniques including homograph attacks, 
              email header spoofing, multi-stage payloads, and sophisticated social engineering. 
              Identify all phishing attempts, explain advanced red flags, and propose 
              enterprise-level prevention strategies.
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Phishing Email Samples ({emails.length} emails to analyze):</p>
                <div className="rounded-lg bg-white p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {emails.map((email) => (
                      <div key={email.id} className="border-b border-purple-100 pb-3">
                        <div className="text-xs font-semibold text-purple-800">
                          Email #{email.id}: {email.subject}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">From: {email.from} | Date: {email.date}</div>
                        <div className="mt-1 text-sm text-slate-700 line-clamp-2">{email.body.substring(0, 150)}...</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Review each email carefully. Look for suspicious domains, homograph attacks, urgent language, generic greetings, suspicious URLs, poor grammar, and other red flags. Identify all phishing emails and explain the advanced techniques used.
                </p>
              </div>
            </div>
          </div>

          <h3 className="mb-4 text-2xl font-bold">
            Analyze the {emails.length} emails below and identify all phishing attempts
          </h3>
          <p className="mb-6 text-slate-600">
            These emails include advanced evasion techniques such as homograph attacks, 
            email header spoofing, multi-stage payloads, and sophisticated social engineering. 
            Identify all phishing attempts, explain advanced red flags, and propose 
            enterprise-level prevention strategies.
          </p>

          {/* Email List */}
          <div className="space-y-4">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`rounded-lg border-2 p-4 transition ${
                  selectedEmails.has(email.id)
                    ? "border-red-500 bg-red-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedEmails.has(email.id)}
                        onChange={() => toggleEmail(email.id)}
                        className="h-5 w-5 cursor-pointer"
                      />
                      <h4 className="font-semibold">{email.subject}</h4>
                    </div>
                    <div className="ml-8 space-y-1 text-sm text-slate-600">
                      <p>
                        <span className="font-medium">From:</span> {email.from}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span> {email.date}
                      </p>
                      <p className="mt-2 text-slate-700">{email.body}</p>
                      <p className="mt-2 text-slate-500">{email.signature}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Analysis Section */}
          <div className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block font-semibold">
                Advanced Red Flags Identified:
              </label>
              <p className="mb-2 text-sm text-slate-600">
                Provide a comprehensive analysis of all red flags found in the phishing emails. 
                Include advanced techniques such as homograph attacks, header spoofing, URL obfuscation, 
                and multi-stage payloads. Explain how each technique works and why it's effective.
              </p>
              <textarea
                value={redFlags}
                onChange={(e) => setRedFlags(e.target.value)}
                placeholder="Provide detailed analysis of advanced red flags and evasion techniques..."
                className="min-h-[180px] w-full rounded-lg border border-slate-300 p-3"
              />
              <p className="mt-1 text-xs text-slate-500">
                {redFlags.length} characters
              </p>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Enterprise Prevention Strategies:
              </label>
              <p className="mb-2 text-sm text-slate-600">
                Propose comprehensive enterprise-level prevention strategies. Include technical controls 
                (email security gateways, DMARC/DKIM, AI filtering), organizational policies, user training 
                programs, and incident response procedures.
              </p>
              <textarea
                value={prevention}
                onChange={(e) => setPrevention(e.target.value)}
                placeholder="Propose enterprise-level prevention strategies and security controls..."
                className="min-h-[180px] w-full rounded-lg border border-slate-300 p-3"
              />
              <p className="mt-1 text-xs text-slate-500">
                {prevention.length} characters
              </p>
            </div>

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
                  !redFlags.trim() ||
                  !prevention.trim() ||
                  selectedEmails.size === 0 ||
                  submitted ||
                  isSaving
                }
                className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitted ? "Analysis Submitted" : "Submit Analysis"}
              </button>
            </div>
            {saveMessage && (
              <p className={`text-sm font-medium ${
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

