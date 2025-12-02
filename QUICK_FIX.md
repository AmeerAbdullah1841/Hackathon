# Quick Fix for Database Connection Error

## The Problem
PostgreSQL is installed but not running on your system.

## Solution: Start PostgreSQL

Run this command in your terminal:

```bash
sudo systemctl start postgresql
```

Then create the database:

```bash
sudo -u postgres psql -c "CREATE DATABASE hackathon_db;"
```

Or run the setup script:

```bash
cd competition-platform
./setup-local-db.sh
```

## Alternative: Use Free Cloud Database (Easier!)

If you don't want to manage local PostgreSQL, use a free cloud database:

### Option 1: Neon (Recommended - Free Tier)
1. Go to https://neon.tech
2. Sign up (free)
3. Create a new project
4. Copy the connection string
5. Update `.env.local` with the connection string

### Option 2: Supabase (Free Tier)
1. Go to https://supabase.com
2. Sign up (free)
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string
6. Update `.env.local`

### Option 3: Vercel Postgres
1. Go to https://vercel.com
2. Create a project
3. Add Postgres database
4. Copy connection strings to `.env.local`

## After Setting Up Database

1. Make sure `.env.local` exists (already created)
2. Restart your dev server:
   ```bash
   npm run dev
   ```

The database schema will be created automatically on first use!


