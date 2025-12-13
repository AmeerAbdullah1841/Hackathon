"use client";

import { useState } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

const questions = [
  {
    id: 1,
    question: "What percentage of the internet is considered the 'dark web'?",
    options: ["50%", "25%", "Less than 1%", "10%"],
    correct: 2,
  },
  {
    id: 2,
    question: "Is it illegal to access the dark web?",
    options: [
      "Always illegal",
      "Legal in most countries",
      "Only illegal on weekends",
      "Depends on your age",
    ],
    correct: 1,
  },
  {
    id: 3,
    question: "What browser is commonly used to access the dark web?",
    options: ["Chrome", "Firefox", "Tor Browser", "Safari"],
    correct: 2,
  },
  {
    id: 4,
    question: "The dark web is primarily used for:",
    options: [
      "Illegal activities only",
      "Privacy and anonymity",
      "Gaming",
      "Social media",
    ],
    correct: 1,
  },
  {
    id: 5,
    question: "What does '.onion' refer to in dark web addresses?",
    options: [
      "A vegetable marketplace",
      "Tor hidden services",
      "A type of encryption",
      "A hacker group",
    ],
    correct: 1,
  },
  {
    id: 6,
    question: "Who originally developed the Tor network?",
    options: [
      "Hackers",
      "US Naval Research Laboratory",
      "Google",
      "Anonymous",
    ],
    correct: 1,
  },
  {
    id: 7,
    question: "What is the 'surface web'?",
    options: [
      "The dark web",
      "Publicly accessible internet",
      "Social media only",
      "Government websites",
    ],
    correct: 1,
  },
  {
    id: 8,
    question: "Which cryptocurrency is most commonly used on dark web marketplaces?",
    options: ["US Dollars", "Bitcoin", "Gold", "Gift cards"],
    correct: 1,
  },
  {
    id: 9,
    question: "What is the 'deep web'?",
    options: [
      "Same as dark web",
      "Non-indexed content",
      "Illegal content only",
      "Underwater cables",
    ],
    correct: 1,
  },
  {
    id: 10,
    question: "Can you be completely anonymous on the dark web?",
    options: [
      "Yes, always",
      "No, user behavior can compromise anonymity",
      "Only if you use VPN",
      "Only on weekends",
    ],
    correct: 1,
  },
];

export default function DarkWebMythsPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showTutorial, setShowTutorial] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 4;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      alert(`Please answer all ${questions.length} questions. Currently answered: ${answeredCount}`);
      return;
    }
    const correct = questions.filter(
      (q) => answers[q.id] === q.correct,
    ).length;
    alert(`Quiz submitted! You got ${correct} out of ${questions.length} correct.`);
    setSubmitted(true);
  };

  const currentQuestions = questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage,
  );

  return (
    <ChallengeLayout
      challengeTitle="Dark Web Intelligence: Advanced OSINT Quiz"
      difficulty="MEDIUM"
      points={300}
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
                Dark Web: Myths vs. Reality
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
                <h4 className="mb-2 font-semibold">What is the Dark Web?</h4>
                <p className="text-sm text-slate-700">
                  The dark web is a part of the internet that requires special
                  software (like Tor) to access. It's intentionally hidden and
                  not indexed by standard search engines. While often associated
                  with illegal activities, the dark web also serves legitimate
                  purposes such as privacy protection, secure communication for
                  journalists, and circumvention of censorship.
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">Internet Structure:</h4>
                <ul className="ml-4 list-disc space-y-1 text-sm text-slate-700">
                  <li>
                    <strong>Surface Web:</strong> Publicly accessible and indexed
                    content (Google, Facebook, etc.)
                  </li>
                  <li>
                    <strong>Deep Web:</strong> Content not indexed by search
                    engines (email accounts, banking portals, subscription
                    services)
                  </li>
                  <li>
                    <strong>Dark Web:</strong> Intentionally hidden content
                    requiring specialized software
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">Common Myths vs. Reality:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong className="text-red-700">Myth:</strong> The dark web
                    is huge
                    <br />
                    <strong className="text-green-700">Reality:</strong> It's
                    less than 1% of the internet
                  </div>
                  <div>
                    <strong className="text-red-700">Myth:</strong> It's illegal
                    to access
                    <br />
                    <strong className="text-green-700">Reality:</strong> Access
                    itself is legal in most countries
                  </div>
                  <div>
                    <strong className="text-red-700">Myth:</strong> It's only for
                    criminals
                    <br />
                    <strong className="text-green-700">Reality:</strong> Has
                    legitimate privacy and security uses
                  </div>
                  <div>
                    <strong className="text-red-700">Myth:</strong> It's
                    completely anonymous
                    <br />
                    <strong className="text-green-700">Reality:</strong> User
                    behavior can compromise anonymity
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Section */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              Test your knowledge of dark web operations, Tor network architecture, cryptocurrency forensics, and threat intelligence gathering. Answer {questions.length} comprehensive questions covering advanced topics in dark web research and analysis.
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Quiz Questions:</p>
                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-slate-700">
                    This challenge contains {questions.length} questions covering topics such as:
                  </p>
                  <ul className="mt-2 ml-4 list-disc space-y-1 text-sm text-slate-700">
                    <li>Dark web vs deep web vs surface web</li>
                    <li>Tor network architecture and hidden services</li>
                    <li>Cryptocurrency forensics and blockchain analysis</li>
                    <li>Threat intelligence gathering techniques</li>
                    <li>Privacy and anonymity on the dark web</li>
                    <li>Legal and ethical considerations</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Answer all questions based on your knowledge of dark web operations, OSINT techniques, and cybersecurity best practices. Questions are spread across {Math.ceil(questions.length / 10)} pages.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-bold">Test your knowledge about dark web facts vs fiction</h3>
            <span className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="mb-6 rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
            <p className="text-sm text-purple-900">
              Answer all {questions.length} questions across {totalPages} pages.
              Navigate using the buttons at the bottom.
            </p>
          </div>

          <div className="space-y-6">
            {currentQuestions.map((q) => (
              <div key={q.id} className="rounded-lg border-2 border-slate-200 p-4">
                <h4 className="mb-4 font-semibold">{q.question}</h4>
                <div className="space-y-2">
                  {q.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition ${
                        answers[q.id] === index
                          ? "border-purple-500 bg-purple-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        checked={answers[q.id] === index}
                        onChange={() => handleAnswer(q.id, index)}
                        className="h-4 w-4"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50"
            >
              Previous Page
            </button>
            <span className="text-sm text-slate-600">
              Questions answered: {Object.keys(answers).length}/{questions.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50"
            >
              Next Page
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length || submitted}
            className="mt-6 w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitted ? "Quiz Submitted" : "Submit Quiz"}
          </button>
        </div>
      </div>
    </ChallengeLayout>
  );
}

