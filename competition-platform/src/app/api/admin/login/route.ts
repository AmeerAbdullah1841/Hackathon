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
  const { username, password } =
    (await request.json().catch(() => ({}))) as AdminLoginBody;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Invalid admin credentials" },
      { status: 401 },
    );
  }

  const session = createAdminSession();
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
}

