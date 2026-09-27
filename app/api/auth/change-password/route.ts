import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { passwordCredentials, users } from "@/lib/db/schema";
import {
  getAuthenticatedUserId,
  hashPassword,
  isValidPassword,
  setSessionCookie,
  signSessionToken,
  verifyPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Used by the Account Settings page's inline "Change Password" form —
 * distinct from /api/auth/reset-password (which is for the logged-out
 * forgot-password flow and works off a mailed token instead of the
 * current password). Shares hashing/validation helpers from lib/auth.ts.
 */
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { currentPassword?: unknown; newPassword?: unknown };
  try {
    body = (await request.json()) as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const currentPassword = body.currentPassword;
  const newPassword = body.newPassword;

  if (typeof currentPassword !== "string" || !currentPassword) {
    return NextResponse.json(
      { error: "Current password is required." },
      { status: 400 }
    );
  }

  if (typeof newPassword !== "string" || !isValidPassword(newPassword)) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters long." },
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

    const currentMatches = await verifyPassword(
      currentPassword,
      credential.passwordHash
    );
    if (!currentMatches) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 403 }
      );
    }

    const newPasswordHash = await hashPassword(newPassword);
    const now = new Date();

    await db
      .update(passwordCredentials)
      .set({ passwordHash: newPasswordHash, updatedAt: now })
      .where(eq(passwordCredentials.userId, userId));

    // Bump tokenVersion so any other active sessions are forced to
    // re-authenticate, consistent with the reset-password flow — then
    // immediately issue a fresh token for this session so the user who
    // just proved their identity isn't logged out by their own request.
    const [updated] = await db
      .update(users)
      .set({ tokenVersion: sql`${users.tokenVersion} + 1`, updatedAt: now })
      .where(eq(users.id, userId))
      .returning({ tokenVersion: users.tokenVersion });

    if (updated) {
      const token = await signSessionToken({
        sub: userId,
        tokenVersion: updated.tokenVersion,
      });
      await setSessionCookie(token);
    }

    return NextResponse.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("POST /api/auth/change-password failed", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
