"use client";

import { useState } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

const networkLogs = `2023-10-15 08:12:34 192.168.1.5 -> 192.168.1.1 TCP:22 ALLOW SSH connection established
2023-10-15 08:13:45 192.168.1.5 -> 192.168.1.1 TCP:22 ALLOW SSH connection maintained
2023-10-15 08:15:22 192.168.1.100 -> 192.168.1.1 TCP:80 ALLOW HTTP request to admin panel
2023-10-15 08:16:03 192.168.1.100 -> 192.168.1.1 TCP:80 ALLOW HTTP response from admin panel
2023-10-15 08:17:45 203.0.113.45 -> 192.168.1.1 TCP:22 BLOCK Failed SSH connection attempt
2023-10-15 08:17:50 203.0.113.45 -> 192.168.1.1 TCP:22 BLOCK Failed SSH connection attempt
2023-10-15 08:17:55 203.0.113.45 -> 192.168.1.1 TCP:22 BLOCK Failed SSH connection attempt
2023-10-15 08:18:00 203.0.113.45 -> 192.168.1.1 TCP:22 BLOCK Failed SSH connection attempt
2023-10-15 08:18:05 203.0.113.45 -> 192.168.1.1 TCP:22 BLOCK Failed SSH connection attempt
2023-10-15 08:20:12 192.168.1.200 -> 192.168.1.1 TCP:22 BLOCK Failed SSH login - user: admin
2023-10-15 08:20:19 192.168.1.200 -> 192.168.1.1 TCP:22 BLOCK Failed SSH login - user: admin
2023-10-15 08:20:25 192.168.1.200 -> 192.168.1.1 TCP:22 BLOCK Failed SSH login - user: admin
2023-10-15 08:25:30 198.51.100.42 -> 192.168.1.1 TCP:443 ALLOW HTTPS connection
2023-10-15 08:26:15 198.51.100.42 -> 192.168.1.1 TCP:443 ALLOW HTTPS connection
2023-10-15 08:30:00 192.168.1.50 -> 192.168.1.1 TCP:3306 ALLOW MySQL connection
2023-10-15 08:35:22 203.0.113.45 -> 192.168.1.1 TCP:80 BLOCK HTTP request with SQL injection attempt
2023-10-15 08:35:45 203.0.113.45 -> 192.168.1.1 TCP:80 BLOCK HTTP request with XSS payload
2023-10-15 08:40:10 192.168.1.75 -> 192.168.1.1 TCP:21 ALLOW FTP connection
2023-10-15 08:45:33 10.0.0.15 -> 192.168.1.1 TCP:3389 BLOCK RDP connection attempt from external IP
2023-10-15 08:50:00 192.168.1.100 -> 192.168.1.1 TCP:8080 ALLOW HTTP request to internal service
2023-10-15 09:00:15 203.0.113.45 -> 192.168.1.1 TCP:22 BLOCK Failed SSH connection attempt
2023-10-15 09:00:20 203.0.113.45 -> 192.168.1.1 TCP:22 BLOCK Failed SSH connection attempt
2023-10-15 09:00:25 203.0.113.45 -> 192.168.1.1 TCP:22 BLOCK Failed SSH connection attempt
2023-10-15 09:05:40 192.168.1.200 -> 192.168.1.1 TCP:22 BLOCK Failed SSH login - user: root
2023-10-15 09:10:55 198.51.100.42 -> 192.168.1.1 TCP:443 ALLOW HTTPS connection
2023-10-15 09:15:20 192.168.1.1 -> 8.8.8.8 UDP:53 ALLOW DNS query
2023-10-15 09:20:30 203.0.113.45 -> 192.168.1.1 TCP:80 BLOCK Directory traversal attempt: ../../../etc/passwd
2023-10-15 09:25:45 192.168.1.200 -> 192.168.1.1 TCP:22 BLOCK Failed SSH login - user: administrator`;

