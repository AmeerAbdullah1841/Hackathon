"use client";

import { useState } from "react";
import { ChallengeLayout } from "../components/ChallengeLayout";

const vulnerableCode = `// Vulnerable login function (MySQL)
function authenticateUser(username, password) {
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  return database.execute(query);
}

// Vulnerable user data retrieval (PostgreSQL)
function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return database.execute(query);
}

// Vulnerable search function (MSSQL)
function searchProducts(searchTerm) {
  const query = "SELECT * FROM products WHERE name LIKE '%" + searchTerm + "%'";
  return database.execute(query);
}

// Vulnerable second-order injection (stored procedure)
function updateUserProfile(userId, bio) {
  // Bio is stored and later used in another query
  const query = "UPDATE users SET bio = '" + bio + "' WHERE id = " + userId;
  database.execute(query);
}

function displayUserProfile(userId) {
  const user = getUserData(userId);
  // Second-order injection: bio is used in another query
  const query = "SELECT * FROM posts WHERE author_bio LIKE '%" + user.bio + "%'";
  return database.execute(query);
}

// Vulnerable UNION-based injection
function getOrderHistory(userId) {
  const query = "SELECT order_id, total FROM orders WHERE user_id = " + userId;
  return database.execute(query);
}

// Vulnerable time-based blind injection
function checkProductAvailability(productId) {
  const query = "SELECT * FROM inventory WHERE product_id = " + productId;
  return database.execute(query);
}

// Vulnerable stacked queries (MSSQL)
function updateInventory(productId, quantity) {
  const query = "UPDATE inventory SET quantity = " + quantity + " WHERE product_id = " + productId;
  return database.execute(query);
}

// Example usage:
// authenticateUser("admin", "password123");
// getUserData("1");
// searchProducts("laptop");
// updateUserProfile(1, "Bio text");
// getOrderHistory("1");
// checkProductAvailability("1");
// updateInventory("1", "10");`;

