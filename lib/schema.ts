import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * The app has no authentication — every visitor shares a single implicit
 * "guest" identity, so there is exactly one progress row. `userId` is kept
 * as the row key (rather than dropping the column) so the schema/queries
 * stay unchanged if per-user accounts are reintroduced later.
 */
export const GUEST_USER_ID = "guest";

/**
 * One row per learner (currently just the single guest identity). `data`
 * holds the full ProgressState blob — code, results, completion, and
 * certificate fields. `certificateId` is denormalized out of `data` so the
 * public /certificate/[id] page can look a certificate up without needing
 * to know which user owns it.
 */
export const progress = pgTable("progress", {
  userId: text("user_id").primaryKey(),
  data: jsonb("data").notNull(),
  certificateId: text("certificate_id").unique(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
