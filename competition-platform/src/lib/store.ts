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
    id: crypto.randomUUID(),
    title: "Malware Analysis: Encrypted Beacon Chain",
    category: "Malware",
    difficulty: "advanced",
    description:
      "A captured malware beacon contains three sequential payloads, each AES-encrypted with a key derived from the previous payload's SHA1 hash. Analysts recovered the initial key: R7s!probe!2024. Decrypt the chain end-to-end and submit the final plaintext command. Flag format: flag{command_here}",
    flag: "flag{command_here}",
    points: 270,
    resources: [],
  },
  {
    id: crypto.randomUUID(),
    title: "DFIR: Multi-Layer Log Tampering Detection",
    category: "DFIR",
    difficulty: "advanced",
    description:
      "A threat actor modified Linux audit logs to hide a privilege escalation. A compressed .gz log from disk slack space preserves partial records. Decompress, repair the timeline, correlate syscall sequences, and recover the user ID leveraged in the escalation. Flag format: flag{uid1234}",
    flag: "flag{uid1234}",
    points: 260,
    resources: [],
  },
  {
    id: crypto.randomUUID(),
    title: "Email Forensics: Multipart Polyglot Lure",
    category: "Email",
    difficulty: "advanced",
    description:
      "A phishing email embeds its payload inside a multipart/alternative polyglot that doubles as valid HTML and Base64. Extract the Base64 section, decode it, and identify the C2 domain hidden in a <span style=\"font-size:0px\"> tag. Flag format: flag{c2.example.com}",
    flag: "flag{c2.example.com}",
    points: 240,
    resources: [],
  },
  {
    id: crypto.randomUUID(),
    title: "Reverse Engineering: Obfuscated Loader (VM-Based)",
    category: "Reverse Engineering",
    difficulty: "advanced",
    description:
      "A Windows loader hides its unpacking routine behind a custom VM. Reverse the bytecode handlers, emulate the instruction set, recover the decrypted payload, and extract the embedded API token the malware uses for C2 auth. Flag format: flag{token_here}",
    flag: "flag{token_here}",
    points: 320,
    resources: [],
  },
  {
    id: crypto.randomUUID(),
    title: "Network Forensics: Covert Timing Channel",
    category: "Network",
    difficulty: "advanced",
    description:
      "PCAP files show unusual beacon delays to a single IP. Interpret the delta timing (short=0, long=1), rebuild the bitstream, decode the reconstructed payload, and reveal the hidden operator message. Flag format: flag{hidden_data}",
    flag: "flag{hidden_data}",
    points: 250,
    resources: [],
  },
  {
    id: crypto.randomUUID(),
    title: "Firmware Security: NOR Dump Deobfuscation",
    category: "Firmware",
    difficulty: "advanced",
    description:
      "A router NOR flash dump contains bootloader environment variables XORed with a rolling 16-bit LFSR. Reverse the polynomial, rebuild the keystream, and recover the plaintext boot arguments to obtain the rootfs_pass value. Flag format: flag{password_here}",
    flag: "flag{password_here}",
    points: 300,
    resources: [],
  },
  {
    id: crypto.randomUUID(),
    title: "Web Exploitation: Chained Deserialization RCE",
    category: "Web",
    difficulty: "advanced",
    description:
      "An express-session custom serializer plus an SSTI logging bug can be chained for code execution. Craft the gadget payload, trigger the log rendering, achieve RCE, and dump ADMIN_SECRET from the backend environment. Flag format: flag{secret_here}",
    flag: "flag{secret_here}",
    points: 280,
    resources: [],
  },
  {
    id: crypto.randomUUID(),
    title: "OSINT / Threat Intel: Phishing Infra Pivot",
    category: "OSINT",
    difficulty: "advanced",
    description:
      "A phishing URL rotates across geo-failover servers. Use DNS history, certificate transparency, and CDN misconfiguration pivots to attribute the infrastructure and identify the attacker's hosting provider account name. Flag format: flag{account_name}",
    flag: "flag{account_name}",
    points: 230,
    resources: [],
  },
  {
    id: crypto.randomUUID(),
    title: "Crypto: ECDSA Partial Nonce Leakage",
    category: "Crypto",
    difficulty: "advanced",
    description:
      "An attacker reused ECDSA nonces with 24 leaked LSBs. Four signatures and message hashes are provided. Use lattice reduction to recover the private key and present it in hexadecimal. Flag format: flag{deadbeefcafebabe}",
    flag: "flag{deadbeefcafebabe}",
    points: 350,
    resources: [],
  },
  {
    id: crypto.randomUUID(),
    title: "Cloud Security: IAM Shadow Role Escalation",
    category: "Cloud",
    difficulty: "advanced",
    description:
      "A compromised AWS identity can only update IAM role tags. Exploit the misconfigured shadow role trust policy to AssumeRole via crafted tags, escalate privileges, and extract COMPROMISED_KEY from the role's CloudWatch logs. Flag format: flag{key_here}",
    flag: "flag{key_here}",
    points: 260,
    resources: [],
  },
];

// Lazy database initialization
let seeded = false;
let seedingPromise: Promise<void> | null = null;

const seedTasksIfNeeded = async () => {
  // If already seeded, return immediately
  if (seeded) {
    return;
  }

  // If seeding is in progress, wait for it
  if (seedingPromise) {
    return seedingPromise;
  }

  // Start seeding process
  seedingPromise = (async () => {
    const db = await getDb();
    
    // Check if any tasks exist - if yes, mark as seeded (faster check)
    const existingCount = await db`
      SELECT COUNT(*)::INTEGER as count FROM tasks LIMIT 1
    `;
    
    if (existingCount.rows[0]?.count > 0) {
      seeded = true;
      return;
    }

    // Batch insert all tasks - use individual inserts with ON CONFLICT for simplicity
    // This is faster than checking each one individually
    for (const task of cybersecuritySeedTasks) {
      await db`
        INSERT INTO tasks (id, title, category, difficulty, description, flag, points, resources)
        VALUES (${task.id}, ${task.title}, ${task.category}, ${task.difficulty}, ${task.description}, ${task.flag}, ${task.points}, ${JSON.stringify(task.resources)})
        ON CONFLICT (id) DO NOTHING
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

export const startHackathon = async (): Promise<HackathonStatus> => {
  const db = await getDb();
  const now = new Date();
  const startTime = now.toISOString();
  // Set end time to 24 hours from now
  const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const updatedAt = now.toISOString();

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
  // Only seed when listing tasks (tasks are the seed data)
  await seedTasksIfNeeded();
  
  const db = await getDb();
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
