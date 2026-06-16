import { Router } from "express";
import { eq, desc, or, isNull } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import {
  ListNotificationsResponse,
  MarkNotificationReadParams,
  MarkNotificationReadResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();
function getUserId(req: any): string { return req.headers["x-user-id"] as string || "demo-user"; }

router.get("/notifications", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const notifications = await db.select().from(notificationsTable)
    .where(or(eq(notificationsTable.userId, userId), isNull(notificationsTable.userId)))
    .orderBy(desc(notificationsTable.createdAt)).limit(30);
  res.json(ListNotificationsResponse.parse(notifications.map(n => ({
    id: n.id, title: n.title, message: n.message, type: n.type as any,
    isRead: n.isRead, createdAt: n.createdAt.toISOString()
  }))));
});

router.post("/notifications/:id/read", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, raw));
  res.json(MarkNotificationReadResponse.parse({ success: true, isBookmarked: false }));
});

export default router;
