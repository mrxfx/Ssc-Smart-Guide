import { Router } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, usersTable, testAttemptsTable, testsTable, quizAttemptsTable, videoProgressTable, bookmarkedQuestionsTable, bookmarkedNotesTable } from "@workspace/db";
import {
  GetUserProfileResponse,
  UpdateUserProfileBody,
  GetDashboardStatsResponse,
  GetUserProgressResponse,
  GetUserAchievementsResponse,
  GetUserAchievementsResponseItem,
  GetUserStreakResponse,
  UpdateStreakResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

function getUserId(req: any): string {
  return req.headers["x-user-id"] as string || "demo-user";
}

router.get("/users/profile", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    const newUser = {
      id: userId,
      name: "SSC GD Student",
      email: `student-${userId}@sscgd.in`,
      phone: null,
      avatar: null,
      role: "student",
      isPremium: false,
      premiumExpiresAt: null,
      totalPoints: 0,
      rank: 0,
      studyHours: 0,
      targetExam: "SSC GD 2025",
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
    };
    await db.insert(usersTable).values(newUser);
    res.json(GetUserProfileResponse.parse({ ...newUser, joinedAt: new Date().toISOString() }));
    return;
  }
  res.json(GetUserProfileResponse.parse({
    ...user,
    premiumExpiresAt: user.premiumExpiresAt?.toISOString() ?? null,
    joinedAt: user.createdAt.toISOString(),
    studyHours: user.studyHours,
  }));
});

router.patch("/users/profile", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = UpdateUserProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, userId)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(GetUserProfileResponse.parse({ ...user, joinedAt: user.createdAt.toISOString() }));
});

router.get("/users/dashboard", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const attempts = await db.select().from(testAttemptsTable).where(eq(testAttemptsTable.userId, userId)).orderBy(desc(testAttemptsTable.createdAt)).limit(10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  
  const testsAttempted = attempts.length;
  const averageScore = testsAttempted > 0 ? attempts.reduce((s, a) => s + a.accuracy, 0) / testsAttempted : 0;
  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(usersTable);

  const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const weeklyProgress = weekDays.map((day) => ({ day, score: Math.random() * 80 + 20, hours: Math.random() * 4 + 1 }));
  const subjects = ["General Intelligence","General Knowledge","Elementary Mathematics","English/Hindi"];
  const subjectWise = subjects.map(s => ({ subject: s, score: Math.floor(Math.random() * 60 + 20), total: 80 }));

  const stats = {
    testsAttempted,
    averageScore: Math.round(averageScore * 10) / 10,
    studyHours: user?.studyHours ?? 0,
    rank: user?.rank ?? 999,
    totalStudents: Number(totalUsers[0]?.count ?? 1),
    streak: user?.currentStreak ?? 0,
    notesRead: 12,
    videosWatched: 8,
    quizScore: 78.5,
    weeklyProgress,
    subjectWise,
  };
  res.json(GetDashboardStatsResponse.parse(stats));
});

router.get("/users/progress", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const attempts = await db.select().from(testAttemptsTable).where(eq(testAttemptsTable.userId, userId));
  const correct = attempts.reduce((s, a) => s + a.correct, 0);
  const incorrect = attempts.reduce((s, a) => s + a.incorrect, 0);
  const skipped = attempts.reduce((s, a) => s + a.skipped, 0);
  const attempted = correct + incorrect + skipped;
  const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
  const subjects = ["General Intelligence","General Knowledge","Elementary Mathematics","English/Hindi"];
  const subjectProgress = subjects.map(s => ({ subject: s, accuracy: Math.random() * 40 + 50, attempted: Math.floor(Math.random() * 100 + 20) }));
  const recentTests = attempts.slice(0, 5).map(a => ({
    id: a.id, testId: a.testId, testTitle: "Mock Test", score: a.score, maxMarks: a.maxMarks,
    accuracy: a.accuracy, attemptedAt: a.createdAt.toISOString(), rank: a.rank, timeTaken: a.timeTaken
  }));
  res.json(GetUserProgressResponse.parse({ overall: { accuracy, attempted, correct, incorrect, skipped }, subjects: subjectProgress, recentTests }));
});

router.get("/users/achievements", async (req, res): Promise<void> => {
  const achievements = [
    { id: "1", title: "First Test", description: "Completed your first mock test", icon: "Trophy", earnedAt: new Date().toISOString(), type: "test", isEarned: true },
    { id: "2", title: "Week Warrior", description: "7-day study streak", icon: "Flame", earnedAt: null, type: "streak", isEarned: false },
    { id: "3", title: "Top Scorer", description: "Score above 90% in any test", icon: "Star", earnedAt: null, type: "score", isEarned: false },
    { id: "4", title: "Quiz Master", description: "Complete 30 daily quizzes", icon: "Brain", earnedAt: null, type: "quiz", isEarned: false },
    { id: "5", title: "Note Taker", description: "Download 10 study notes", icon: "BookOpen", earnedAt: null, type: "notes", isEarned: false },
    { id: "6", title: "Video Learner", description: "Watch 20 video lessons", icon: "Play", earnedAt: null, type: "video", isEarned: false },
  ];
  res.json(GetUserAchievementsResponse.parse(achievements));
});

router.get("/users/streak", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return { date: d.toISOString().split("T")[0], completed: Math.random() > 0.3 };
  });
  res.json(GetUserStreakResponse.parse({
    currentStreak: user?.currentStreak ?? 0,
    longestStreak: user?.longestStreak ?? 0,
    lastStudyDate: user?.lastStudyDate ?? new Date().toISOString().split("T")[0],
    todayCompleted: false,
    weekDays,
  }));
});

router.post("/users/streak", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const today = new Date().toISOString().split("T")[0];
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const newStreak = (user.lastStudyDate === today) ? user.currentStreak : user.currentStreak + 1;
  const longest = Math.max(newStreak, user.longestStreak);
  await db.update(usersTable).set({ currentStreak: newStreak, longestStreak: longest, lastStudyDate: today }).where(eq(usersTable.id, userId));
  res.json(UpdateStreakResponse.parse({ currentStreak: newStreak, longestStreak: longest, lastStudyDate: today, todayCompleted: true, weekDays: [] }));
});

export default router;
