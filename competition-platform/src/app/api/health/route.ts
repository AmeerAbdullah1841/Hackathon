import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hasPostgresUrl = !!process.env.POSTGRES_URL;
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const hasAdminUsername = !!process.env.ADMIN_USERNAME;
    const hasAdminPassword = !!process.env.ADMIN_PASSWORD;
    
    // Try to connect to database
    let dbStatus = "not_checked";
    let dbError = null;
    
    try {
      const { getDb } = await import("@/lib/db");
      const db = await getDb();
      // Try a simple query
      await db`SELECT 1 as test`;
      dbStatus = "connected";
    } catch (error) {
      dbStatus = "error";
      dbError = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json({
      status: "ok",
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        hasPostgresUrl,
        hasDatabaseUrl,
        hasAdminUsername,
        hasAdminPassword,
      },
      database: {
        status: dbStatus,
        error: dbError,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

