# Vercel Deployment Setup Guide

## ⚠️ Important: Set Environment Variables

Your application requires database environment variables to work on Vercel.

## Step 1: Add Environment Variables in Vercel

1. **Go to your Vercel project dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your `hackathon` project

2. **Navigate to Settings → Environment Variables**

3. **Add these environment variables:**

   ```
   POSTGRES_URL=your_postgres_connection_string_here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password_here
   ```

   **Where to get POSTGRES_URL:**
   - If using Prisma Postgres: Copy from your Prisma dashboard
   - If using Vercel Postgres: Copy from Vercel Storage → Postgres → Connection String
   - Format: `postgres://user:password@host:port/database?sslmode=require`

4. **Select environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development (optional)

5. **Click "Save"**

## Step 2: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger automatic redeployment

## Step 3: Verify

1. Visit your production URL
2. The app should load without 404 errors
3. Try logging in as admin

## Troubleshooting

### Still getting 404?

1. **Check deployment logs:**
   - Go to your deployment → **Logs** tab
   - Look for database connection errors

2. **Verify environment variables:**
   - Settings → Environment Variables
   - Make sure `POSTGRES_URL` is set for **Production** environment
   - Check that the connection string is correct (no extra quotes)

3. **Check database connection:**
   - Make sure your database is accessible from the internet
   - Verify SSL is enabled if required

### Database Connection Error?

- Ensure `POSTGRES_URL` includes `?sslmode=require` if your database requires SSL
- Check that your database allows connections from Vercel's IP addresses
- Verify the connection string format is correct

## Quick Checklist

- [ ] `POSTGRES_URL` environment variable set in Vercel
- [ ] `ADMIN_USERNAME` environment variable set
- [ ] `ADMIN_PASSWORD` environment variable set
- [ ] Environment variables applied to **Production** environment
- [ ] Application redeployed after adding variables
- [ ] Database is accessible and running

