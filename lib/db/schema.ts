import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * One row per registered account. Email is the primary identifier, always
 * stored normalized (trimmed + lowercased). `tokenVersion` is bumped to
 * invalidate every previously issued JWT for this user (password reset,
 * account deletion) without needing a server-side session store.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull().default(""),
  lastName: text("last_name").notNull().default(""),
  phone: text("phone"),
  emailVerified: boolean("email_verified").notNull().default(false),
  tokenVersion: integer("token_version").notNull().default(0),
  plan: text("plan").notNull().default("starter"),
  planActivatedAt: timestamp("plan_activated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * One-to-one with `users`. Kept as its own table (rather than a column on
 * `users`) so future auth methods (e.g. OAuth) can be added without
 * reshaping the users table.
 */
export const passwordCredentials = pgTable("password_credentials", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Single-use password reset tokens. Only the SHA-256 hash of the raw token
 * is ever stored — the raw token exists only in the emailed/logged link.
 */
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * One row per learner. `data` holds the full ProgressState blob — code,
 * results, completion, and certificate fields. `certificateId` is
 * denormalized out of `data` so the public /certificate/[id] page can look
 * a certificate up without needing to know which user owns it.
 */
export const progress = pgTable("progress", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull(),
  certificateId: text("certificate_id").unique(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * One row per Assessment Timeline recording session — at most one per
 * `assessmentId` (this app has a single assessment attempt per candidate,
 * but keying by assessmentId rather than userId keeps the door open for
 * multiple attempts later). The individual captured events live in
 * `assessmentTimelineEvents`, not here — for a long assessment that table
 * can grow into the thousands of rows, which a single jsonb column would
 * make slow to append to and awkward to page through for playback.
 */
export const assessmentRecordings = pgTable(
  "assessment_recordings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentId: text("assessment_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("recording"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    language: text("language"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("assessment_recordings_assessment_id_idx").on(table.assessmentId)]
);

/**
 * One row per captured activity event (code edits, file/language changes,
 * run/test actions, submissions). `id` is the client-generated event id —
 * `text` (not `uuid`) so it also accepts the deterministic
 * `"<recordingId>-started"` id used for the server-synthesized
 * "assessment_started" event — primary key rather than `defaultRandom()` so
 * a retried batch flush (after a dropped connection) can be inserted with
 * `onConflictDoNothing` and never duplicate an event. `seq` is a pure
 * insertion-order tiebreaker for events landing in the same millisecond;
 * playback always orders by (timestampMs, seq).
 */
export const assessmentTimelineEvents = pgTable(
  "assessment_timeline_events",
  {
    id: text("id").primaryKey(),
    recordingId: uuid("recording_id")
      .notNull()
      .references(() => assessmentRecordings.id, { onDelete: "cascade" }),
    seq: serial("seq").notNull(),
    timestampMs: bigint("timestamp_ms", { mode: "number" }).notNull(),
    type: text("type").notNull(),
    data: jsonb("data").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("assessment_timeline_events_recording_id_idx").on(table.recordingId)]
);

/**
 * One row per checkout attempt against Stripe. Created in "processing"
 * state as soon as a PaymentIntent exists, then flipped to its terminal
 * state only after the server re-fetches that PaymentIntent from Stripe —
 * never from a client-reported result.
 */
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plan: text("plan").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("usd"),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
  status: text("status").notNull().default("processing"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
