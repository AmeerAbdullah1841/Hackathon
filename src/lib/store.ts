import crypto from "node:crypto";

import { sql, getDb } from "./db.server";

export type Task = {
  id: string;
  title: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  flag: string;
  points: number;
  resources: string[];
};

export type Team = {
  id: string;
  name: string;
  username: string;
  password: string;
  createdAt: string;
};

export type Assignment = {
  id: string;
  teamId: string;
  taskId: string;
  status: "assigned" | "in-progress" | "completed";
  lastUpdated: string;
};

export type Submission = {
  id: string;
  assignmentId: string;
  teamId: string;
  plan: string;
  findings: string;
  flag: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "approved" | "rejected";
  pointsAwarded: number;
  adminNotes: string;
  reviewedAt: string | null;
};

export type AssignmentWithTask = Assignment & {
  task?: Task;
  submission?: Submission;
};

type AdminSession = {
  token: string;
  createdAt: string;
};

const cybersecuritySeedTasks: Task[] = [
  {
    id: "challenge-malware-beacon-chain",
    title: "Malware Analysis: Encrypted Beacon Chain",
    category: "Malware",
    difficulty: "advanced",
    description:
      "A captured malware beacon contains three sequential payloads, each AES-encrypted with a key derived from the previous payload's SHA1 hash. Analysts recovered the initial key: R7s!probe!2024. Decrypt the chain end-to-end and submit the final plaintext command. Flag format: flag{command_here}",
    flag: "flag{command_here}",
    points: 270,
    resources: ["/challenges/malware-beacon-chain"],
  },
  {
    id: "challenge-dfir-log-tampering",
    title: "DFIR: Multi-Layer Log Tampering Detection",
    category: "DFIR",
    difficulty: "advanced",
    description:
      "A threat actor modified Linux audit logs to hide a privilege escalation. A compressed .gz log from disk slack space preserves partial records. Decompress, repair the timeline, correlate syscall sequences, and recover the user ID leveraged in the escalation. Flag format: flag{uid1234}",
    flag: "flag{uid1234}",
    points: 260,
    resources: ["/challenges/dfir-log-tampering"],
  },
  {
    id: "challenge-email-polyglot-lure",
    title: "Email Forensics: Multipart Polyglot Lure",
    category: "Email",
    difficulty: "advanced",
    description:
      "A phishing email embeds its payload inside a multipart/alternative polyglot that doubles as valid HTML and Base64. Extract the Base64 section, decode it, and identify the C2 domain hidden in a <span style=\"font-size:0px\"> tag. Flag format: flag{c2.example.com}",
    flag: "flag{c2.example.com}",
    points: 240,
    resources: ["/challenges/email-polyglot-lure"],
  },
  {
    id: "challenge-reverse-engineering-vm",
    title: "Reverse Engineering: Obfuscated Loader (VM-Based)",
    category: "Reverse Engineering",
    difficulty: "advanced",
    description:
      "A Windows loader hides its unpacking routine behind a custom VM. Reverse the bytecode handlers, emulate the instruction set, recover the decrypted payload, and extract the embedded API token the malware uses for C2 auth. Flag format: flag{token_here}",
    flag: "flag{token_here}",
    points: 320,
    resources: ["/challenges/reverse-engineering-vm"],
  },
  {
    id: "challenge-network-timing-channel",
    title: "Network Forensics: Covert Timing Channel",
    category: "Network",
    difficulty: "advanced",
    description:
      "PCAP files show unusual beacon delays to a single IP. Interpret the delta timing (short=0, long=1), rebuild the bitstream, decode the reconstructed payload, and reveal the hidden operator message. Flag format: flag{hidden_data}",
    flag: "flag{hidden_data}",
    points: 250,
    resources: ["/challenges/network-timing-channel"],
  },
  {
    id: "challenge-firmware-nor-dump",
    title: "Firmware Security: NOR Dump Deobfuscation",
    category: "Firmware",
    difficulty: "advanced",
    description:
      "A router NOR flash dump contains bootloader environment variables XORed with a rolling 16-bit LFSR. Reverse the polynomial, rebuild the keystream, and recover the plaintext boot arguments to obtain the rootfs_pass value. Flag format: flag{password_here}",
    flag: "flag{password_here}",
    points: 300,
    resources: ["/challenges/firmware-nor-dump"],
  },
  {
    id: "challenge-web-deserialization-rce",
    title: "Web Exploitation: Chained Deserialization RCE",
    category: "Web",
    difficulty: "advanced",
    description:
      "An express-session custom serializer plus an SSTI logging bug can be chained for code execution. Craft the gadget payload, trigger the log rendering, achieve RCE, and dump ADMIN_SECRET from the backend environment. Flag format: flag{secret_here}",
    flag: "flag{secret_here}",
    points: 280,
    resources: ["/challenges/web-deserialization-rce"],
  },
  {
    id: "challenge-osint-phishing-infra",
    title: "OSINT / Threat Intel: Phishing Infra Pivot",
    category: "OSINT",
    difficulty: "advanced",
    description:
      "A phishing URL rotates across geo-failover servers. Use DNS history, certificate transparency, and CDN misconfiguration pivots to attribute the infrastructure and identify the attacker's hosting provider account name. Flag format: flag{account_name}",
    flag: "flag{account_name}",
    points: 230,
    resources: ["/challenges/osint-phishing-infra"],
  },
  {
    id: "challenge-crypto-ecdsa-nonce",
    title: "Crypto: ECDSA Partial Nonce Leakage",
    category: "Crypto",
    difficulty: "advanced",
    description:
      "An attacker reused ECDSA nonces with 24 leaked LSBs. Four signatures and message hashes are provided. Use lattice reduction to recover the private key and present it in hexadecimal. Flag format: flag{deadbeefcafebabe}",
    flag: "flag{deadbeefcafebabe}",
    points: 350,
    resources: ["/challenges/crypto-ecdsa-nonce"],
  },
  {
    id: "challenge-cloud-iam-escalation",
    title: "Cloud Security: IAM Shadow Role Escalation",
    category: "Cloud",
    difficulty: "advanced",
    description:
      "A compromised AWS identity can only update IAM role tags. Exploit the misconfigured shadow role trust policy to AssumeRole via crafted tags, escalate privileges, and extract COMPROMISED_KEY from the role's CloudWatch logs. Flag format: flag{key_here}",
    flag: "flag{key_here}",
    points: 260,
    resources: ["/challenges/cloud-iam-escalation"],
  },
  {
    id: "challenge-phishing-email-detection",
    title: "Phishing Email Detection: Advanced Threat Analysis",
    category: "Email Security",
    difficulty: "advanced",
    description:
      "Analyze 15 sophisticated phishing emails with advanced evasion techniques including homograph attacks, email header spoofing, and multi-stage payloads. Identify all phishing attempts, explain advanced red flags, and propose enterprise-level prevention strategies. Access the interactive challenge at /challenges/spot-the-phish",
    flag: "flag{phishing_analysis_complete}",
    points: 350,
    resources: ["/challenges/spot-the-phish"],
  },
  {
    id: "challenge-sql-injection",
    title: "SQL Injection: Multi-Vector Exploitation Analysis",
    category: "Web Security",
    difficulty: "advanced",
    description:
      "Analyze complex SQL injection vulnerabilities across multiple database systems (MySQL, PostgreSQL, MSSQL) with advanced techniques including blind SQLi, time-based attacks, and second-order injection. Identify all vulnerabilities, craft exploit payloads, and implement comprehensive secure coding solutions. Access the interactive challenge at /challenges/sql-injection",
    flag: "flag{sqli_analysis_complete}",
    points: 400,
    resources: ["/challenges/sql-injection"],
  },
  {
    id: "challenge-network-traffic",
    title: "Network Traffic Analysis: Advanced Threat Hunting",
    category: "Network Security",
    difficulty: "advanced",
    description:
      "Analyze complex network traffic logs containing advanced persistent threats, encrypted C2 channels, DNS tunneling, and lateral movement patterns. Identify attack chains, correlate events across multiple protocols, and provide comprehensive threat intelligence. Access the interactive challenge at /challenges/network-traffic",
    flag: "flag{network_analysis_complete}",
    points: 380,
    resources: ["/challenges/network-traffic"],
  },
  {
    id: "challenge-terms-trap",
    title: "Terms & Conditions: Legal Security Audit",
    category: "Privacy & Compliance",
    difficulty: "intermediate",
    description:
      "Conduct a comprehensive security audit of complex terms and conditions documents. Identify hidden data collection clauses, privacy violations, and compliance issues across 50+ sections. Provide detailed legal analysis and remediation recommendations. Access the interactive challenge at /challenges/terms-trap",
    flag: "flag{legal_audit_complete}",
    points: 280,
    resources: ["/challenges/terms-trap"],
  },
  {
    id: "challenge-cipher-analysis",
    title: "Cryptographic Analysis: Multi-Algorithm Cipher Breaking",
    category: "Cryptography",
    difficulty: "advanced",
    description:
      "Decode 25 encrypted messages using various cipher techniques including Caesar, Vigenère, Playfair, and custom substitution ciphers. Some messages use multiple encryption layers or steganographic techniques. Provide detailed cryptanalysis methodology. Access the interactive challenge at /challenges/cipher-analysis",
    flag: "flag{crypto_analysis_complete}",
    points: 420,
    resources: ["/challenges/cipher-analysis"],
  },
  {
    id: "challenge-dark-web-myths",
    title: "Dark Web Intelligence: Advanced OSINT Quiz",
    category: "OSINT",
    difficulty: "intermediate",
    description:
      "Test your knowledge of dark web operations, Tor network architecture, cryptocurrency forensics, and threat intelligence gathering. Answer 40 comprehensive questions covering advanced topics in dark web research and analysis. Access the interactive challenge at /challenges/dark-web-myths",
    flag: "flag{darkweb_quiz_complete}",
    points: 300,
    resources: ["/challenges/dark-web-myths"],
  },
  {
    id: "challenge-social-media-detector",
    title: "Social Media OSINT: Advanced Risk Assessment",
    category: "OSINT",
    difficulty: "intermediate",
    description:
      "Analyze 20 complex social media posts and profiles for security risks including OSINT gathering techniques, social engineering vectors, and privacy violations. Assess risk levels and provide comprehensive threat modeling for enterprise security teams. Access the interactive challenge at /challenges/social-media-detector",
    flag: "flag{social_osint_complete}",
    points: 320,
    resources: ["/challenges/social-media-detector"],
  },
  {
    id: "challenge-cyber-mad-libs",
    title: "Security Awareness: Advanced Scenario Building",
    category: "Security Awareness",
    difficulty: "beginner",
    description:
      "Create comprehensive cybersecurity scenarios through interactive storytelling. Build realistic threat scenarios covering advanced attack vectors, incident response procedures, and security best practices. Access the interactive challenge at /challenges/cyber-mad-libs",
    flag: "flag{scenario_building_complete}",
    points: 200,
    resources: ["/challenges/cyber-mad-libs"],
  },
  {
    id: "challenge-bug-hunt",
    title: "Security Code Review: Enterprise Bug Hunting",
    category: "Secure Coding",
    difficulty: "advanced",
    description:
      "Conduct a comprehensive security code review of enterprise-grade applications. Identify critical vulnerabilities including authentication bypasses, authorization flaws, cryptographic weaknesses, and business logic errors. Provide detailed remediation strategies. Access the interactive challenge at /challenges/bug-hunt",
    flag: "flag{code_review_complete}",
    points: 450,
    resources: ["/challenges/bug-hunt"],
  },
];

