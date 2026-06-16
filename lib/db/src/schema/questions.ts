import { pgTable, text, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const questionsTable = pgTable("questions", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  optionsJson: text("options_json").notNull(),
  correctOption: text("correct_option").notNull(),
  explanation: text("explanation"),
  subject: text("subject").notNull(),
  topic: text("topic"),
  difficulty: text("difficulty").notNull().default("medium"),
  year: integer("year"),
  isPYQ: boolean("is_pyq").notNull().default(false),
  testId: text("test_id"),
  marks: real("marks").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookmarkedQuestionsTable = pgTable("bookmarked_questions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  questionId: text("question_id").notNull().references(() => questionsTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({ createdAt: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;
