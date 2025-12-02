import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { findAdminSession } from "@/lib/store";
import { HomeClient } from "./HomeClient";

// Force dynamic rendering since we use cookies()
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  // Force unauthenticated by default - require explicit login
  let authenticated = false;
  
  try {
    // Safely get cookies - this might fail in some edge cases
    let token = "";
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
    } catch (cookieError) {
      // If cookies() fails, just continue without token
      console.error("Error reading cookies:", cookieError);
    }
    
    // Only check session if we have a valid token
    if (token && token.trim().length > 0) {
      try {
        // Verify session exists in database
        // Use Promise.race with timeout to prevent hanging
        authenticated = await Promise.race([
          findAdminSession(token).catch(() => false),
          new Promise<boolean>((resolve) => 
            setTimeout(() => resolve(false), 3000)
          )
        ]);
      } catch (error) {
        // On any error (DB connection, etc), treat as unauthenticated
        // This is expected if database is not available - page should still render
        console.error("Error checking admin session (non-fatal):", error);
        authenticated = false;
      }
    }

    // Always render the page, even if authentication check failed
    return (
      <HomeClient
        initialAdminStatus={authenticated ? "authenticated" : "unauthenticated"}
      />
    );
  } catch (error) {
    // If anything fails, always render as unauthenticated
    // Never throw - always render something
    console.error("Page render error:", error);
    return (
      <HomeClient
        initialAdminStatus="unauthenticated"
      />
    );
  }
}
