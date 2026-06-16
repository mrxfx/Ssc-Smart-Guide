import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { GetGlobalLeaderboardQueryParams, GetGlobalLeaderboardResponse } from "@workspace/api-zod";

const router = Router();
function getUserId(req: any): string { return req.headers["x-user-id"] as string || "demo-user"; }

router.get("/leaderboard", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.totalPoints)).limit(50);
  const leaderboard = users.map((u, i) => ({
    rank: i + 1, userId: u.id, name: u.name, avatar: u.avatar ?? null,
    score: u.totalPoints, accuracy: 75 + Math.random() * 20,
    isCurrentUser: u.id === userId
  }));
  res.json(GetGlobalLeaderboardResponse.parse(leaderboard));
});

export default router;
