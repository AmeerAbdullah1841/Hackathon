# Local Development Setup

## Issue: Database Connection Error

If you're seeing a 500 error or "Database connection error", it's because `@vercel/postgres` requires PostgreSQL environment variables that aren't set locally.

## Solution Options

### Option 1: Use Vercel Postgres (Recommended for Testing)

1. **Create a Vercel Postgres Database:**
   - Go to [vercel.com](https://vercel.com)
   - Create a new project or open existing one
   - Go to **Storage** → **Create Database** → **Postgres**
   - Create the database

2. **Get Connection Details:**
   - In your Vercel project, go to **Settings** → **Environment Variables**
   - Copy the PostgreSQL connection variables:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`

3. **Create `.env.local` file:**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Add the connection strings to `.env.local`:**
   ```env
   POSTGRES_URL=your_postgres_url_here
   POSTGRES_PRISMA_URL=your_prisma_url_here
   POSTGRES_URL_NON_POOLING=your_non_pooling_url_here
   ```

5. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### Option 2: Use Local PostgreSQL

1. **Install PostgreSQL locally:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS (using Homebrew)
   brew install postgresql
   brew services start postgresql
   ```

2. **Create a database:**
   ```bash
   createdb hackathon_db
   ```

3. **Create `.env.local` file:**
   ```env
   POSTGRES_URL=postgres://localhost:5432/hackathon_db
   POSTGRES_PRISMA_URL=postgres://localhost:5432/hackathon_db?pgbouncer=true
   POSTGRES_URL_NON_POOLING=postgres://localhost:5432/hackathon_db
   ```

4. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### Option 3: Use Free PostgreSQL Service (Neon, Supabase)

1. **Create a free PostgreSQL database:**
   - [Neon](https://neon.tech) - Serverless PostgreSQL
   - [Supabase](https://supabase.com) - PostgreSQL with additional features

2. **Get connection string** from the service

3. **Create `.env.local` file** with the connection strings

4. **Restart your dev server**

## Quick Start (Using Vercel Postgres)

The easiest way to get started:

1. Create a Vercel account and project
2. Add a Postgres database in Vercel
3. Copy the environment variables
4. Create `.env.local` with those variables
5. Run `npm run dev`

The database schema will be automatically created on first use!

## Troubleshooting

- **Error: "Missing PostgreSQL environment variables"**
  - Make sure `.env.local` exists and has the required variables
  - Restart your dev server after creating/updating `.env.local`

- **Error: "Connection refused"**
  - Check that your PostgreSQL database is running (if local)
  - Verify connection strings are correct
  - Check firewall/network settings

- **Error: "Database schema initialization error"**
  - This is usually fine - the schema will retry on next request
  - Check database permissions
  - Verify connection strings have proper access


