import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { findAdminSession } from "@/lib/store";
import { TeamsClient } from "./TeamsClient";

export default async function TeamsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  
  let authenticated = false;
  if (token) {
    try {
      authenticated = await findAdminSession(token);
    } catch (error) {
      console.error("Error checking admin session:", error);
    }
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Unauthorized</h1>
          <p className="mt-2 text-slate-600">Please log in as admin to access this page.</p>
        </div>
      </div>
    );
  }

  return <TeamsClient />;
}

