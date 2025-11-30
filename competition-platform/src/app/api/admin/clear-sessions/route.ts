import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST() {
  try {
    const db = await sql;
    const result = await db`DELETE FROM admin_sessions`;
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${result.rowCount || 0} admin session(s)` 
    });
  } catch (error) {
    console.error("Error clearing sessions:", error);
    return NextResponse.json(
      { error: "Failed to clear sessions" },
      { status: 500 }
    );
  }
}

