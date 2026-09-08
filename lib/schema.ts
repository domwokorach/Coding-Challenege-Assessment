import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * One row per learner (Clerk user id). `data` holds the full ProgressState
 * blob — code, results, completion, and certificate fields. `certificateId`
 * is denormalized out of `data` so the public /certificate/[id] page can
 * look a certificate up without needing to know which user owns it.
 */
export const progress = pgTable("progress", {
  userId: text("user_id").primaryKey(),
  data: jsonb("data").notNull(),
  certificateId: text("certificate_id").unique(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