// Lazy database initialization
let seeded = false;
let seedingPromise: Promise<void> | null = null;

const seedTasksIfNeeded = async () => {
  // If seeding is in progress, wait for it
  if (seedingPromise) {
    return seedingPromise;
  }

  // Start seeding process
  seedingPromise = (async () => {
    const db = await getDb();
    
    // Always try to insert/update all tasks - ON CONFLICT will update existing ones
    // This ensures new challenges are added and existing ones are updated
    for (const task of cybersecuritySeedTasks) {
      await db`
        INSERT INTO tasks (id, title, category, difficulty, description, flag, points, resources)
        VALUES (${task.id}, ${task.title}, ${task.category}, ${task.difficulty}, ${task.description}, ${task.flag}, ${task.points}, ${JSON.stringify(task.resources)})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          difficulty = EXCLUDED.difficulty,
          description = EXCLUDED.description,
          flag = EXCLUDED.flag,
          points = EXCLUDED.points,
          resources = EXCLUDED.resources
      `;
    }
    
    seeded = true;
  })();

  return seedingPromise;
};

// Database and tasks are now seeded lazily on first access

export const findAssignmentById = async (
  assignmentId: string,
): Promise<AssignmentWithTask | null> => {
  const db = await getDb();
  const result = await db`
    SELECT
      a.id as "assignmentId",
      a."teamId" as "assignmentTeamId",
      a."taskId" as "assignmentTaskId",
      a.status as "assignmentStatus",
      a."lastUpdated" as "assignmentLastUpdated",
      t.id as "taskId",
      t.title as "taskTitle",
      t.category as "taskCategory",
      t.difficulty as "taskDifficulty",
      t.description as "taskDescription",
      t.flag as "taskFlag",
      t.points as "taskPoints",
      t.resources as "taskResources",
      s.id as "submissionId",
      s."assignmentId" as "submissionAssignmentId",
      s."teamId" as "submissionTeamId",
      s.plan as "submissionPlan",
      s.findings as "submissionFindings",
      s.flag as "submissionFlag",
      s."createdAt" as "submissionCreatedAt",
      s."updatedAt" as "submissionUpdatedAt",
      s.status as "submissionStatus",
      s."pointsAwarded" as "submissionPointsAwarded",
      s."adminNotes" as "submissionAdminNotes",
      s."reviewedAt" as "submissionReviewedAt"
    FROM assignments a
    LEFT JOIN tasks t ON t.id = a."taskId"
    LEFT JOIN submissions s ON s."assignmentId" = a.id
    WHERE a.id = ${assignmentId}
  `;

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.assignmentId,
    teamId: row.assignmentTeamId,
    taskId: row.assignmentTaskId,
    status: row.assignmentStatus,
    lastUpdated: row.assignmentLastUpdated,
    task: row.taskId
      ? {
          id: row.taskId,
          title: row.taskTitle,
          category: row.taskCategory,
          difficulty: row.taskDifficulty,
          description: row.taskDescription,
          flag: row.taskFlag,
          points: Number(row.taskPoints),
          resources: deserializeResources(row.taskResources),
        }
      : undefined,
    submission: mapSubmissionFromJoinedRow(row),
  };
};

