import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { deleteAdminSession } from "@/lib/store";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  
  // Delete admin session if it exists
  if (token) {
    await deleteAdminSession(token);
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  // Clear admin session cookie
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

