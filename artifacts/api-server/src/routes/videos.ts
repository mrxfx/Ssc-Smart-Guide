import { Router } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, videosTable, videoProgressTable } from "@workspace/db";
import {
  ListVideosQueryParams,
  ListVideosResponse,
  GetVideoParams,
  GetVideoResponse,
  UpdateVideoProgressParams,
  UpdateVideoProgressBody,
  UpdateVideoProgressResponse,
  GetVideoCategoriesResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();
function getUserId(req: any): string { return req.headers["x-user-id"] as string || "demo-user"; }

async function getProgress(userId: string, videoId: string) {
  const [p] = await db.select().from(videoProgressTable)
    .where(eq(videoProgressTable.userId, userId));
  return p;
}

router.get("/videos", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const videos = await db.select().from(videosTable).orderBy(desc(videosTable.createdAt));
  const progresses = await db.select().from(videoProgressTable).where(eq(videoProgressTable.userId, userId));
  const progressMap = new Map(progresses.map(p => [p.videoId, p]));
  res.json(ListVideosResponse.parse(videos.map(v => {
    const prog = progressMap.get(v.id);
    return {
      id: v.id, title: v.title, subject: v.subject, topic: v.topic ?? null,
      description: v.description ?? null, videoUrl: v.videoUrl ?? null,
      thumbnailUrl: v.thumbnailUrl, duration: v.duration, isPremium: v.isPremium,
      instructor: v.instructor, views: v.views,
      progress: prog ? (prog.watchedSeconds / Math.max(prog.totalSeconds, 1)) * 100 : null,
      createdAt: v.createdAt.toISOString()
    };
  })));
});

router.get("/videos/categories", async (_req, res): Promise<void> => {
  const subjects = await db.select({ subject: videosTable.subject, count: sql<number>`count(*)` })
    .from(videosTable).groupBy(videosTable.subject);
  const icons: Record<string, string> = {
    "General Intelligence": "Brain", "General Knowledge": "Globe",
    "Mathematics": "Calculator", "English": "BookA", "Hindi": "BookOpen",
    "Current Affairs": "Newspaper", "Physical Education": "Dumbbell"
  };
  res.json(GetVideoCategoriesResponse.parse(subjects.map(s => ({
    id: s.subject, name: s.subject, icon: icons[s.subject] ?? "Play", count: Number(s.count), color: null
  }))));
});

router.get("/videos/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = getUserId(req);
  const [video] = await db.select().from(videosTable).where(eq(videosTable.id, raw));
  if (!video) { res.status(404).json({ error: "Video not found" }); return; }
  await db.update(videosTable).set({ views: sql`${videosTable.views} + 1` }).where(eq(videosTable.id, raw));
  const [prog] = await db.select().from(videoProgressTable)
    .where(eq(videoProgressTable.videoId, raw));
  res.json(GetVideoResponse.parse({
    id: video.id, title: video.title, subject: video.subject, topic: video.topic ?? null,
    description: video.description ?? null, videoUrl: video.videoUrl ?? null,
    thumbnailUrl: video.thumbnailUrl, duration: video.duration, isPremium: video.isPremium,
    instructor: video.instructor, views: video.views + 1,
    progress: prog ? (prog.watchedSeconds / Math.max(prog.totalSeconds, 1)) * 100 : null,
    createdAt: video.createdAt.toISOString()
  }));
});

router.post("/videos/:id/progress", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = getUserId(req);
  const body = UpdateVideoProgressBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const { watchedSeconds, totalSeconds } = body.data;
  const completed = watchedSeconds >= totalSeconds * 0.9;
  const percentage = (watchedSeconds / Math.max(totalSeconds, 1)) * 100;
  const [existing] = await db.select().from(videoProgressTable)
    .where(eq(videoProgressTable.videoId, raw));
  if (existing) {
    await db.update(videoProgressTable).set({ watchedSeconds, totalSeconds, completed })
      .where(eq(videoProgressTable.id, existing.id));
  } else {
    await db.insert(videoProgressTable).values({ id: randomUUID(), userId, videoId: raw, watchedSeconds, totalSeconds, completed });
  }
  res.json(UpdateVideoProgressResponse.parse({ videoId: raw, watchedSeconds, totalSeconds, percentage, completed }));
});

export default router;
