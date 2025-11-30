# Troubleshooting 404 Error on Vercel

## ⚠️ Most Common Issue: Environment Variables Need Redeploy

**Environment variables are only available to NEW deployments.** If you added environment variables after deploying, you MUST redeploy.

## Step 1: Redeploy Your Application

1. Go to your Vercel project → **Deployments** tab
2. Find the latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Redeploy"**
5. Wait for deployment to complete

## Step 2: Check Deployment Logs

1. Go to your deployment → **Logs** tab
2. Look for errors related to:
   - Database connection
   - Missing environment variables
   - Build failures

## Step 3: Verify Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Verify these are set:
   - ✅ `POSTGRES_URL` (your Prisma Postgres connection string)
   - ✅ `ADMIN_USERNAME`
   - ✅ `ADMIN_PASSWORD`
3. Make sure they're enabled for **Production** environment

## Step 4: Test Health Endpoint

After redeploying, visit:
```
https://your-app.vercel.app/api/health
```

This will show:
- ✅ Environment variables status
- ✅ Database connection status
- ✅ Any errors

## Common Issues

### Issue 1: Environment Variables Not Applied
**Symptom:** 404 error persists after redeploy
**Solution:** 
- Double-check environment variables are set for **Production**
- Make sure connection string has no extra quotes
- Redeploy again

### Issue 2: Database Connection Failed
**Symptom:** Health endpoint shows `database.status: "error"`
**Solution:**
- Verify `POSTGRES_URL` is correct
- Check if database requires SSL (should include `?sslmode=require`)
- Verify database is accessible from internet

### Issue 3: Build Failed
**Symptom:** Deployment shows "Build Failed" in logs
**Solution:**
- Check build logs for specific errors
- Verify all dependencies are in `package.json`
- Check for TypeScript errors

## Quick Checklist

- [ ] Environment variables added in Vercel
- [ ] Environment variables enabled for **Production**
- [ ] Application **redeployed** after adding variables
- [ ] Deployment logs checked for errors
- [ ] Health endpoint tested: `/api/health`
- [ ] Database connection string is correct

## Still Not Working?

1. **Check the health endpoint:** `https://your-app.vercel.app/api/health`
2. **Share the health endpoint response** - it will show exactly what's wrong
3. **Check Vercel deployment logs** for specific error messages