export default function SQLInjectionPage() {
  const [vulnerability, setVulnerability] = useState("");
  const [solution, setSolution] = useState("");
  const [showTutorial, setShowTutorial] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!vulnerability.trim() || !solution.trim()) {
      alert("Please provide your analysis before submitting.");
      return;
    }
    alert("Analysis submitted! Excellent work on the multi-vector SQL injection analysis.");
    setSubmitted(true);
  };

  return (
    <ChallengeLayout
      challengeTitle="SQL Injection: Multi-Vector Exploitation Analysis"
      difficulty="HARD"
      points={400}
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
                SQL Injection Tutorial
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
                  Advanced SQL Injection Techniques:
                </h4>
                <ul className="ml-4 list-disc space-y-2 text-sm text-slate-700">
                  <li>
                    <strong>Union-Based Injection:</strong> Use UNION SELECT to extract data from other tables
                    <br />
                    <code className="text-xs">' UNION SELECT username, password FROM admin_users--</code>
                  </li>
                  <li>
                    <strong>Blind SQL Injection:</strong> Time-based or boolean-based attacks when no error messages
                    <br />
                    <code className="text-xs">'; WAITFOR DELAY '00:00:05'--</code>
                  </li>
                  <li>
                    <strong>Second-Order Injection:</strong> Stored input later used in vulnerable queries
                  </li>
                  <li>
                    <strong>Stacked Queries:</strong> Execute multiple statements (MSSQL, PostgreSQL)
                    <br />
                    <code className="text-xs">'; DROP TABLE users;--</code>
                  </li>
                  <li>
                    <strong>Out-of-Band Injection:</strong> Use DNS or HTTP requests to exfiltrate data
                  </li>
                  <li>
                    <strong>Database-Specific Techniques:</strong> MySQL, PostgreSQL, MSSQL, Oracle each have unique syntax
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-red-700">
                  Advanced Attack Vectors:
                </h4>
                <div className="rounded-lg bg-slate-900 p-4 text-sm text-green-400 space-y-2">
                  <div>
                    <p className="text-yellow-400 mb-1">Boolean-Based Blind:</p>
                    <code>admin' AND (SELECT SUBSTRING(@@version,1,1))='5'--</code>
                  </div>
                  <div>
                    <p className="text-yellow-400 mb-1">Time-Based Blind:</p>
                    <code>'; IF (1=1) WAITFOR DELAY '00:00:05'--</code>
                  </div>
                  <div>
                    <p className="text-yellow-400 mb-1">Union-Based:</p>
                    <code>' UNION SELECT NULL, username, password FROM users--</code>
                  </div>
                  <div>
                    <p className="text-yellow-400 mb-1">Second-Order:</p>
                    <code>Bio: '; UPDATE users SET role='admin' WHERE id=1--</code>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-green-700">
                  Enterprise-Grade Secure Solutions:
                </h4>
                <ul className="ml-4 list-disc space-y-2 text-sm text-slate-700">
                  <li>
                    <strong>Parameterized Queries (Prepared Statements):</strong> Always use placeholders for all user input
                  </li>
                  <li>
                    <strong>Input Validation & Whitelisting:</strong> Validate data types, length, format. Use allowlists, not blocklists
                  </li>
                  <li>
                    <strong>Least Privilege Principle:</strong> Database users should have minimal required permissions. Separate read/write accounts
                  </li>
                  <li>
                    <strong>Error Handling:</strong> Generic error messages for users, detailed logs for admins
                  </li>
                  <li>
                    <strong>ORM/Query Builders:</strong> Use well-maintained libraries (Sequelize, TypeORM, Prisma) that handle SQL safely
                  </li>
                  <li>
                    <strong>WAF (Web Application Firewall):</strong> Deploy WAF rules to detect and block SQL injection patterns
                  </li>
                  <li>
                    <strong>Database Security:</strong> Disable stacked queries, limit database functions, use stored procedures carefully
                  </li>
                  <li>
                    <strong>Code Review & Testing:</strong> Regular security audits, static analysis, penetration testing
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-blue-300 bg-white p-4">
                <h4 className="mb-2 font-semibold">Secure Code Examples:</h4>
                <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-green-400">
                  <code>{`// Parameterized queries (Node.js with mysql2)
async function authenticateUser(username, password) {
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  const [rows] = await db.execute(query, [username, password]);
  return rows[0];
}

// Using ORM (Sequelize)
async function getUserData(userId) {
  return await User.findByPk(userId, {
    attributes: ['id', 'username', 'email']
  });
}

// Input validation with Joi/Zod
const schema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  searchTerm: Joi.string().max(100).pattern(/^[a-zA-Z0-9\\s]+$/).required()
});

// Stored procedures (PostgreSQL)
CREATE FUNCTION get_user_data(p_user_id INTEGER)
RETURNS TABLE(id INTEGER, username TEXT) AS $$
BEGIN
  RETURN QUERY SELECT u.id, u.username FROM users u WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;`}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Challenge Section */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold">Challenge Description</h3>
            <p className="text-slate-700">
              Analyze complex SQL injection vulnerabilities across MySQL, PostgreSQL, and MSSQL. 
              Identify union-based, blind, second-order, and stacked query injection vectors. 
              Craft exploit payloads and implement comprehensive secure coding solutions.
            </p>
          </div>

          {/* Challenge Materials */}
          <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-semibold text-purple-900">Challenge Materials</h4>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-purple-800">Vulnerable Application Code:</p>
                <div className="rounded-lg bg-white p-4">
                  <pre className="overflow-x-auto text-xs font-mono">
                    <code>{vulnerableCode}</code>
                  </pre>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Review each function for SQL injection vulnerabilities. Identify the database system (MySQL, PostgreSQL, MSSQL), the injection type (union-based, blind, time-based, second-order, stacked queries), and craft appropriate exploit payloads. Provide secure remediation code for each vulnerability.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="mb-3 font-semibold">Vulnerable Code:</h4>
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
              <pre className="overflow-x-auto text-sm">
                <code>{vulnerableCode}</code>
              </pre>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block font-semibold">
                Vulnerability Analysis:
              </label>
              <p className="mb-2 text-sm text-slate-600">
                Provide comprehensive analysis of all SQL injection vulnerabilities. Identify each vulnerable 
                function, the injection type (union-based, blind, second-order, stacked queries), database-specific 
                syntax requirements, and craft example exploit payloads for each vulnerability.
              </p>
              <textarea
                value={vulnerability}
                onChange={(e) => setVulnerability(e.target.value)}
                placeholder="Analyze all vulnerabilities, injection types, and provide exploit payloads..."
                className="min-h-[200px] w-full rounded-lg border border-slate-300 p-3 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-slate-500">
                {vulnerability.length} characters
              </p>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Secure Solution Implementation:
              </label>
              <p className="mb-2 text-sm text-slate-600">
                Provide enterprise-grade secure coding solutions. Include parameterized queries, input validation, 
                ORM implementations, database security configurations, and defense-in-depth strategies. Provide 
                complete code examples for each vulnerable function.
              </p>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Provide comprehensive secure coding solutions with complete code examples..."
                className="min-h-[200px] w-full rounded-lg border border-slate-300 p-3 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-slate-500">
                {solution.length} characters
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !vulnerability.trim() ||
                !solution.trim() ||
                submitted
              }
              className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitted ? "Analysis Submitted" : "Submit Analysis"}
            </button>
          </div>
        </div>
      </div>
    </ChallengeLayout>
  );
}