const normalizeResourceBlob = (raw: unknown) => {
  if (typeof raw === "string") {
    return raw;
  }
  if (raw instanceof Uint8Array) {
    return Buffer.from(raw).toString("utf-8");
  }
  return "[]";
};

const deserializeResources = (raw: unknown): string[] => {
  const normalized = normalizeResourceBlob(raw);
  try {
    const parsed = JSON.parse(normalized);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const mapTaskRow = (row: any): Task => ({
  id: row.id,
  title: row.title,
  category: row.category,
  difficulty: row.difficulty,
  description: row.description,
  flag: row.flag,
  points: Number(row.points),
  resources: deserializeResources(row.resources),
});

const mapTeamRow = (row: any): Team => ({
  id: row.id,
  name: row.name,
  username: row.username,
  password: row.password,
  createdAt: row.createdAt,
});

const mapSubmissionRow = (row: any): Submission => ({
  id: row.id,
  assignmentId: row.assignmentId,
  teamId: row.teamId,
  plan: row.plan,
  findings: row.findings,
  flag: row.flag,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  status: (row.status as "pending" | "approved" | "rejected") || "pending",
  pointsAwarded: row.pointsAwarded ?? 0,
  adminNotes: row.adminNotes ?? "",
  reviewedAt: row.reviewedAt ?? null,
});

const mapSubmissionFromJoinedRow = (row: any): Submission | undefined => {
  if (!row?.submissionId) {
    return undefined;
  }

  return {
    id: row.submissionId,
    assignmentId: row.submissionAssignmentId,
    teamId: row.submissionTeamId,
    plan: row.submissionPlan,
    findings: row.submissionFindings,
    flag: row.submissionFlag,
    createdAt: row.submissionCreatedAt,
    updatedAt: row.submissionUpdatedAt,
    status: (row.submissionStatus as "pending" | "approved" | "rejected") || "pending",
    pointsAwarded: row.submissionPointsAwarded ?? 0,
    adminNotes: row.submissionAdminNotes ?? "",
    reviewedAt: row.submissionReviewedAt ?? null,
  };
};

const makeCredentials = (teamName: string) => {
  const base = teamName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8);
  const suffix = Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, "0");
  const username = `${base || "team"}${suffix}`;

  const password = crypto.randomBytes(4).toString("hex");
  return { username, password };
};

