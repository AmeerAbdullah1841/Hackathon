"use client";

import { useState } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

type Post = {
  id: number;
  user: string;
  platform: string;
  time: string;
  content: string;
  riskLevel: "high" | "medium" | "low";
  reasons: string[];
};

const posts: Post[] = [
  {
    id: 1,
    user: "@traveler_jane",
    platform: "Facebook",
    time: "2 hours ago",
    content: "Just posted my boarding pass for my vacation to Hawaii! Flight AA1234 departing tomorrow at 8 AM from JFK! Can't wait! ✈️🏝️",
    riskLevel: "high",
    reasons: ["Reveals travel dates", "Shows boarding pass with flight details", "Indicates home will be empty"],
  },
  {
    id: 2,
    user: "@photo_lover",
    platform: "Instagram",
    time: "4 hours ago",
    content: "Beautiful sunset from my backyard tonight #peaceful #home",
    riskLevel: "low",
    reasons: [],
  },
  {
    id: 3,
    user: "@new_employee",
    platform: "LinkedIn",
    time: "1 day ago",
    content: "First day at CyberTech Corp! My employee ID is CT-4567. Working in the server room on floor 12. So excited! 🏢",
    riskLevel: "high",
    reasons: ["Reveals workplace details", "Shows employee ID", "Discloses specific location (server room, floor 12)"],
  },
  {
    id: 4,
    user: "@party_planner",
    platform: "Twitter",
    time: "3 hours ago",
    content: "Having a great time at the coffee shop! ☕",
    riskLevel: "low",
    reasons: [],
  },
  {
    id: 5,
    user: "@proud_parent",
    platform: "Facebook",
    time: "1 day ago",
    content: "Jacob just got accepted to Lincoln High School! So proud of my little man! First day is September 5th! #proudparent",
    riskLevel: "medium",
    reasons: ["Reveals child's name", "Shows school name", "Discloses schedule"],
  },
  {
    id: 6,
    user: "@home_renovator",
    platform: "Instagram",
    time: "6 hours ago",
    content: "Going on vacation for two weeks! Just installed our new security system so the house will be safe while we're gone. Hope it works! ✈️🏠",
    riskLevel: "high",
    reasons: ["Announces vacation dates", "Reveals home will be empty", "Mentions security system (may indicate valuable items)"],
  },
  {
    id: 7,
    user: "@tech_enthusiast",
    platform: "Twitter",
    time: "5 hours ago",
    content: "Just got my new credit card! Chase Sapphire 5678 9012 XXXX XXXX. Can't wait to start earning those rewards! 💳",
    riskLevel: "high",
    reasons: ["Reveals partial credit card number", "Shows bank name", "Financial information exposure"],
  },
  {
    id: 8,
    user: "@password_probs",
    platform: "Facebook",
    time: "1 day ago",
    content: "I always forget my passwords! From now on using the same one everywhere: MyDogRex2023! That should be secure and easy to remember!",
    riskLevel: "high",
    reasons: ["Reveals actual password", "Admits to password reuse", "Security vulnerability"],
  },
  {
    id: 9,
    user: "@foodie_traveler",
    platform: "Instagram",
    time: "3 hours ago",
    content: "Enjoying some pasta at this local restaurant #delicious #foodie",
    riskLevel: "low",
    reasons: [],
  },
  {
    id: 10,
    user: "@angry_customer",
    platform: "Twitter",
    time: "4 hours ago",
    content: "Terrible service at Bank of America today! My account number ending in 4567 was flagged for 'suspicious activity' but there was nothing wrong! Now I have to reset all my payment info! 😡",
    riskLevel: "high",
    reasons: ["Reveals bank name", "Shows partial account number", "Discloses financial issues"],
  },
  {
    id: 11,
    user: "@birthday_boy",
    platform: "Facebook",
    time: "yesterday",
    content: "Thanks for all the birthday wishes! Can't believe I'm 28 today! My mom got me a new wallet and my sister sent me an Amazon gift card!",
    riskLevel: "medium",
    reasons: ["Reveals age/birthday", "Personal information"],
  },
  {
    id: 12,
    user: "@work_from_home",
    platform: "LinkedIn",
    time: "2 hours ago",
    content: "Working from home today! My home office is on the second floor, right above the garage. Perfect view of the street!",
    riskLevel: "medium",
    reasons: ["Reveals home layout", "Discloses location details"],
  },
  {
    id: 13,
    user: "@vacation_vibes",
    platform: "Instagram",
    time: "1 day ago",
    content: "Day 1 of our two-week family vacation! Left the spare key under the mat for the plant waterer. Hope our plants survive! 🪴🏠",
    riskLevel: "high",
    reasons: ["Announces vacation duration", "Reveals security vulnerability (spare key location)", "Indicates home is empty"],
  },
  {
    id: 14,
    user: "@security_newbie",
    platform: "Twitter",
    time: "yesterday",
    content: "Just set up my home WiFi! Network name is 'Smith Family WiFi' and I set an easy password so guests can remember it: welcome123",
    riskLevel: "high",
    reasons: ["Reveals WiFi password", "Shows network name", "Weak security practice"],
  },
  {
    id: 15,
    user: "@quarterly_reports",
    platform: "LinkedIn",
    time: "3 hours ago",
    content: "Just finished preparing the quarterly financial reports for the executive team!",
    riskLevel: "low",
    reasons: [],
  },
];

