"use client";

import { useState } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

const termsAndConditions = `TERMS AND CONDITIONS

1. ACCEPTANCE OF TERMS
By accessing and using this service, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.

2. USER ACCOUNTS
Users must provide accurate information when creating accounts. You are responsible for maintaining the confidentiality of your account credentials.

3. PRIVACY POLICY
We collect and process personal data in accordance with our Privacy Policy. Your privacy is important to us.

4. INTELLECTUAL PROPERTY
All content on this platform is protected by copyright and other intellectual property laws.

5. USER CONDUCT
Users agree not to engage in any activity that violates applicable laws or regulations.

6. DATA COLLECTION AND SHARING
By using this service, you consent to the collection, storage, and sharing of your personal data, including but not limited to: biometric data (fingerprints, facial recognition), location data (GPS coordinates, IP addresses), browsing history, purchase history, social media activity, and any other data we deem necessary for service improvement. This data may be shared with third-party partners, advertisers, and government agencies without additional consent.

7. SERVICE AVAILABILITY
We strive to maintain service availability but do not guarantee uninterrupted access.

8. LIMITATION OF LIABILITY
We are not liable for any damages arising from the use of this service.

9. REMOTE ACCESS AND MONITORING
You grant us the right to remotely access your device, monitor all activities, install software, access files, modify settings, and collect real-time data without prior notification. This includes access to cameras, microphones, and all installed applications.

10. MODIFICATIONS TO TERMS
We reserve the right to modify these terms at any time without notice.

11. TERMINATION
We may terminate your account at any time for any reason.

12. GOVERNING LAW
These terms are governed by the laws of the jurisdiction in which we operate.

13. DATA RETENTION AND DELETION
We retain all collected data indefinitely, even after account deletion. Deleted accounts' data will be archived and may be used for research, analytics, or shared with partners. You waive any right to request data deletion.

14. THIRD-PARTY SERVICES
We integrate with various third-party services and share your data with them for enhanced functionality.

15. ADVERTISING AND MARKETING
Your data will be used for targeted advertising and marketing purposes. You consent to receiving promotional communications via all available channels.

16. FINANCIAL INFORMATION
By providing payment information, you authorize us to store, process, and share your financial data with payment processors, banks, and financial institutions for transaction processing and fraud prevention.

17. CHILDREN'S DATA
If you are under 18, your parent or guardian must consent to these terms. We collect and process data from users of all ages, including children, in accordance with applicable laws.

18. INTERNATIONAL DATA TRANSFERS
Your data may be transferred to and processed in countries with different data protection laws. You consent to such transfers regardless of your location.

19. AUTOMATED DECISION MAKING
We use automated systems to make decisions about your account, including credit scoring, content filtering, and service access. You waive the right to human review of these decisions.

20. CONSENT TO MONITORING
You acknowledge that all communications, including private messages, emails, and phone calls made through our service, may be monitored, recorded, and analyzed for security, quality assurance, and compliance purposes.

21. BIOMETRIC DATA COLLECTION
We collect and store biometric identifiers including fingerprints, facial recognition data, voiceprints, and behavioral biometrics. This data is used for authentication, fraud prevention, and may be shared with law enforcement upon request.

22. LOCATION TRACKING
We continuously track and store your location data, including historical locations, travel patterns, and geofencing information. This data is shared with advertising partners and may be used for location-based services.

23. SOCIAL MEDIA INTEGRATION
By connecting social media accounts, you grant us access to all your social media data, posts, contacts, messages, and activity. We may post on your behalf and access private messages.

24. HEALTH AND FITNESS DATA
If you use health or fitness features, we collect and store health data, exercise patterns, medical information, and may share this with healthcare providers, insurance companies, and research institutions.

25. EMPLOYMENT AND BACKGROUND CHECKS
We may conduct background checks, verify employment history, and access credit reports. This information may be shared with employers, landlords, and other third parties.

26. DISPUTE RESOLUTION
All disputes must be resolved through binding arbitration. You waive the right to a jury trial and class action lawsuits.

27. INDEMNIFICATION
You agree to indemnify us against any claims arising from your use of the service.

28. FORCE MAJEURE
We are not liable for failures due to circumstances beyond our control.

29. SEVERABILITY
If any provision is found invalid, the remainder of the terms remain in effect.

30. ENTIRE AGREEMENT
These terms constitute the entire agreement between you and us.`;

