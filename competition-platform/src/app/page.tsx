import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { HomeClient } from "./HomeClient";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  
  // Lazy load the store module to avoid loading database during SSR initialization
  let authenticated = false;
  if (token) {
    try {
      const { findAdminSession } = await import("@/lib/store");
      authenticated = await findAdminSession(token);
    } catch (error) {
      console.error("Error checking admin session:", error);
    }
  }

  return (
    <HomeClient
      initialAdminStatus={authenticated ? "authenticated" : "unauthenticated"}
    />
  );
}