export const createTeam = async (name: string) => {
  const { username, password } = makeCredentials(name);

  const team: Team = {
    id: crypto.randomUUID(),
    name,
    username,
    password,
    createdAt: new Date().toISOString(),
  };

  const db = await getDb();
  await db`
    INSERT INTO teams (id, name, username, password, "createdAt")
    VALUES (${team.id}, ${team.name}, ${team.username}, ${team.password}, ${team.createdAt})
  `;

  return team;
};

export const resetTeamPassword = async (teamId: string): Promise<Team> => {
  const db = await getDb();
  const result = await db`
    SELECT * FROM teams WHERE id = ${teamId}
  `;
  
  const team = result.rows[0] as Team | undefined;

  if (!team) {
    throw new Error("Team not found");
  }

  // Only generate a new password, keep the username
  const password = crypto.randomBytes(4).toString("hex");

  await db`
    UPDATE teams
    SET password = ${password}
    WHERE id = ${teamId}
  `;

  return {
    ...team,
    password,
  };
};

export const deleteTeamSubmissions = async (teamId: string): Promise<void> => {
  const db = await getDb();
  
  // Check if team exists
  const teamResult = await db`
    SELECT id FROM teams WHERE id = ${teamId}
  `;
  
  if (teamResult.rows.length === 0) {
    throw new Error("Team not found");
  }

  // Delete all submissions for this team
  await db`
    DELETE FROM submissions WHERE "teamId" = ${teamId}
  `;
};

export const deleteTeam = async (teamId: string): Promise<void> => {
  const db = await getDb();
  
  // Check if team exists
  const teamResult = await db`
    SELECT id FROM teams WHERE id = ${teamId}
  `;
  
  if (teamResult.rows.length === 0) {
    throw new Error("Team not found");
  }

  // Delete the team (cascade deletes will handle assignments and submissions)
  await db`
    DELETE FROM teams WHERE id = ${teamId}
  `;
};

export type HackathonStatus = {
  isActive: boolean;
  startTime: string | null;
  endTime: string | null;
  updatedAt: string;
};

export const getHackathonStatus = async (): Promise<HackathonStatus> => {
  const db = await getDb();
  const result = await db`
    SELECT * FROM hackathon_status WHERE id = 1
  `;
  
  const status = result.rows[0] as any;
  
  if (!status) {
    // Initialize if not exists
    const now = new Date().toISOString();
    await db`
      INSERT INTO hackathon_status (id, "isActive", "startTime", "endTime", "createdAt", "updatedAt")
      VALUES (1, 0, NULL, NULL, ${now}, ${now})
    `;
    
    return {
      isActive: false,
      startTime: null,
      endTime: null,
      updatedAt: now,
    };
  }

  // Check if hackathon should auto-end
  if (status.isActive && status.endTime) {
    const now = new Date();
    const endTime = new Date(status.endTime);
    if (now >= endTime) {
      // Auto-end hackathon
      const updatedAt = new Date().toISOString();
      await db`
        UPDATE hackathon_status
        SET "isActive" = 0, "updatedAt" = ${updatedAt}
        WHERE id = 1
      `;
      
      return {
        isActive: false,
        startTime: status.startTime,
        endTime: status.endTime,
        updatedAt,
      };
    }
  }

  return {
    isActive: Boolean(status.isActive),
    startTime: status.startTime,
    endTime: status.endTime,
    updatedAt: status.updatedAt,
  };
};

export const getSelectedHackathonTasks = async (): Promise<string[]> => {
  const db = await getDb();
  const result = await db`
    SELECT "taskId" FROM hackathon_tasks
  `;
  
  return result.rows.map((row: any) => row.taskId);
};

export const setSelectedHackathonTasks = async (taskIds: string[]): Promise<void> => {
  const db = await getDb();
  
  // Clear existing selections
  await db`
    DELETE FROM hackathon_tasks
  `;
  
  // Insert new selections
  if (taskIds.length > 0) {
    const now = new Date().toISOString();
    for (const taskId of taskIds) {
      await db`
        INSERT INTO hackathon_tasks ("taskId", "createdAt")
        VALUES (${taskId}, ${now})
        ON CONFLICT ("taskId") DO NOTHING
      `;
    }
  }
};