export default function SocialMediaDetectorPage() {
  const [selectedRisks, setSelectedRisks] = useState<Record<number, "high" | "medium" | "low">>({});
  const [analysis, setAnalysis] = useState("");
  const [showTutorial, setShowTutorial] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleRiskSelect = (postId: number, risk: "high" | "medium" | "low") => {
    setSelectedRisks((prev) => ({ ...prev, [postId]: risk }));
  };

  const handleSubmit = () => {
    const analyzedCount = Object.keys(selectedRisks).length;
    if (analyzedCount < posts.length) {
      alert(`Please analyze all ${posts.length} posts. Currently analyzed: ${analyzedCount}`);
      return;
    }
    if (!analysis.trim()) {
      alert("Please provide your analysis before submitting.");
      return;
    }
    alert("Analysis submitted! Great work identifying security risks in social media posts.");
    setSubmitted(true);
  };

  return (
    <ChallengeLayout
      challengeTitle="Social Media OSINT: Advanced Risk Assessment"
      difficulty="MEDIUM"
      points={320}
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
                Social Media Security Tutorial
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
                  Social Media Security Risks:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Location data - Reveals when you're away from home</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Travel plans - Announces when your home is empty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Personal identifiers - Names, birthdays, phone numbers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Workplace details - Building access information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Family information - Children's names, schools, schedules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Financial details - Account numbers, purchases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Home address - Physical location vulnerability</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-orange-700">
                  Security Vulnerability Types:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span>Physical security - Home invasion, stalking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span>Identity theft - Enough PII to impersonate you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span>Social engineering - Information used for targeted scams</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span>Financial fraud - Banking details, card numbers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span>Password compromise - Information for security questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span>Workplace security - Corporate espionage, access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span>Child safety - Information exposing minors to risk</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-2 font-semibold">Risk Assessment Guide:</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong className="text-red-700">High Risk Posts:</strong>
                  <ul className="ml-4 list-disc text-slate-700">
                    <li>Reveal passwords/PINs</li>
                    <li>Share travel dates</li>
                    <li>Expose financial details</li>
                    <li>Disclose home security</li>
                    <li>Reveal children's information</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-yellow-700">Medium Risk Posts:</strong>
                  <ul className="ml-4 list-disc text-slate-700">
                    <li>Share workplace details</li>
                    <li>Reveal birthdates</li>
                    <li>Disclose relationships</li>
                    <li>Share routine schedules</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-green-700">Low Risk Posts:</strong>
                  <ul className="ml-4 list-disc text-slate-700">
                    <li>General opinions</li>
                    <li>Non-specific activities</li>
                    <li>Public information</li>
                    <li>Generic photos</li>
                    <li>Non-personal content</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Challenge Section */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              Analyze 20 complex social media posts and profiles for security risks including OSINT gathering techniques, social engineering vectors, and privacy violations. Assess risk levels and provide comprehensive threat modeling for enterprise security teams.
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Social Media Posts ({posts.length} posts to analyze):</p>
                <div className="rounded-lg bg-white p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="border-b border-purple-100 pb-3">
                        <div className="text-xs font-semibold text-purple-800">
                          {post.platform} - {post.user} ({post.time})
                        </div>
                        <div className="mt-1 text-sm text-slate-700">{post.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Evaluate each post for security risks. Look for personal information exposure, travel plans, workplace details, financial information, passwords, location data, and other sensitive information that could be used for social engineering or OSINT gathering.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-2xl font-bold">
              Analyze each social media post and identify its security risk level
            </h3>
            <p className="mb-6 text-slate-600">
              Evaluate all {posts.length} posts by selecting their risk level (High,
            Medium, or Low). Then provide your security analysis.
          </p>

          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border-2 border-slate-200 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="font-semibold">{post.user}</span>
                    <span className="ml-2 text-sm text-slate-500">
                      {post.platform} · {post.time}
                    </span>
                  </div>
                  {selectedRisks[post.id] && (
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        selectedRisks[post.id] === "high"
                          ? "bg-red-100 text-red-700"
                          : selectedRisks[post.id] === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {selectedRisks[post.id].toUpperCase()} RISK
                    </span>
                  )}
                </div>
                <p className="mb-3 text-slate-700">{post.content}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRiskSelect(post.id, "high")}
                    className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${
                      selectedRisks[post.id] === "high"
                        ? "bg-red-600 text-white"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    High Risk
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRiskSelect(post.id, "medium")}
                    className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${
                      selectedRisks[post.id] === "medium"
                        ? "bg-yellow-600 text-white"
                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    }`}
                  >
                    Medium Risk
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRiskSelect(post.id, "low")}
                    className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${
                      selectedRisks[post.id] === "low"
                        ? "bg-green-600 text-white"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    Low Risk
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <label className="mb-2 block font-semibold">
              Security Analysis:
            </label>
            <p className="mb-2 text-sm text-slate-600">
              Explain your risk assessment approach. What types of information
              are most dangerous to share on social media? What patterns did you
              notice in high-risk posts?
            </p>
            <textarea
              value={analysis}
              onChange={(e) => setAnalysis(e.target.value)}
              placeholder="Explain your risk assessment approach..."
              className="min-h-[150px] w-full rounded-lg border border-slate-300 p-3"
            />
            <p className="mt-1 text-xs text-slate-500">
              {analysis.length} characters
            </p>
          </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              Object.keys(selectedRisks).length < posts.length ||
              !analysis.trim() ||
              submitted
            }
            className="mt-6 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitted
              ? "Analysis Submitted"
              : `Submit Analysis (${Object.keys(selectedRisks).length}/${posts.length} posts analyzed)`}
          </button>
        </div>
      </div>
    </ChallengeLayout>
  );
}

