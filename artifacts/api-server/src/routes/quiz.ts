import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, dailyQuizzesTable, quizAttemptsTable, questionsTable, usersTable } from "@workspace/db";
import {
  GetDailyQuizResponse,
  SubmitDailyQuizBody,
  SubmitDailyQuizResponse,
  GetCurrentAffairsQueryParams,
  GetCurrentAffairsResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";
import { sql, and } from "drizzle-orm";

const router = Router();
function getUserId(req: any): string { return req.headers["x-user-id"] as string || "demo-user"; }

router.get("/quiz/daily", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const today = new Date().toISOString().split("T")[0];
  let [quiz] = await db.select().from(dailyQuizzesTable).where(eq(dailyQuizzesTable.date, today));
  if (!quiz) {
    const questions = await db.select().from(questionsTable).limit(10);
    const quizQuestions = questions.map(q => ({
      id: q.id, text: q.text, options: JSON.parse(q.optionsJson), marks: q.marks,
      subject: q.subject ?? null, topic: q.topic ?? null
    }));
    const [newQuiz] = await db.insert(dailyQuizzesTable).values({
      id: randomUUID(), date: today, title: `Daily Quiz — ${today}`, type: "mixed",
      questionsJson: JSON.stringify(quizQuestions)
    }).returning();
    quiz = newQuiz;
  }
  const [attempt] = await db.select().from(quizAttemptsTable)
    .where(and(eq(quizAttemptsTable.quizId, quiz.id), eq(quizAttemptsTable.userId, userId)));
  res.json(GetDailyQuizResponse.parse({
    id: quiz.id, date: quiz.date, title: quiz.title, type: quiz.type as any,
    questions: JSON.parse(quiz.questionsJson),
    isCompleted: !!attempt, userScore: attempt ? attempt.score : null
  }));
});

router.post("/quiz/daily/submit", async (req, res): Promise<void> => {
  const body = SubmitDailyQuizBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const userId = getUserId(req);
  const [quiz] = await db.select().from(dailyQuizzesTable).where(eq(dailyQuizzesTable.id, body.data.quizId));
  if (!quiz) { res.status(404).json({ error: "Quiz not found" }); return; }
  const questions: any[] = JSON.parse(quiz.questionsJson);
  const qMap = new Map(questions.map(q => [q.id, q]));
  let correct = 0, incorrect = 0;
  const answers = body.data.answers.map(a => {
    const q = qMap.get(a.questionId);
    if (!q) return { questionId: a.questionId, isCorrect: false, correctOption: "", explanation: "" };
    const isCorrect = a.selectedOption === q.correctOption;
    if (isCorrect) correct++; else incorrect++;
    return { questionId: a.questionId, isCorrect, correctOption: q.correctOption, explanation: "See study materials." };
  });
  const score = (correct / Math.max(questions.length, 1)) * 100;
  await db.insert(quizAttemptsTable).values({
    id: randomUUID(), quizId: quiz.id, userId, score, total: questions.length, correct, incorrect, answersJson: JSON.stringify(answers)
  }).onConflictDoNothing();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const today = new Date().toISOString().split("T")[0];
  const newStreak = user?.lastStudyDate === today ? (user?.currentStreak ?? 0) : (user?.currentStreak ?? 0) + 1;
  await db.update(usersTable).set({ currentStreak: newStreak, lastStudyDate: today }).where(eq(usersTable.id, userId));
  res.json(SubmitDailyQuizResponse.parse({
    quizId: quiz.id, score, total: questions.length, correct, incorrect,
    streakUpdated: true, newStreak, answers
  }));
});

router.get("/quiz/current-affairs", async (req, res): Promise<void> => {
  const questions = await db.select().from(questionsTable)
    .where(eq(questionsTable.subject, "Current Affairs")).limit(20);
  res.json(GetCurrentAffairsResponse.parse(questions.map(q => ({
    id: q.id, text: q.text, options: JSON.parse(q.optionsJson), correctOption: q.correctOption,
    explanation: q.explanation ?? null, subject: q.subject, topic: q.topic ?? null,
    difficulty: q.difficulty, year: q.year ?? null, isPYQ: q.isPYQ, isBookmarked: false
  }))));
});

export default router;
