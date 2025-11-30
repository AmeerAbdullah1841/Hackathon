# Vercel Environment Variables Check

## Required Environment Variables

Your code expects these exact variable names:

1. **POSTGRES_URL** (or DATABASE_URL as fallback)
   - Used by: `src/lib/db.ts`
   - Check: `process.env.POSTGRES_URL || process.env.DATABASE_URL`

2. **ADMIN_USERNAME**
   - Used by: `src/lib/admin-auth.ts`
   - Check: `process.env.ADMIN_USERNAME`

3. **ADMIN_PASSWORD**
   - Used by: `src/lib/admin-auth.ts`
   - Check: `process.env.ADMIN_PASSWORD`

## What You Have in Vercel

From your screenshot, you have:
- ✅ ADMIN_USERNAME
- ✅ ADMIN_PASSWORD
- ✅ POSTGRES_URL
- ✅ DATABASE_URL
- ✅ PRISMA_DATABASE_URL (not used by our code, but harmless)

## Important Notes

1. **No quotes needed**: Don't wrap values in quotes in Vercel
2. **No spaces**: Make sure there are no leading/trailing spaces
3. **All environments**: Make sure they're enabled for "Production"
4. **Redeploy required**: After adding/changing env vars, you MUST redeploy

## Test Your Environment Variables

After deploying, visit:
```
https://your-app.vercel.app/api/health
```

This will show:
- Which environment variables are detected
- Database connection status
- Any errors

## Common Issues

1. **Variable name typo**: Double-check spelling (case-sensitive)
2. **Not enabled for Production**: Check the environment dropdown
3. **Quotes in value**: Remove any quotes around the value
4. **Whitespace**: Trim any spaces before/after the value

