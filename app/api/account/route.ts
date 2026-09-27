import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { passwordCredentials, users } from "@/lib/db/schema";
import { clearSessionCookie, getAuthenticatedUserId, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { password?: unknown };
  try {
    body = (await request.json()) as { password?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const password = body.password;
  if (typeof password !== "string" || !password) {
    return NextResponse.json(
      { error: "Password is required to delete your account." },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    const rows = await db
      .select({ passwordHash: passwordCredentials.passwordHash })
      .from(passwordCredentials)
      .where(eq(passwordCredentials.userId, userId))
      .limit(1);

    const credential = rows[0];
    if (!credential) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const passwordMatches = await verifyPassword(password, credential.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 403 });
    }

    // password_credentials, password_reset_tokens, and progress rows all
    // cascade-delete via the FK ON DELETE CASCADE set up in lib/schema.ts —
    // deleting the users row is enough to remove everything, no orphans.
    await db.delete(users).where(eq(users.id, userId));

    await clearSessionCookie();

    return NextResponse.json({ message: "Your account has been deleted." });
  } catch (error) {
    console.error("DELETE /api/account failed", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
