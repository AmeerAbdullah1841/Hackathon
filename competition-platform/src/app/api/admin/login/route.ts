import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_PASSWORD,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  ADMIN_USERNAME,
  IS_PRODUCTION,
} from "@/lib/admin-auth";
import { createAdminSession } from "@/lib/store";

type AdminLoginBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const { username, password } =
      (await request.json().catch(() => ({}))) as AdminLoginBody;

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 },
      );
    }

    const session = await createAdminSession();
    const response = NextResponse.json({ authenticated: true });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: session.token,
      httpOnly: true,
      sameSite: "lax",
      secure: IS_PRODUCTION,
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Full error details:", { errorMessage, errorStack, error });
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: "Database connection error. Please ensure PostgreSQL environment variables are set.",
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        envCheck: {
          hasPostgresUrl: !!process.env.POSTGRES_URL,
          hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
          hasPostgresNonPooling: !!process.env.POSTGRES_URL_NON_POOLING,
          postgresUrlPreview: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.substring(0, 50) + '...' : 'NOT SET',
        },
        fullError: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}

