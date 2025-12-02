// Script to clear all admin sessions from database
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
let envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
}

const pool = new Pool({
  connectionString: envVars.POSTGRES_URL || envVars.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: (envVars.POSTGRES_URL || process.env.POSTGRES_URL)?.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
});

async function clearSessions() {
  try {
    const result = await pool.query('DELETE FROM admin_sessions');
    console.log(`✅ Cleared ${result.rowCount} admin session(s) from database`);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing sessions:', error);
    await pool.end();
    process.exit(1);
  }
}

clearSessions();