export const startHackathon = async (): Promise<HackathonStatus> => {
  const db = await getDb();
  const now = new Date();
  const startTime = now.toISOString();
  // Set end time to 24 hours from now
  const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const updatedAt = now.toISOString();

  // Get selected hackathon tasks
  const selectedTaskIds = await getSelectedHackathonTasks();
  
  // Get all teams
  const teams = await listTeams();
  
  // Assign selected tasks to all teams
  if (selectedTaskIds.length > 0 && teams.length > 0) {
    for (const team of teams) {
      for (const taskId of selectedTaskIds) {
        try {
          await assignTask(team.id, taskId);
        } catch (error) {
          // Ignore errors for already assigned tasks
          console.warn(`Task ${taskId} already assigned to team ${team.id}`);
        }
      }
    }
  }

  await db`
    UPDATE hackathon_status
    SET "isActive" = 1, "startTime" = ${startTime}, "endTime" = ${endTime}, "updatedAt" = ${updatedAt}
    WHERE id = 1
  `;

  return {
    isActive: true,
    startTime,
    endTime,
    updatedAt,
  };
};

export const stopHackathon = async (): Promise<HackathonStatus> => {
  const db = await getDb();
  const updatedAt = new Date().toISOString();

  await db`
    UPDATE hackathon_status
    SET "isActive" = 0, "updatedAt" = ${updatedAt}
    WHERE id = 1
  `;

  const statusResult = await db`
    SELECT * FROM hackathon_status WHERE id = 1
  `;
  const status = statusResult.rows[0] as any;

  return {
    isActive: false,
    startTime: status.startTime,
    endTime: status.endTime,
    updatedAt,
  };
};

export const setHackathonTimer = async (
  startTime: string,
  endTime: string,
  isActive: boolean,
): Promise<HackathonStatus> => {
  const db = await getDb();
  const updatedAt = new Date().toISOString();

  await db`
    UPDATE hackathon_status
    SET "startTime" = ${startTime}, "endTime" = ${endTime}, "isActive" = ${isActive ? 1 : 0}, "updatedAt" = ${updatedAt}
    WHERE id = 1
  `;

  return {
    isActive,
    startTime,
    endTime,
    updatedAt,
  };
};

export const createTask = async (task: Omit<Task, "id">) => {
  const newTask: Task = { ...task, id: crypto.randomUUID() };

  const db = await getDb();
  await db`
    INSERT INTO tasks (
      id, title, category, difficulty, description, flag, points, resources
    ) VALUES (
      ${newTask.id},
      ${newTask.title},
      ${newTask.category},
      ${newTask.difficulty},
      ${newTask.description},
      ${newTask.flag},
      ${newTask.points},
      ${JSON.stringify(newTask.resources)}
    )
  `;

  return newTask;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const db = await getDb();
  
  // Check if task is a protected seed task (tasks with fixed IDs starting with "challenge-")
  // These are the main interactive challenges that should not be deleted
  const protectedSeedTaskIds = [
    "challenge-malware-beacon-chain",
    "challenge-dfir-log-tampering",
    "challenge-email-polyglot-lure",
    "challenge-reverse-engineering-vm",
    "challenge-network-timing-channel",
    "challenge-firmware-nor-dump",
    "challenge-web-deserialization-rce",
    "challenge-osint-phishing-infra",
    "challenge-crypto-ecdsa-nonce",
    "challenge-cloud-iam-escalation",
    "challenge-phishing-email-detection",
    "challenge-sql-injection",
    "challenge-network-traffic",
    "challenge-terms-trap",
    "challenge-cipher-analysis",
    "challenge-dark-web-myths",
    "challenge-social-media-detector",
    "challenge-cyber-mad-libs",
    "challenge-bug-hunt",
  ];
  
  if (protectedSeedTaskIds.includes(taskId)) {
    throw new Error("Cannot delete protected seed tasks. These challenges are system-protected.");
  }
  
  // Delete related assignments first (cascade delete)
  await db`
    DELETE FROM assignments WHERE "taskId" = ${taskId}
  `;
  
  // Delete related submissions (via assignments)
  await db`
    DELETE FROM submissions 
    WHERE "assignmentId" IN (
      SELECT id FROM assignments WHERE "taskId" = ${taskId}
    )
  `;
  
  // Delete from hackathon_tasks if present
  await db`
    DELETE FROM hackathon_tasks WHERE "taskId" = ${taskId}
  `;
  
  // Finally delete the task
  await db`
    DELETE FROM tasks WHERE id = ${taskId}
  `;
};

export const assignTask = async (teamId: string, taskId: string) => {
  const db = await getDb();
  const teamResult = await db`
    SELECT id FROM teams WHERE id = ${teamId}
  `;
  const taskResult = await db`
    SELECT id FROM tasks WHERE id = ${taskId}
  `;

  if (teamResult.rows.length === 0 || taskResult.rows.length === 0) {
    throw new Error("Invalid team or task identifier");
  }

  const alreadyAssignedResult = await db`
    SELECT * FROM assignments WHERE "teamId" = ${teamId} AND "taskId" = ${taskId}
  `;
  
  const alreadyAssigned = alreadyAssignedResult.rows[0] as Assignment | undefined;

  if (alreadyAssigned) {
    return alreadyAssigned;
  }

  const assignment: Assignment = {
    id: crypto.randomUUID(),
    teamId,
    taskId,
    status: "assigned",
    lastUpdated: new Date().toISOString(),
  };

  await db`
    INSERT INTO assignments (id, "teamId", "taskId", status, "lastUpdated")
    VALUES (${assignment.id}, ${assignment.teamId}, ${assignment.taskId}, ${assignment.status}, ${assignment.lastUpdated})
  `;

  return assignment;
};

