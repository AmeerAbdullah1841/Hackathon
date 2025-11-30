# Deployment Guide for Vercel

## ✅ Database Migration Complete

**This application has been migrated from SQLite to Vercel Postgres and is ready for deployment!**

The migration includes:
- ✅ Replaced `better-sqlite3` with `@vercel/postgres`
- ✅ Converted all database operations to async PostgreSQL
- ✅ Updated schema to PostgreSQL-compatible syntax
- ✅ All API routes and server components updated

## Deploying to Vercel

### Prerequisites
1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Git repository (GitHub, GitLab, or Bitbucket)
3. Your code pushed to the repository

### Step 1: Set Up Vercel Postgres Database

**IMPORTANT:** You must set up a Vercel Postgres database before deploying:

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Navigate to your project** (or create a new one)
3. **Go to Storage tab** → **Create Database** → **Postgres**
4. **Create the database** (choose a name and region)
5. **Copy the connection details** - Vercel will automatically set environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

The `@vercel/postgres` package automatically uses these environment variables, so no manual configuration is needed!

### Step 2: Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### Step 3: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New Project"**
3. **Import your Git repository**
4. **Configure the project:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `competition-platform` (if your repo has multiple projects)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

5. **Link your Postgres database:**
   - In the project settings, go to **Storage** tab
   - Link the Postgres database you created in Step 1

6. **Add Environment Variables** (optional):
   - `ADMIN_USERNAME` - Admin username (default: "admin")
   - `ADMIN_PASSWORD` - Admin password (default: "hackathon123")
   - `NODE_ENV=production`

7. **Click "Deploy"**

### Step 4: Deploy via CLI (Alternative)

```bash
cd competition-platform
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name? (Press Enter for default)
- Directory? (Press Enter for current directory)
- Override settings? **No**

For production deployment:
```bash
vercel --prod
```

**Note:** When deploying via CLI, make sure to link your Postgres database:
```bash
vercel link
# Follow prompts to link your database
```

### Step 5: Configure Environment Variables

In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add:
   - `ADMIN_USERNAME` (if different from default)
   - `ADMIN_PASSWORD` (if different from default)
   - `NODE_ENV=production`

### Step 6: Verify Deployment

After deployment, Vercel will provide you with:
- Production URL: `https://your-project.vercel.app`
- Preview URLs for each deployment

## Post-Deployment Checklist

- [ ] Verify the application loads correctly
- [ ] Check that database tables were created automatically (schema initializes on first request)
- [ ] Test admin login functionality
- [ ] Verify database connections work
- [ ] Test team registration and login
- [ ] Check API routes are functioning
- [ ] Verify seed tasks were created (10 default cybersecurity tasks)

## Database Schema

The database schema is automatically initialized on first use. The following tables are created:

- `teams` - Team information and credentials
- `tasks` - Challenge tasks
- `assignments` - Task assignments to teams
- `submissions` - Team submissions for tasks
- `admin_sessions` - Admin authentication sessions
- `hackathon_status` - Hackathon start/stop status

## Troubleshooting

### Database Connection Issues
- Verify Postgres database is linked to your project in Vercel Dashboard
- Check that environment variables are set correctly (should be automatic)
- Ensure database is in the same region as your deployment for best performance

### Schema Initialization Errors
- The schema initializes automatically on first database access
- Check function logs in Vercel Dashboard for initialization errors
- If tables already exist, the `CREATE TABLE IF NOT EXISTS` statements will skip creation

## Troubleshooting

### Build Errors
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Database Connection Issues
- Verify database credentials in environment variables
- Check database connection string format
- Ensure database allows connections from Vercel IPs

### Runtime Errors
- Check function logs in Vercel Dashboard
- Verify environment variables are set correctly
- Check for missing dependencies

## Migration Notes

The application has been successfully migrated from SQLite to PostgreSQL:
- All synchronous database operations converted to async
- SQLite-specific syntax converted to PostgreSQL
- Parameter placeholders changed from `?` to template literals
- `datetime()` functions removed (using ISO strings directly)
- Transaction handling updated for PostgreSQL

The database will automatically create all necessary tables on first use. No manual migration scripts are needed!

