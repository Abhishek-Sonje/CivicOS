import { NextResponse } from "next/server";
import { db } from "../../../lib/db/client";
import { issues } from "../../../lib/db/schema";

// Make this route dynamic to prevent caching SQLite reads at build time
export const dynamic = "force-dynamic";

/**
 * GET API route that retrieves all issues from the database.
 * Conforms to the Issue[] type due to compile-time schema safety checks.
 */
export async function GET() {
  try {
    const list = await db.select().from(issues);
    return NextResponse.json(list);
  } catch (error) {
    console.error("API error: Failed to fetch issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues from database" },
      { status: 500 }
    );
  }
}
