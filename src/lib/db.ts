import { Pool } from "pg";

// Initialize database connection pool
let pool: Pool | null = null;
let schemaInitialized = false;

const getPool = (): Pool => {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    
    if (!connectionString) {
      const errorMsg = process.env.VERCEL 
        ? `Missing PostgreSQL connection string on Vercel.\n` +
          `Please set POSTGRES_URL or DATABASE_URL in Vercel project settings:\n` +
          `1. Go to your Vercel project\n` +
          `2. Settings → Environment Variables\n` +
          `3. Add POSTGRES_URL with your database connection string\n` +
          `4. Redeploy the application`
        : `Missing PostgreSQL connection string.\n` +
          `Please set POSTGRES_URL or DATABASE_URL in .env.local\n` +
          `Current env check: POSTGRES_URL=${!!process.env.POSTGRES_URL}, DATABASE_URL=${!!process.env.DATABASE_URL}`;
      
      throw new Error(errorMsg);
    }

    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
      max: 5, // Fewer connections for remote database
      min: 1, // Keep 1 connection ready
      idleTimeoutMillis: 60000, // Keep connections longer (60 seconds)
      connectionTimeoutMillis: 10000, // Allow more time for remote connection
      statement_timeout: 20000, // Query timeout - 20 seconds max per query
      keepAlive: true, // Keep connections alive
      keepAliveInitialDelayMillis: 10000, // Start keep-alive after 10 seconds
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
};

// Create a sql template tag function similar to @vercel/postgres
export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  // Lazy get pool - only when query is executed
  let pool: Pool;
  try {
    pool = getPool();
  } catch (error) {
    // Return a rejected promise if pool can't be created
    return Promise.reject(error) as Promise<{ rows: any[]; rowCount: number }>;
  }
  
  const query = strings.reduce((acc, str, i) => {
    return acc + str + (i < values.length ? `$${i + 1}` : '');
  }, '');
  
  return {
    // Return a promise that executes the query
    then: (onFulfilled: any, onRejected: any) => {
      return pool.query(query, values)
        .then(result => ({
          rows: result.rows,
          rowCount: result.rowCount,
        }))
        .then(onFulfilled, onRejected);
    },
    // Make it awaitable
    [Symbol.toStringTag]: 'Promise',
  } as Promise<{ rows: any[]; rowCount: number }>;
};

const initializeSchema = async () => {
  if (schemaInitialized) {
    return;
  }

  try {
    // Check if connection string exists before trying to connect
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('POSTGRES_URL or DATABASE_URL environment variable is not set');
    }

    const pool = getPool();
    
    // Create teams table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        "createdAt" TEXT NOT NULL
      )
    `);

    // Create tasks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        description TEXT NOT NULL,
        flag TEXT NOT NULL,
        points INTEGER NOT NULL,
        resources TEXT NOT NULL
      )
    `);

    // Create assignments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        "teamId" TEXT NOT NULL,
        "taskId" TEXT NOT NULL,
        status TEXT NOT NULL,
        "lastUpdated" TEXT NOT NULL,
        UNIQUE("teamId", "taskId"),
        FOREIGN KEY("teamId") REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY("taskId") REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);

    // Create submissions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        "assignmentId" TEXT NOT NULL UNIQUE,
        "teamId" TEXT NOT NULL,
        plan TEXT NOT NULL,
        findings TEXT NOT NULL,
        flag TEXT NOT NULL,
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        "pointsAwarded" INTEGER DEFAULT 0,
        "adminNotes" TEXT DEFAULT '',
        "reviewedAt" TEXT,
        FOREIGN KEY("teamId") REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY("assignmentId") REFERENCES assignments(id) ON DELETE CASCADE
      )
    `);

    // Create admin_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        token TEXT PRIMARY KEY,
        "createdAt" TEXT NOT NULL
      )
    `);

    // Create hackathon_status table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hackathon_status (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        "isActive" INTEGER DEFAULT 0,
        "startTime" TEXT,
        "endTime" TEXT,
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL
      )
    `);

    // Create hackathon_tasks table to store selected tasks for the hackathon
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hackathon_tasks (
        "taskId" TEXT PRIMARY KEY,
        "createdAt" TEXT NOT NULL,
        FOREIGN KEY("taskId") REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_submissions_teamId ON submissions("teamId");
      CREATE INDEX IF NOT EXISTS idx_submissions_assignmentId ON submissions("assignmentId");
      CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
      CREATE INDEX IF NOT EXISTS idx_assignments_teamId ON assignments("teamId");
      CREATE INDEX IF NOT EXISTS idx_assignments_taskId ON assignments("taskId");
      CREATE INDEX IF NOT EXISTS idx_hackathon_tasks_taskId ON hackathon_tasks("taskId");
    `).catch(() => {
      // Ignore errors if indexes already exist
    });

    // Initialize hackathon_status if it doesn't exist (use INSERT ... ON CONFLICT for atomicity)
    const now = new Date().toISOString();
    await pool.query(
      `INSERT INTO hackathon_status (id, "isActive", "startTime", "endTime", "createdAt", "updatedAt")
       VALUES (1, 0, NULL, NULL, $1, $2)
       ON CONFLICT (id) DO NOTHING`,
      [now, now]
    ).catch(() => {
      // Ignore errors - table might not exist yet or already initialized
    });

    schemaInitialized = true;
    console.log("✅ Database schema initialized successfully");
  } catch (error) {
    console.error("Database schema initialization error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    throw new Error(
      `Database connection failed: ${errorMessage}\n` +
      `Make sure:\n` +
      `1. .env.local file exists with POSTGRES_URL\n` +
      `2. Dev server was restarted after creating .env.local\n` +
      `3. Connection string is correct\n` +
      `Original error: ${errorMessage}`
    );
  }
};

// Cache initialization to avoid repeated schema checks
let dbInitialized = false;
let dbInitializationError: Error | null = null;

export const getDb = async () => {
  if (!dbInitialized && !dbInitializationError) {
    try {
      await initializeSchema();
      dbInitialized = true;
    } catch (error) {
      dbInitializationError = error instanceof Error ? error : new Error(String(error));
      // Don't throw here - let individual queries handle the error
      console.error('Database initialization failed (non-fatal):', dbInitializationError);
      // Don't mark as initialized so we can retry later
      dbInitialized = false;
    }
  }
  
  // If initialization failed, throw on first query attempt
  // But only if we're sure it failed (not just not initialized yet)
  if (dbInitializationError) {
    // Re-throw the error so queries can handle it
    throw dbInitializationError;
  }
  
  // Return sql template tag function
  return sql;
};
