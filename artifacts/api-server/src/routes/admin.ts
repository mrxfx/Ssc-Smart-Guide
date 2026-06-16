import { Router } from "express";
import { eq, desc, sql, ilike, and } from "drizzle-orm";
import { db, usersTable, testsTable, questionsTable, notesTable, videosTable, notificationsTable } from "@workspace/db";
import {
  GetAdminStatsResponse,
  ListAdminUsersQueryParams,
  ListAdminUsersResponse,
  GetTestResponse,
  GetQuestionResponse,
  GetNoteResponse,
  GetVideoResponse,
  SendNotificationResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const [premiumCount] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.isPremium, true));
  const [testCount] = await db.select({ count: sql<number>`count(*)` }).from(testsTable);
  const [questionCount] = await db.select({ count: sql<number>`count(*)` }).from(questionsTable);
  const [noteCount] = await db.select({ count: sql<number>`count(*)` }).from(notesTable);
  const [videoCount] = await db.select({ count: sql<number>`count(*)` }).from(videosTable);
  const total = Number(userCount?.count ?? 0);
  const premium = Number(premiumCount?.count ?? 0);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const revenueChart = months.slice(0, 6).map((m, i) => ({ month: m, revenue: 15000 + i * 8000 + Math.random() * 5000 }));
  const userGrowth = months.slice(0, 6).map((m, i) => ({ month: m, count: 200 + i * 150 + Math.floor(Math.random() * 100) }));
  res.json(GetAdminStatsResponse.parse({
    totalUsers: total, premiumUsers: premium, freeUsers: total - premium,
    totalTests: Number(testCount?.count ?? 0), totalQuestions: Number(questionCount?.count ?? 0),
    totalNotes: Number(noteCount?.count ?? 0), totalVideos: Number(videoCount?.count ?? 0),
    revenue: premium * 299, activeToday: Math.floor(total * 0.3), revenueChart, userGrowth
  }));
});

router.get("/admin/users", async (req, res): Promise<void> => {
  const p = ListAdminUsersQueryParams.safeParse(req.query);
  const page = Number(p.success && p.data.page ? p.data.page : 1);
  const limit = 20;
  const offset = (page - 1) * limit;
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);
  const [total] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  res.json(ListAdminUsersResponse.parse({
    users: users.map(u => ({
      ...u, premiumExpiresAt: u.premiumExpiresAt?.toISOString() ?? null,
      joinedAt: u.createdAt.toISOString()
    })),
    total: Number(total?.count ?? 0), page, limit
  }));
});

router.post("/admin/tests", async (req, res): Promise<void> => {
  const id = randomUUID();
  const [test] = await db.insert(testsTable).values({ id, ...req.body }).returning();
  res.status(201).json(GetTestResponse.parse({
    id: test.id, title: test.title, type: test.type, duration: test.duration,
    negativeMarking: test.negativeMarking, maxMarks: test.maxMarks, questions: []
  }));
});

router.post("/admin/questions", async (req, res): Promise<void> => {
  const id = randomUUID();
  const { options, ...rest } = req.body;
  const [question] = await db.insert(questionsTable).values({
    id, ...rest, optionsJson: JSON.stringify(options ?? [])
  }).returning();
  res.status(201).json(GetQuestionResponse.parse({
    id: question.id, text: question.text, options: JSON.parse(question.optionsJson),
    correctOption: question.correctOption, explanation: question.explanation ?? null,
    subject: question.subject, topic: question.topic ?? null, difficulty: question.difficulty,
    year: question.year ?? null, isPYQ: question.isPYQ, isBookmarked: false, aiExplanation: null
  }));
});

router.post("/admin/notes", async (req, res): Promise<void> => {
  const id = randomUUID();
  const [note] = await db.insert(notesTable).values({ id, ...req.body }).returning();
  res.status(201).json(GetNoteResponse.parse({
    ...note, description: note.description ?? null, thumbnailUrl: note.thumbnailUrl ?? null,
    fileSize: note.fileSize ?? null, isBookmarked: false, createdAt: note.createdAt.toISOString()
  }));
});

router.post("/admin/videos", async (req, res): Promise<void> => {
  const id = randomUUID();
  const [video] = await db.insert(videosTable).values({ id, ...req.body }).returning();
  res.status(201).json(GetVideoResponse.parse({
    ...video, topic: video.topic ?? null, description: video.description ?? null,
    videoUrl: video.videoUrl ?? null, progress: null, createdAt: video.createdAt.toISOString()
  }));
});

router.post("/admin/notifications", async (req, res): Promise<void> => {
  const { title, message, type, target } = req.body;
  await db.insert(notificationsTable).values({
    id: randomUUID(), userId: null, title, message, type: type ?? "general", target: target ?? "all"
  });
  res.json(SendNotificationResponse.parse({ success: true, isBookmarked: false }));
});

export default router;