export const listTeams = async (): Promise<Team[]> => {
  const db = await getDb();
  const result = await db`
    SELECT * FROM teams ORDER BY "createdAt" DESC
  `;
  
  return result.rows.map(mapTeamRow);
};

export const listTasks = async (): Promise<Task[]> => {
  const db = await getDb();
  
  // Always ensure all seed tasks are present (add/update new challenges)
  // This allows new challenges to be added even if database already has tasks
  for (const task of cybersecuritySeedTasks) {
    await db`
      INSERT INTO tasks (id, title, category, difficulty, description, flag, points, resources)
      VALUES (${task.id}, ${task.title}, ${task.category}, ${task.difficulty}, ${task.description}, ${task.flag}, ${task.points}, ${JSON.stringify(task.resources)})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        difficulty = EXCLUDED.difficulty,
        description = EXCLUDED.description,
        flag = EXCLUDED.flag,
        points = EXCLUDED.points,
        resources = EXCLUDED.resources
    `;
  }
  
  // Clean up duplicate tasks based on title (keep the one with interactive challenge link if available)
  // First, get all tasks
  const allTasks = await db`
    SELECT * FROM tasks ORDER BY points ASC
  `;
  
  const tasksByTitle = new Map<string, any[]>();
  for (const task of allTasks.rows) {
    const title = task.title;
    if (!tasksByTitle.has(title)) {
      tasksByTitle.set(title, []);
    }
    tasksByTitle.get(title)!.push(task);
  }
  
  // For each duplicate group, keep the one with interactive challenge, delete others
  for (const [title, duplicates] of tasksByTitle.entries()) {
    if (duplicates.length > 1) {
      // Find the one with interactive challenge (resource starting with /challenges/)
      const interactiveTask = duplicates.find(task => {
        const resources = typeof task.resources === 'string' ? JSON.parse(task.resources) : task.resources;
        return Array.isArray(resources) && resources.some((r: string) => r && r.startsWith('/challenges/'));
      });
      
      // If we found an interactive one, delete all others
      // Otherwise, keep the first one (by ID to ensure consistency)
      const taskToKeep = interactiveTask || duplicates[0];
      const tasksToDelete = duplicates.filter(t => t.id !== taskToKeep.id);
      
      for (const taskToDelete of tasksToDelete) {
        // Delete related data first
        await db`DELETE FROM assignments WHERE "taskId" = ${taskToDelete.id}`;
        await db`DELETE FROM submissions WHERE "assignmentId" IN (SELECT id FROM assignments WHERE "taskId" = ${taskToDelete.id})`;
        await db`DELETE FROM hackathon_tasks WHERE "taskId" = ${taskToDelete.id}`;
        // Delete the task
        await db`DELETE FROM tasks WHERE id = ${taskToDelete.id}`;
      }
    }
  }
  
  // Get final list of tasks
  const result = await db`
    SELECT * FROM tasks ORDER BY points ASC
  `;
  
  return result.rows.map(mapTaskRow);
};

export const listAssignments = async (): Promise<Assignment[]> => {
  const db = await getDb();
  const result = await db`
    SELECT * FROM assignments
  `;
  
  return result.rows as Assignment[];
};

export const listSubmissions = async (): Promise<Submission[]> => {
  const db = await getDb();
  const result = await db`
    SELECT * FROM submissions
  `;
  
  return result.rows.map(mapSubmissionRow);
};

export type SubmissionWithDetails = Submission & {
  team?: Team;
  task?: Task;
  assignment?: Assignment;
};

export const listSubmissionsWithDetails = async (): Promise<SubmissionWithDetails[]> => {
  const db = await getDb();
  // Optimized query with explicit column selection and proper indexing
  const result = await db`
    SELECT
      s.id as "submissionId",
      s."assignmentId" as "submissionAssignmentId",
      s."teamId" as "submissionTeamId",
      s.plan as "submissionPlan",
      s.findings as "submissionFindings",
      s.flag as "submissionFlag",
      s."createdAt" as "submissionCreatedAt",
      s."updatedAt" as "submissionUpdatedAt",
      s.status as "submissionStatus",
      s."pointsAwarded" as "submissionPointsAwarded",
      s."adminNotes" as "submissionAdminNotes",
      s."reviewedAt" as "submissionReviewedAt",
      t.id as "teamId",
      t.name as "teamName",
      t.username as "teamUsername",
      t."createdAt" as "teamCreatedAt",
      task.id as "taskId",
      task.title as "taskTitle",
      task.category as "taskCategory",
      task.difficulty as "taskDifficulty",
      task.description as "taskDescription",
      task.flag as "taskFlag",
      task.points as "taskPoints",
      task.resources as "taskResources",
      a.id as "assignmentId",
      a.status as "assignmentStatus",
      a."lastUpdated" as "assignmentLastUpdated"
    FROM submissions s
    LEFT JOIN teams t ON t.id = s."teamId"
    LEFT JOIN assignments a ON a.id = s."assignmentId"
    LEFT JOIN tasks task ON task.id = a."taskId"
    ORDER BY s."createdAt" DESC
    LIMIT 1000
  `;

  return result.rows.map((row: any) => ({
    ...mapSubmissionRow({
      id: row.submissionId,
      assignmentId: row.submissionAssignmentId,
      teamId: row.submissionTeamId,
      plan: row.submissionPlan,
      findings: row.submissionFindings,
      flag: row.submissionFlag,
      createdAt: row.submissionCreatedAt,
      updatedAt: row.submissionUpdatedAt,
      status: row.submissionStatus,
      pointsAwarded: row.submissionPointsAwarded,
      adminNotes: row.submissionAdminNotes,
      reviewedAt: row.submissionReviewedAt,
    }),
    team: row.teamId
      ? {
          id: row.teamId,
          name: row.teamName,
          username: row.teamUsername,
          password: "",
          createdAt: row.teamCreatedAt,
        }
      : undefined,
    task: row.taskId
      ? {
          id: row.taskId,
          title: row.taskTitle,
          category: row.taskCategory,
          difficulty: row.taskDifficulty,
          description: row.taskDescription,
          flag: row.taskFlag,
          points: row.taskPoints,
          resources: deserializeResources(row.taskResources),
        }
      : undefined,
    assignment: row.assignmentId
      ? {
          id: row.assignmentId,
          teamId: row.submissionTeamId,
          taskId: row.taskId,
          status: row.assignmentStatus,
          lastUpdated: row.assignmentLastUpdated,
        }
      : undefined,
  }));
};

