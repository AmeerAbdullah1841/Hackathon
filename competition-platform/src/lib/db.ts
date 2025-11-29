import fs from "node:fs";
import path from "node:path";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIRECTORY, "store.db");

// Lazy import to avoid bus errors during module load
let Database: any = null;
let dbPromise: Promise<any> | null = null;

const getDatabase = async () => {
  if (!Database) {
    // Use dynamic import to truly defer loading
    Database = (await import("better-sqlite3")).default;
  }
  return Database;
};

let db: any = null;

const migrateSchema = (database: any) => {
  // Add new columns to submissions table if they don't exist
  const columns = database.pragma("table_info(submissions)");
  const columnNames = columns.map((col: any) => col.name);
  
  if (!columnNames.includes("status")) {
    database.exec("ALTER TABLE submissions ADD COLUMN status TEXT DEFAULT 'pending'");
  }
  if (!columnNames.includes("pointsAwarded")) {
    database.exec("ALTER TABLE submissions ADD COLUMN pointsAwarded INTEGER DEFAULT 0");
  }
  if (!columnNames.includes("adminNotes")) {
    database.exec("ALTER TABLE submissions ADD COLUMN adminNotes TEXT DEFAULT ''");
  }
  if (!columnNames.includes("reviewedAt")) {
    database.exec("ALTER TABLE submissions ADD COLUMN reviewedAt TEXT");
  }

  // Initialize hackathon_status if it doesn't exist
  const hackathonStatus = database.prepare("SELECT * FROM hackathon_status WHERE id = 1").get();
  if (!hackathonStatus) {
    const now = new Date().toISOString();
    database.exec(`
      INSERT INTO hackathon_status (id, isActive, startTime, endTime, createdAt, updatedAt)
      VALUES (1, 0, NULL, NULL, '${now}', '${now}')
    `);
  }
};

const initializeSchema = (database: any) => {
  database.pragma("journal_mode = WAL");
  database.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      description TEXT NOT NULL,
      flag TEXT NOT NULL,
      points INTEGER NOT NULL,
      resources TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      teamId TEXT NOT NULL,
      taskId TEXT NOT NULL,
      status TEXT NOT NULL,
      lastUpdated TEXT NOT NULL,
      UNIQUE(teamId, taskId),
      FOREIGN KEY(teamId) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY(taskId) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assignmentId TEXT NOT NULL UNIQUE,
      teamId TEXT NOT NULL,
      plan TEXT NOT NULL,
      findings TEXT NOT NULL,
      flag TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      pointsAwarded INTEGER DEFAULT 0,
      adminNotes TEXT DEFAULT '',
      reviewedAt TEXT,
      FOREIGN KEY(teamId) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY(assignmentId) REFERENCES assignments(id) ON DELETE CASCADE
    );
    
    -- Add new columns to existing submissions table if they don't exist
    -- SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS, so we use a try-catch approach
    -- This will be handled in the migration function

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hackathon_status (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      isActive INTEGER DEFAULT 0,
      startTime TEXT,
      endTime TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
};

export const getDb = () => {
  if (db) {
    return db;
  }

  // Synchronous initialization for compatibility
  // This will be called lazily, so the module should already be loaded
  if (!Database) {
    Database = require("better-sqlite3");
  }

  try {
    fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
    db = new Database(DB_FILE);
    initializeSchema(db);
    migrateSchema(db);
    return db;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
};

