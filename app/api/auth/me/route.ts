import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getAuthenticatedUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const db = getDb();
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = rows[0];
    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/auth/me failed", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