export const reviewSubmission = async (
  submissionId: string,
  status: "approved" | "rejected",
  pointsAwarded: number,
  adminNotes: string,
): Promise<Submission> => {
  const db = await getDb();
  const submissionResult = await db`
    SELECT * FROM submissions WHERE id = ${submissionId}
  `;
  
  const submission = submissionResult.rows[0] as any;

  if (!submission) {
    throw new Error("Submission not found");
  }

  const reviewedAt = new Date().toISOString();

  await db`
    UPDATE submissions
    SET status = ${status},
        "pointsAwarded" = ${pointsAwarded},
        "adminNotes" = ${adminNotes},
        "reviewedAt" = ${reviewedAt}
    WHERE id = ${submissionId}
  `;

  return mapSubmissionRow({
    ...submission,
    status,
    pointsAwarded,
    adminNotes,
    reviewedAt,
  });
};

export const listAssignmentsForTeam = async (
  teamId: string,
): Promise<AssignmentWithTask[]> => {
  const db = await getDb();
  const result = await db`
    SELECT
      a.id as "assignmentId",
      a."teamId" as "assignmentTeamId",
      a."taskId" as "assignmentTaskId",
      a.status as "assignmentStatus",
      a."lastUpdated" as "assignmentLastUpdated",
      t.id as "taskId",
      t.title as "taskTitle",
      t.category as "taskCategory",
      t.difficulty as "taskDifficulty",
      t.description as "taskDescription",
      t.flag as "taskFlag",
      t.points as "taskPoints",
      t.resources as "taskResources",
      s.id as "submissionId",
      s."assignmentId" as "submissionAssignmentId",
      s."teamId" as "submissionTeamId",
      s.plan as "submissionPlan",
      s.findings as "submissionFindings",
      s.flag as "submissionFlag",
      s."createdAt" as "submissionCreatedAt",
      s."updatedAt" as "submissionUpdatedAt",
      s.status as "submissionStatus",
      s."pointsAwarded" as "submissionPointsAwarded",
      s."adminNotes" as "submissionAdminNotes",
      s."reviewedAt" as "submissionReviewedAt"
    FROM assignments a
    LEFT JOIN tasks t ON t.id = a."taskId"
    LEFT JOIN submissions s ON s."assignmentId" = a.id
    WHERE a."teamId" = ${teamId}
    ORDER BY a."lastUpdated" DESC
  `;

  return result.rows.map((row) => ({
    id: row.assignmentId,
    teamId: row.assignmentTeamId,
    taskId: row.assignmentTaskId,
    status: row.assignmentStatus,
    lastUpdated: row.assignmentLastUpdated,
    task: row.taskId
      ? {
          id: row.taskId,
          title: row.taskTitle,
          category: row.taskCategory,
          difficulty: row.taskDifficulty,
          description: row.taskDescription,
          flag: row.taskFlag,
          points: Number(row.taskPoints),
          resources: deserializeResources(row.taskResources),
        }
      : undefined,
    submission: mapSubmissionFromJoinedRow(row),
  }));
};

export const findTeamById = async (teamId: string): Promise<Team | null> => {
  const db = await getDb();
  const result = await db`
    SELECT * FROM teams WHERE id = ${teamId}
  `;
  
  const team = result.rows[0] as Team | undefined;
  return team ?? null;
};

