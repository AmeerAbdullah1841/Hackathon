import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { HomeClient } from "./HomeClient";

export default async function Page() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
    
    // Lazy load the store module to avoid loading database during SSR initialization
    let authenticated = false;
    if (token) {
      try {
        const { findAdminSession } = await import("@/lib/store");
        authenticated = await findAdminSession(token);
      } catch (error) {
        // Silently fail - database might not be configured yet
        // The page will still render, just without admin authentication
        console.error("Error checking admin session:", error);
        authenticated = false;
      }
    }

    return (
      <HomeClient
        initialAdminStatus={authenticated ? "authenticated" : "unauthenticated"}
      />
    );
  } catch (error) {
    // If anything fails, still try to render the page
    console.error("Page render error:", error);
    return (
      <HomeClient
        initialAdminStatus="unauthenticated"
      />
    );
  }
}
