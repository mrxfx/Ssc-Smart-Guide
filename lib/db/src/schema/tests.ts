import { pgTable, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const testsTable = pgTable("tests", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("full"),
  subject: text("subject"),
  totalQuestions: integer("total_questions").notNull().default(80),
  duration: integer("duration").notNull().default(60),
  maxMarks: real("max_marks").notNull().default(80),
  negativeMarking: real("negative_marking").notNull().default(0.25),
  isPremium: boolean("is_premium").notNull().default(false),
  attempts: integer("attempts").notNull().default(0),
  year: integer("year"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const testAttemptsTable = pgTable("test_attempts", {
  id: text("id").primaryKey(),
  testId: text("test_id").notNull().references(() => testsTable.id),
  userId: text("user_id").notNull(),
  score: real("score").notNull().default(0),
  maxMarks: real("max_marks").notNull().default(80),
  correct: integer("correct").notNull().default(0),
  incorrect: integer("incorrect").notNull().default(0),
  skipped: integer("skipped").notNull().default(0),
  accuracy: real("accuracy").notNull().default(0),
  timeTaken: integer("time_taken").notNull().default(0),
  rank: integer("rank").notNull().default(0),
  answersJson: text("answers_json").notNull().default("[]"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTestSchema = createInsertSchema(testsTable).omit({ createdAt: true, attempts: true });
export type InsertTest = z.infer<typeof insertTestSchema>;
export type Test = typeof testsTable.$inferSelect;

export const insertTestAttemptSchema = createInsertSchema(testAttemptsTable).omit({ createdAt: true });
export type InsertTestAttempt = z.infer<typeof insertTestAttemptSchema>;
export type TestAttempt = typeof testAttemptsTable.$inferSelect;