export default function NetworkTrafficPage() {
  const [threats, setThreats] = useState("");
  const [showTutorial, setShowTutorial] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!threats.trim()) {
      alert("Please provide your threat intelligence report before submitting.");
      return;
    }
    alert("Threat intelligence report submitted! Excellent analysis of the network traffic.");
    setSubmitted(true);
  };

  return (
    <ChallengeLayout
      challengeTitle="Network Traffic Analysis: Advanced Threat Hunting"
      difficulty="HARD"
      points={380}
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
                Network Traffic Analysis Tutorial
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
                <h4 className="mb-3 font-semibold text-green-700">
                  What to Look For:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Multiple failed login attempts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Port scanning activities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Suspicious IP addresses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>SQL injection attempts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Unusual file access patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Connections from known bad IPs</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-blue-700">
                  Log Entry Format:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Timestamp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Source IP → Destination IP</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Protocol and Port</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Action (ALLOW/BLOCK)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Additional details</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-300 bg-white p-4">
              <h4 className="mb-3 font-semibold">Advanced Attack Patterns & APT Techniques:</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-red-700">Advanced Persistent Threats (APTs):</strong>
                  <p className="text-slate-700">
                    Long-term, sophisticated attacks with multiple stages: initial compromise, 
                    lateral movement, data exfiltration. Look for beaconing patterns, low-and-slow 
                    communication, and encrypted C2 channels.
                  </p>
                </div>
                <div>
                  <strong className="text-red-700">C2 (Command & Control) Channels:</strong>
                  <p className="text-slate-700">
                    Encrypted HTTPS tunnels, DNS tunneling, ICMP tunnels, or legitimate services 
                    (Dropbox, GitHub) used for C2. Look for regular intervals, unusual data volumes, 
                    or non-standard protocols.
                  </p>
                </div>
                <div>
                  <strong className="text-red-700">Lateral Movement:</strong>
                  <p className="text-slate-700">
                    SMB, RDP, SSH connections between internal hosts. Pass-the-hash, Kerberos ticket 
                    reuse, or credential dumping patterns. Look for unusual internal-to-internal traffic.
                  </p>
                </div>
                <div>
                  <strong className="text-red-700">Data Exfiltration:</strong>
                  <p className="text-slate-700">
                    Large outbound transfers, unusual protocols (DNS, ICMP), or staged transfers 
                    during off-hours. Look for volume anomalies and protocol misuse.
                  </p>
                </div>
                <div>
                  <strong className="text-red-700">Covert Channels:</strong>
                  <p className="text-slate-700">
                    Timing-based channels, steganography in images, or protocol tunneling. Analyze 
                    timing patterns, packet sizes, and protocol deviations.
                  </p>
                </div>
                <div>
                  <strong className="text-red-700">Multi-Stage Attacks:</strong>
                  <p className="text-slate-700">
                    Correlate reconnaissance, exploitation, privilege escalation, and persistence 
                    activities across time. Build attack timelines and identify kill chain stages.
                  </p>
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
              Analyze complex network traffic containing advanced persistent threats, encrypted C2 channels, 
              DNS tunneling, lateral movement patterns, and multi-stage attack sequences. Correlate events 
              across multiple protocols and provide comprehensive threat intelligence.
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Network Traffic Logs:</p>
                <div className="rounded-lg bg-white p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-xs">{networkLogs}</pre>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Analyze the network logs for attack patterns, failed login attempts, port scanning, SQL injection attempts, XSS payloads, directory traversal, and other suspicious activities. Identify threat actors, attack vectors, and provide comprehensive threat intelligence.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-3 font-semibold">Network Logs:</h4>
            <div className="max-h-96 overflow-y-auto rounded bg-slate-900 p-4 font-mono text-xs text-green-400">
              <pre className="whitespace-pre-wrap">{networkLogs}</pre>
            </div>
          </div>

          <div className="mb-6 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
            <h4 className="mb-2 font-semibold">Analysis Tips:</h4>
            <ul className="ml-4 list-disc space-y-1 text-sm text-slate-700">
              <li>Look for patterns in IP addresses and timestamps</li>
              <li>Pay attention to BLOCKED vs ALLOWED connections</li>
              <li>Identify repeated failed attempts</li>
              <li>Check for suspicious URLs or file access attempts</li>
              <li>Note unusual port access patterns</li>
            </ul>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Comprehensive Threat Intelligence Report:
            </label>
            <p className="mb-2 text-sm text-slate-600">
              Provide a detailed threat intelligence report. Identify attack chains, correlate events 
              across protocols, classify attack types (APT, C2, lateral movement, exfiltration), 
              provide IOC (Indicators of Compromise), and recommend detection rules and mitigation strategies.
            </p>
            <textarea
              value={threats}
              onChange={(e) => setThreats(e.target.value)}
              placeholder="Provide comprehensive threat intelligence analysis including attack chains, IOCs, and mitigation strategies..."
              className="min-h-[250px] w-full rounded-lg border border-slate-300 p-3"
              />
              <p className="mt-1 text-xs text-slate-500">
                {threats.length} characters
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!threats.trim() || submitted}
            className="mt-6 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitted ? "Analysis Submitted" : "Submit Analysis"}
          </button>
        </div>
      </div>
    </ChallengeLayout>
  );
}

