import { Router } from "express";
import { eq, desc, sql, and } from "drizzle-orm";
import { db, testsTable, questionsTable, testAttemptsTable, usersTable } from "@workspace/db";
import {
  ListTestsQueryParams,
  ListTestsResponse,
  GetTestParams,
  GetTestResponse,
  SubmitTestParams,
  SubmitTestBody,
  SubmitTestResponse,
  GetTestHistoryResponse,
  GetTestLeaderboardParams,
  GetTestLeaderboardResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();
function getUserId(req: any): string { return req.headers["x-user-id"] as string || "demo-user"; }

router.get("/tests", async (req, res): Promise<void> => {
  const params = ListTestsQueryParams.safeParse(req.query);
  let query = db.select().from(testsTable).$dynamic();
  const filters: any[] = [];
  if (params.success && params.data.type) filters.push(eq(testsTable.type, params.data.type));
  if (params.success && params.data.subject) filters.push(eq(testsTable.subject, params.data.subject));
  if (filters.length) query = query.where(and(...filters));
  const tests = await query.orderBy(desc(testsTable.createdAt));
  res.json(ListTestsResponse.parse(tests.map(t => ({
    ...t, createdAt: t.createdAt.toISOString(), year: t.year ?? null
  }))));
});

router.get("/tests/history", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const attempts = await db.select({ attempt: testAttemptsTable, test: testsTable })
    .from(testAttemptsTable).leftJoin(testsTable, eq(testAttemptsTable.testId, testsTable.id))
    .where(eq(testAttemptsTable.userId, userId)).orderBy(desc(testAttemptsTable.createdAt)).limit(20);
  const history = attempts.map(({ attempt, test }) => ({
    id: attempt.id, testId: attempt.testId, testTitle: test?.title ?? "Mock Test",
    score: attempt.score, maxMarks: attempt.maxMarks, accuracy: attempt.accuracy,
    attemptedAt: attempt.createdAt.toISOString(), rank: attempt.rank, timeTaken: attempt.timeTaken
  }));
  res.json(GetTestHistoryResponse.parse(history));
});

router.get("/tests/leaderboard/:testId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.testId) ? req.params.testId[0] : req.params.testId;
  const p = GetTestLeaderboardParams.safeParse({ testId: raw });
  if (!p.success) { res.status(400).json({ error: p.error.message }); return; }
  const userId = getUserId(req);
  const attempts = await db.select({ attempt: testAttemptsTable, user: usersTable })
    .from(testAttemptsTable).leftJoin(usersTable, eq(testAttemptsTable.userId, usersTable.id))
    .where(eq(testAttemptsTable.testId, p.data.testId))
    .orderBy(desc(testAttemptsTable.score)).limit(20);
  const leaderboard = attempts.map((r, i) => ({
    rank: i + 1, userId: r.attempt.userId, name: r.user?.name ?? "Student",
    avatar: r.user?.avatar ?? null, score: r.attempt.score, accuracy: r.attempt.accuracy,
    isCurrentUser: r.attempt.userId === userId
  }));
  res.json(GetTestLeaderboardResponse.parse(leaderboard));
});

router.get("/tests/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const p = GetTestParams.safeParse({ id: raw });
  if (!p.success) { res.status(400).json({ error: p.error.message }); return; }
  const [test] = await db.select().from(testsTable).where(eq(testsTable.id, p.data.id));
  if (!test) { res.status(404).json({ error: "Test not found" }); return; }
  const questions = await db.select().from(questionsTable).where(eq(questionsTable.testId, p.data.id));
  const testWithQs = {
    id: test.id, title: test.title, type: test.type, duration: test.duration,
    negativeMarking: test.negativeMarking, maxMarks: test.maxMarks,
    questions: questions.map(q => ({
      id: q.id, text: q.text, options: JSON.parse(q.optionsJson),
      marks: q.marks, subject: q.subject ?? null, topic: q.topic ?? null
    }))
  };
  res.json(GetTestResponse.parse(testWithQs));
});

router.post("/tests/:id/submit", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const p = SubmitTestParams.safeParse({ id: raw });
  if (!p.success) { res.status(400).json({ error: p.error.message }); return; }
  const body = SubmitTestBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const userId = getUserId(req);
  const [test] = await db.select().from(testsTable).where(eq(testsTable.id, p.data.id));
  if (!test) { res.status(404).json({ error: "Test not found" }); return; }
  const questions = await db.select().from(questionsTable).where(eq(questionsTable.testId, p.data.id));
  const qMap = new Map(questions.map(q => [q.id, q]));
  let correct = 0, incorrect = 0, skipped = 0;
  let score = 0;
  const answers = body.data.answers.map(a => {
    const q = qMap.get(a.questionId);
    if (!q) return { questionId: a.questionId, selectedOption: a.selectedOption, correctOption: "", isCorrect: false, explanation: "" };
    const isCorrect = a.selectedOption === q.correctOption;
    const isSkipped = a.selectedOption === null;
    if (isSkipped) skipped++;
    else if (isCorrect) { correct++; score += q.marks; }
    else { incorrect++; score -= test.negativeMarking; }
    return {
      questionId: a.questionId, selectedOption: a.selectedOption, correctOption: q.correctOption,
      isCorrect, explanation: q.explanation ?? "Refer to study materials for detailed explanation."
    };
  });
  const accuracy = questions.length > 0 ? (correct / questions.length) * 100 : 0;
  const rank = Math.floor(Math.random() * 500) + 1;
  const attemptId = randomUUID();
  await db.insert(testAttemptsTable).values({
    id: attemptId, testId: test.id, userId, score: Math.max(0, score), maxMarks: test.maxMarks,
    correct, incorrect, skipped, accuracy, timeTaken: body.data.timeTaken, rank, answersJson: JSON.stringify(answers)
  });
  await db.update(testsTable).set({ attempts: sql`${testsTable.attempts} + 1` }).where(eq(testsTable.id, test.id));
  const subjects = ["General Intelligence","General Knowledge","Elementary Mathematics","English/Hindi"];
  const subjectWise = subjects.map(s => ({ subject: s, correct: Math.floor(Math.random() * 15 + 5), total: 20 }));
  res.json(SubmitTestResponse.parse({
    testId: test.id, score: Math.max(0, score), maxMarks: test.maxMarks,
    correct, incorrect, skipped, accuracy, rank, totalAttempts: test.attempts + 1,
    timeTaken: body.data.timeTaken, percentile: Math.max(0, 100 - rank / 5), answers, subjectWise
  }));
});

export default router;
