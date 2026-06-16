import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, notesTable, bookmarkedNotesTable } from "@workspace/db";
import {
  ListNotesQueryParams,
  ListNotesResponse,
  GetNoteParams,
  GetNoteResponse,
  BookmarkNoteParams,
  BookmarkNoteResponse,
  GetBookmarkedNotesResponse,
  GetNoteSubjectsResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";

const router = Router();
function getUserId(req: any): string { return req.headers["x-user-id"] as string || "demo-user"; }

function parseNote(n: any, bookmarkedIds: Set<string>) {
  return {
    id: n.id, title: n.title, subject: n.subject, chapter: n.chapter,
    description: n.description ?? null, fileUrl: n.fileUrl, thumbnailUrl: n.thumbnailUrl ?? null,
    fileSize: n.fileSize ?? null, isPremium: n.isPremium, downloadCount: n.downloadCount,
    isBookmarked: bookmarkedIds.has(n.id), createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt
  };
}

router.get("/notes", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const notes = await db.select().from(notesTable).orderBy(desc(notesTable.createdAt));
  const bookmarks = await db.select().from(bookmarkedNotesTable).where(eq(bookmarkedNotesTable.userId, userId));
  const bookmarkedIds = new Set(bookmarks.map(b => b.noteId));
  res.json(ListNotesResponse.parse(notes.map(n => parseNote(n, bookmarkedIds))));
});

router.get("/notes/bookmarks", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const bookmarks = await db.select({ bn: bookmarkedNotesTable, n: notesTable })
    .from(bookmarkedNotesTable).leftJoin(notesTable, eq(bookmarkedNotesTable.noteId, notesTable.id))
    .where(eq(bookmarkedNotesTable.userId, userId));
  const bookmarkedIds = new Set(bookmarks.map(b => b.bn.noteId));
  res.json(GetBookmarkedNotesResponse.parse(bookmarks.filter(b => b.n).map(b => parseNote(b.n!, bookmarkedIds))));
});

router.get("/notes/subjects", async (_req, res): Promise<void> => {
  const subjects = await db.select({ subject: notesTable.subject, count: sql<number>`count(*)` })
    .from(notesTable).groupBy(notesTable.subject);
  const icons: Record<string, string> = { "General Intelligence": "Brain", "General Knowledge": "Globe", "Mathematics": "Calculator", "English": "BookA", "Hindi": "BookOpen", "Current Affairs": "Newspaper" };
  const colors: Record<string, string> = { "General Intelligence": "#6366f1", "General Knowledge": "#f59e0b", "Mathematics": "#10b981", "English": "#3b82f6", "Hindi": "#ec4899", "Current Affairs": "#f97316" };
  res.json(GetNoteSubjectsResponse.parse(subjects.map(s => ({
    id: s.subject, name: s.subject, icon: icons[s.subject] ?? "Book", count: Number(s.count), color: colors[s.subject] ?? null
  }))));
});

router.get("/notes/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = getUserId(req);
  const [note] = await db.select().from(notesTable).where(eq(notesTable.id, raw));
  if (!note) { res.status(404).json({ error: "Note not found" }); return; }
  const bookmarks = await db.select().from(bookmarkedNotesTable).where(and(eq(bookmarkedNotesTable.userId, userId), eq(bookmarkedNotesTable.noteId, raw)));
  res.json(GetNoteResponse.parse(parseNote(note, new Set(bookmarks.length > 0 ? [raw] : []))));
});

router.post("/notes/:id/bookmark", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = getUserId(req);
  const existing = await db.select().from(bookmarkedNotesTable)
    .where(and(eq(bookmarkedNotesTable.userId, userId), eq(bookmarkedNotesTable.noteId, raw)));
  if (existing.length > 0) {
    await db.delete(bookmarkedNotesTable).where(and(eq(bookmarkedNotesTable.userId, userId), eq(bookmarkedNotesTable.noteId, raw)));
    res.json(BookmarkNoteResponse.parse({ success: true, isBookmarked: false }));
  } else {
    await db.insert(bookmarkedNotesTable).values({ id: randomUUID(), userId, noteId: raw });
    res.json(BookmarkNoteResponse.parse({ success: true, isBookmarked: true }));
  }
});

export default router;
