import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { HomeClient } from "./HomeClient";

export default async function Page() {
  // Force unauthenticated by default - require explicit login
  let authenticated = false;
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
    
    // Only check session if we have a valid token
    if (token && token.trim().length > 0) {
      try {
        const { findAdminSession } = await import("@/lib/store");
        // Verify session exists in database
        authenticated = await findAdminSession(token);
      } catch (error) {
        // On any error (DB connection, etc), treat as unauthenticated
        console.error("Error checking admin session:", error);
        authenticated = false;
      }
    }

    // Always pass the authentication status
    return (
      <HomeClient
        initialAdminStatus={authenticated ? "authenticated" : "unauthenticated"}
      />
    );
  } catch (error) {
    // If anything fails, always render as unauthenticated
    console.error("Page render error:", error);
    return (
      <HomeClient
        initialAdminStatus="unauthenticated"
      />
    );
  }
}