const suspiciousClauses = [
  {
    section: 6,
    text: "DATA COLLECTION AND SHARING - Excessive data collection including biometric data, location data, and sharing with third parties without proper consent",
  },
  {
    section: 9,
    text: "REMOTE ACCESS AND MONITORING - Grants unlimited remote access to devices without notification",
  },
  {
    section: 13,
    text: "DATA RETENTION AND DELETION - Indefinite data retention even after account deletion",
  },
  {
    section: 20,
    text: "CONSENT TO MONITORING - Monitoring of all private communications without proper safeguards",
  },
  {
    section: 21,
    text: "BIOMETRIC DATA COLLECTION - Collection of sensitive biometric data with sharing to law enforcement",
  },
];

export default function TermsTrapPage() {
  const [foundClauses, setFoundClauses] = useState("");
  const [showTutorial, setShowTutorial] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!foundClauses.trim()) {
      alert("Please provide your legal security audit before submitting.");
      return;
    }
    alert("Legal security audit submitted! Excellent work on the comprehensive analysis.");
    setSubmitted(true);
  };

  return (
    <ChallengeLayout
      challengeTitle="Terms & Conditions: Legal Security Audit"
      difficulty="MEDIUM"
      points={280}
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
                Terms & Conditions Analysis Tutorial
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
                  Red Flags to Look For:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Unusual section numbers (gaps in sequence)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Overly broad data collection rights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Remote access permissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Sharing data without consent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Biometric data collection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Location tracking clauses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Indefinite data retention</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Waiver of privacy rights</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-blue-700">
                  Search Strategy:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Read through all sections carefully</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Look for suspicious section numbers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Pay attention to data sharing clauses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Check for privacy violations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Note any unusual permissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Look for words like "indefinite", "unlimited", "all data"</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-2 font-semibold">What Makes a Clause Suspicious:</h4>
              <p className="text-sm text-slate-700">
                Look for clauses that grant excessive permissions, collect
                unnecessary data, or share information without proper consent.
                These are often hidden in unusual section numbers or buried in
                legal language. Pay special attention to sections about data
                collection, sharing, retention, and monitoring.
              </p>
            </div>
          </div>
        )}

        {/* Challenge Section */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              Conduct a comprehensive security audit of terms and conditions documents. Analyze 50+ sections for hidden data collection clauses, privacy violations, compliance issues, 
            and legal security risks. Identify all suspicious clauses and provide detailed legal analysis 
            with remediation recommendations.
          </p>

          <div className="mb-6 rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-3 font-semibold">Terms and Conditions (30 sections):</h4>
            <div className="max-h-96 overflow-y-auto rounded bg-white p-4 text-sm">
              <pre className="whitespace-pre-wrap font-sans text-slate-700">
                {termsAndConditions}
              </pre>
            </div>
          </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Comprehensive Legal Security Audit:
            </label>
            <p className="mb-2 text-sm text-slate-600">
              Provide a detailed legal security audit. Identify all suspicious clauses with section numbers, 
              explain privacy violations, compliance issues (GDPR, CCPA), data collection risks, and provide 
              remediation recommendations with legal best practices.
            </p>
            <textarea
              value={foundClauses}
              onChange={(e) => setFoundClauses(e.target.value)}
              placeholder="List all suspicious clauses with section numbers..."
              className="min-h-[200px] w-full rounded-lg border border-slate-300 p-3"
            />
            <p className="mt-1 text-xs text-slate-500">
              {foundClauses.length} characters
            </p>
          </div>

          <div className="mt-6 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
            <h4 className="mb-2 font-semibold">Challenge Goal:</h4>
            <p className="text-sm text-slate-700">
              Find all 5 hidden security clauses that grant excessive permissions
              or violate user privacy. Look for unusual section numbers and
              suspicious data collection practices.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!foundClauses.trim() || submitted}
            className="mt-6 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitted ? "Analysis Submitted" : "Submit Analysis"}
          </button>
        </div>
      </div>
    </ChallengeLayout>
  );
}

