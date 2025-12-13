"use client";

import { useState } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

const storyTemplate = `Once upon a time, a {company} in the {industry} industry experienced a massive data breach. The CEO, {ceo}, was {adjective} when they discovered that {plural_noun} had been compromised. 

The attackers used {verb} techniques to gain access to the system. They {verb_ed} {adjective} vulnerabilities and stole {large_number} records containing sensitive information.

The security team worked {time_period} to contain the breach and notify affected customers. This incident taught everyone the importance of {adjective} security practices and regular {plural_noun} updates.`;

type FormData = {
  company: string;
  industry: string;
  ceo: string;
  adjective: string;
  plural_noun: string;
  verb: string;
  verb_ed: string;
  large_number: string;
  time_period: string;
};

export default function CyberMadLibsPage() {
  const [formData, setFormData] = useState<FormData>({
    company: "",
    industry: "",
    ceo: "",
    adjective: "",
    plural_noun: "",
    verb: "",
    verb_ed: "",
    large_number: "",
    time_period: "",
  });
  const [story, setStory] = useState("");
  const [showTutorial, setShowTutorial] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateStory = () => {
    let generatedStory = storyTemplate;
    Object.entries(formData).forEach(([key, value]) => {
      const placeholder = `{${key.replace(/_/g, "_")}}`;
      generatedStory = generatedStory.replace(new RegExp(placeholder, "g"), value);
    });
    setStory(generatedStory);
  };

  const handleSubmit = () => {
    if (Object.values(formData).some((v) => !v.trim())) {
      alert("Please fill in all fields before submitting");
      return;
    }
    if (!story) {
      alert("Please generate a story first by clicking 'Preview Story'");
      return;
    }
    alert("Mad Libs story submitted! Great work learning about cybersecurity through storytelling!");
    setSubmitted(true);
  };

  return (
    <ChallengeLayout
      challengeTitle="Security Awareness: Advanced Scenario Building"
      difficulty="EASY"
      points={200}
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
                Cybersecurity Mad Libs Tutorial
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
                  How to Play Cybersecurity Mad Libs:
                </h4>
                <ol className="ml-4 list-decimal space-y-2 text-sm text-slate-700">
                  <li>
                    Fill in all the blank fields with creative words that match
                    the requested type
                  </li>
                  <li>
                    Click "Preview Story" to see your cybersecurity story come to
                    life
                  </li>
                  <li>Submit your completed story when you're happy with it</li>
                  <li>
                    Try different scenarios by clicking "Try Another Scenario"
                  </li>
                  <li>
                    Learn cybersecurity concepts through creative storytelling
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-green-700">
                  Learning Objectives:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>
                      Understand common cybersecurity threats and scenarios
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Recognize security terminology in context</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>
                      Identify potential security risks and vulnerabilities
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>
                      Learn about security best practices through storytelling
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>
                      Develop creative problem-solving skills for security
                      challenges
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-2 font-semibold">Tips for Great Mad Libs:</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-slate-700">
                <li>
                  Be creative with your word choices - unexpected words make
                  funnier stories
                </li>
                <li>
                  Pay attention to the word type requested (noun, verb, adjective,
                  etc.)
                </li>
                <li>
                  Try to use cybersecurity-related terms when appropriate
                </li>
                <li>
                  Read your completed story out loud to catch any awkward phrasing
                </li>
                <li>
                  Have fun while learning about important security concepts!
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Challenge Section */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              Create comprehensive cybersecurity scenarios through interactive storytelling. Build realistic threat scenarios covering advanced attack vectors, incident response procedures, and security best practices.
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Story Template:</p>
                <div className="rounded-lg bg-white p-4">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-slate-700">
                    {storyTemplate}
                  </pre>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Fill in the blanks with appropriate cybersecurity terms to create a realistic data breach scenario. Think about real-world attack vectors, security vulnerabilities, and incident response procedures.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-bold">The Data Breach</h3>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  company: "",
                  industry: "",
                  ceo: "",
                  adjective: "",
                  plural_noun: "",
                  verb: "",
                  verb_ed: "",
                  large_number: "",
                  time_period: "",
                });
                setStory("");
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              Try Another Scenario
            </button>
          </div>
          <p className="mb-6 text-slate-600">
            Complete the story about a company experiencing a data breach.
          </p>

          <div className="mb-6 rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
            <p className="text-sm text-purple-900">
              Fill in all the blanks below, then click "Preview Story" to see
              your cybersecurity mad lib!
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Company Name:
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => updateField("company", e.target.value)}
                placeholder="Enter a company name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Industry:</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                placeholder="Enter an industry"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">CEO Name:</label>
              <input
                type="text"
                value={formData.ceo}
                onChange={(e) => updateField("ceo", e.target.value)}
                placeholder="Enter a CEO name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Adjective:</label>
              <input
                type="text"
                value={formData.adjective}
                onChange={(e) => updateField("adjective", e.target.value)}
                placeholder="Enter an adjective"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Plural Noun:
              </label>
              <input
                type="text"
                value={formData.plural_noun}
                onChange={(e) => updateField("plural_noun", e.target.value)}
                placeholder="Enter a plural noun"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Verb:</label>
              <input
                type="text"
                value={formData.verb}
                onChange={(e) => updateField("verb", e.target.value)}
                placeholder="Enter a verb"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Verb ending in -ed:
              </label>
              <input
                type="text"
                value={formData.verb_ed}
                onChange={(e) => updateField("verb_ed", e.target.value)}
                placeholder="Enter a verb ending in -ed"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Large Number:
              </label>
              <input
                type="text"
                value={formData.large_number}
                onChange={(e) => updateField("large_number", e.target.value)}
                placeholder="Enter a large number"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold">
                Time Period:
              </label>
              <input
                type="text"
                value={formData.time_period}
                onChange={(e) => updateField("time_period", e.target.value)}
                placeholder="Enter a time period"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={generateStory}
            disabled={Object.values(formData).some((v) => !v.trim())}
            className="mt-6 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview Story
          </button>

          {story && (
            <div className="mt-6 rounded-lg border-2 border-green-200 bg-green-50 p-6">
              <h4 className="mb-3 font-semibold">Your Cybersecurity Story:</h4>
              <p className="whitespace-pre-wrap text-slate-700">{story}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!story || submitted}
            className="mt-6 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitted ? "Story Submitted" : "Submit Story"}
          </button>
        </div>
      </div>
    </ChallengeLayout>
  );
}

