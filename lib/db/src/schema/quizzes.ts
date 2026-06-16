import { pgTable, text, boolean, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyQuizzesTable = pgTable("daily_quizzes", {
  id: text("id").primaryKey(),
  date: text("date").notNull().unique(),
  title: text("title").notNull(),
  type: text("type").notNull().default("mixed"),
  questionsJson: text("questions_json").notNull().default("[]"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quizAttemptsTable = pgTable("quiz_attempts", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id").notNull().references(() => dailyQuizzesTable.id),
  userId: text("user_id").notNull(),
  score: real("score").notNull().default(0),
  total: integer("total").notNull().default(0),
  correct: integer("correct").notNull().default(0),
  incorrect: integer("incorrect").notNull().default(0),
  answersJson: text("answers_json").notNull().default("[]"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDailyQuizSchema = createInsertSchema(dailyQuizzesTable).omit({ createdAt: true });
export type InsertDailyQuiz = z.infer<typeof insertDailyQuizSchema>;
export type DailyQuiz = typeof dailyQuizzesTable.$inferSelect;
