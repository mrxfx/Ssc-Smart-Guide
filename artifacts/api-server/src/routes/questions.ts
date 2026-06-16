import { Router } from "express";
import { eq, and, sql, desc, ilike } from "drizzle-orm";
import { db, questionsTable, bookmarkedQuestionsTable } from "@workspace/db";
import {
  ListQuestionsQueryParams,
  ListQuestionsResponse,
  GetQuestionParams,
  GetQuestionResponse,
  BookmarkQuestionParams,
  BookmarkQuestionResponse,
  GetBookmarkedQuestionsResponse,
  GetPYQYearsResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();
function getUserId(req: any): string { return req.headers["x-user-id"] as string || "demo-user"; }

function parseQuestion(q: any, bookmarkedIds: Set<string>) {
  return {
    id: q.id, text: q.text, options: JSON.parse(q.optionsJson), correctOption: q.correctOption,
    explanation: q.explanation ?? null, subject: q.subject, topic: q.topic ?? null,
    difficulty: q.difficulty, year: q.year ?? null, isPYQ: q.isPYQ, isBookmarked: bookmarkedIds.has(q.id)
  };
}

router.get("/questions", async (req, res): Promise<void> => {
  const p = ListQuestionsQueryParams.safeParse(req.query);
  const userId = getUserId(req);
  const page = Number(p.success && p.data.page ? p.data.page : 1);
  const limit = Number(p.success && p.data.limit ? p.data.limit : 20);
  const offset = (page - 1) * limit;

  let questions = await db.select().from(questionsTable).orderBy(desc(questionsTable.createdAt)).limit(limit).offset(offset);
  const total = await db.select({ count: sql<number>`count(*)` }).from(questionsTable);
  const bookmarks = await db.select().from(bookmarkedQuestionsTable).where(eq(bookmarkedQuestionsTable.userId, userId));
  const bookmarkedIds = new Set(bookmarks.map(b => b.questionId));
  res.json(ListQuestionsResponse.parse({
    questions: questions.map(q => parseQuestion(q, bookmarkedIds)),
    total: Number(total[0]?.count ?? 0), page, limit
  }));
});

router.get("/questions/bookmarks", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const bookmarks = await db.select({ bq: bookmarkedQuestionsTable, q: questionsTable })
    .from(bookmarkedQuestionsTable)
    .leftJoin(questionsTable, eq(bookmarkedQuestionsTable.questionId, questionsTable.id))
    .where(eq(bookmarkedQuestionsTable.userId, userId));
  const bookmarkedIds = new Set(bookmarks.map(b => b.bq.questionId));
  const questions = bookmarks.filter(b => b.q).map(b => parseQuestion(b.q!, bookmarkedIds));
  res.json(GetBookmarkedQuestionsResponse.parse(questions));
});

router.get("/questions/pyq/years", async (_req, res): Promise<void> => {
  const years = await db.select({ year: questionsTable.year, count: sql<number>`count(*)` })
    .from(questionsTable).where(and(eq(questionsTable.isPYQ, true), sql`${questionsTable.year} IS NOT NULL`))
    .groupBy(questionsTable.year).orderBy(desc(questionsTable.year));
  res.json(GetPYQYearsResponse.parse(years.filter(y => y.year).map(y => ({ year: y.year!, count: Number(y.count) }))));
});

router.get("/questions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = getUserId(req);
  const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, raw));
  if (!q) { res.status(404).json({ error: "Question not found" }); return; }
  const bookmarks = await db.select().from(bookmarkedQuestionsTable).where(and(eq(bookmarkedQuestionsTable.userId, userId), eq(bookmarkedQuestionsTable.questionId, raw)));
  res.json(GetQuestionResponse.parse({
    id: q.id, text: q.text, options: JSON.parse(q.optionsJson), correctOption: q.correctOption,
    explanation: q.explanation ?? "See explanation in study material", subject: q.subject,
    topic: q.topic ?? null, difficulty: q.difficulty, year: q.year ?? null, isPYQ: q.isPYQ,
    isBookmarked: bookmarks.length > 0, aiExplanation: null
  }));
});

router.post("/questions/:id/bookmark", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = getUserId(req);
  const existing = await db.select().from(bookmarkedQuestionsTable)
    .where(and(eq(bookmarkedQuestionsTable.userId, userId), eq(bookmarkedQuestionsTable.questionId, raw)));
  if (existing.length > 0) {
    await db.delete(bookmarkedQuestionsTable).where(and(eq(bookmarkedQuestionsTable.userId, userId), eq(bookmarkedQuestionsTable.questionId, raw)));
    res.json(BookmarkQuestionResponse.parse({ success: true, isBookmarked: false }));
  } else {
    await db.insert(bookmarkedQuestionsTable).values({ id: randomUUID(), userId, questionId: raw });
    res.json(BookmarkQuestionResponse.parse({ success: true, isBookmarked: true }));
  }
});

export default router;