export type LeaderboardEntry = {
  rank: number;
  team: Team;
  score: number;
  challengesCompleted: number;
  totalChallenges: number;
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const db = await getDb();
  
  // Optimized: Single query with JOIN and subquery for total tasks
  const result = await db`
    WITH team_scores AS (
      SELECT 
        s."teamId",
        COALESCE(SUM(s."pointsAwarded"), 0) as "totalScore",
        COUNT(DISTINCT s."assignmentId") as "completedCount"
      FROM submissions s
      WHERE s.status = 'approved'
      GROUP BY s."teamId"
    ),
    total_tasks AS (
      SELECT COUNT(*)::INTEGER as count FROM tasks
    )
    SELECT 
      t.id,
      t.name,
      t.username,
      t.password,
      t."createdAt",
      COALESCE(ts."totalScore", 0)::INTEGER as score,
      COALESCE(ts."completedCount", 0)::INTEGER as "challengesCompleted",
      (SELECT count FROM total_tasks) as "totalChallenges"
    FROM teams t
    LEFT JOIN team_scores ts ON ts."teamId" = t.id
    CROSS JOIN total_tasks
    ORDER BY score DESC, t.name ASC
  `;
  
  return result.rows.map((row: any, index: number) => ({
    rank: index + 1,
    team: mapTeamRow({
      id: row.id,
      name: row.name,
      username: row.username,
      password: row.password,
      createdAt: row.createdAt,
    }),
    score: Number(row.score) || 0,
    challengesCompleted: Number(row.challengesCompleted) || 0,
    totalChallenges: Number(row.totalChallenges) || 0,
  }));
};

export const findSubmissionByAssignmentId = async (
  assignmentId: string,
): Promise<Submission | null> => {
  const db = await getDb();
  const result = await db`
    SELECT * FROM submissions WHERE "assignmentId" = ${assignmentId} LIMIT 1
  `;
  
  const submission = result.rows[0];
  return submission ? mapSubmissionRow(submission) : null;
};

export const validateTeamLogin = async (username: string, password: string) => {
  const db = await getDb();
  const result = await db`
    SELECT * FROM teams WHERE username = ${username} AND password = ${password} LIMIT 1
  `;
  
  const team = result.rows[0] as Team | undefined;

  if (!team) {
    return null;
  }

  return {
    team,
    assignments: await listAssignmentsForTeam(team.id),
  };
};

export const upsertAssignmentStatus = async (
  assignmentId: string,
  status: Assignment["status"],
) => {
  const db = await getDb();
  const assignmentResult = await db`
    SELECT * FROM assignments WHERE id = ${assignmentId}
  `;
  
  const assignment = assignmentResult.rows[0] as Assignment | undefined;

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  const lastUpdated = new Date().toISOString();

  await db`
    UPDATE assignments
    SET status = ${status}, "lastUpdated" = ${lastUpdated}
    WHERE id = ${assignmentId}
  `;

  return {
    ...assignment,
    status,
    lastUpdated,
  };
};

type SubmissionInput = {
  assignmentId: string;
  teamId: string;
  plan: string;
  findings: string;
  flag: string;
};

export const upsertSubmission = async ({
  assignmentId,
  teamId,
  plan,
  findings,
  flag,
}: SubmissionInput): Promise<Submission> => {
  const db = await getDb();
  const assignmentResult = await db`
    SELECT * FROM assignments WHERE id = ${assignmentId}
  `;
  
  const assignment = assignmentResult.rows[0] as Assignment | undefined;

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  if (assignment.teamId !== teamId) {
    throw new Error("Assignment does not belong to this team");
  }

  const existingResult = await db`
    SELECT * FROM submissions WHERE "assignmentId" = ${assignmentId}
  `;
  
  const existing = existingResult.rows[0] as any;

  const createdAt = existing?.createdAt ?? new Date().toISOString();
  const updatedAt = new Date().toISOString();

  if (existing) {
    await db`
      UPDATE submissions
      SET plan = ${plan},
          findings = ${findings},
          flag = ${flag},
          "updatedAt" = ${updatedAt}
      WHERE "assignmentId" = ${assignmentId}
    `;

    return {
      id: existing.id,
      assignmentId,
      teamId,
      plan,
      findings,
      flag,
      createdAt,
      updatedAt,
      status: (existing.status as "pending" | "approved" | "rejected") || "pending",
      pointsAwarded: existing.pointsAwarded ?? 0,
      adminNotes: existing.adminNotes ?? "",
      reviewedAt: existing.reviewedAt ?? null,
    };
  }

  const submission: Submission = {
    id: crypto.randomUUID(),
    assignmentId,
    teamId,
    plan,
    findings,
    flag,
    createdAt,
    updatedAt,
    status: "pending",
    pointsAwarded: 0,
    adminNotes: "",
    reviewedAt: null,
  };

  await db`
    INSERT INTO submissions (
      id, "assignmentId", "teamId", plan, findings, flag,
      "createdAt", "updatedAt", status, "pointsAwarded", "adminNotes"
    ) VALUES (
      ${submission.id},
      ${submission.assignmentId},
      ${submission.teamId},
      ${submission.plan},
      ${submission.findings},
      ${submission.flag},
      ${submission.createdAt},
      ${submission.updatedAt},
      'pending',
      0,
      ''
    )
  `;

  return submission;
};

export const createAdminSession = async (): Promise<AdminSession> => {
  const session: AdminSession = {
    token: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const db = await getDb();
  await db`
    INSERT INTO admin_sessions (token, "createdAt")
    VALUES (${session.token}, ${session.createdAt})
  `;

  return session;
};

export const findAdminSession = async (token: string): Promise<boolean> => {
  if (!token) {
    return false;
  }

  const db = await getDb();
  const result = await db`
    SELECT token FROM admin_sessions WHERE token = ${token} LIMIT 1
  `;

  return result.rows.length > 0;
};

export const deleteAdminSession = async (token: string) => {
  if (!token) {
    return;
  }

  const db = await getDb();
  await db`
    DELETE FROM admin_sessions WHERE token = ${token}
  `;
};
