import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, chatMessagesTable, questionsTable } from "@workspace/db";
import {
  AskAIBody, AskAIResponse,
  ExplainQuestionBody, ExplainQuestionResponse,
  GenerateStudyPlanBody, GenerateStudyPlanResponse,
  AnalyzeTestResultBody, AnalyzeTestResultResponse,
  ChatWithAIBody, ChatWithAIResponse,
  GetChatHistoryResponse,
} from "@workspace/api-zod";
import OpenAI from "openai";
import { randomUUID } from "crypto";

const router = Router();
function getUserId(req: any): string { return req.headers["x-user-id"] as string || "demo-user"; }

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SSC_SYSTEM_PROMPT = `You are SSC GD Smart Coach AI — an expert AI tutor for SSC GD (Staff Selection Commission General Duty) Constable exam preparation. 
You help Indian students prepare for this competitive exam. 
The exam covers: General Intelligence & Reasoning, General Knowledge & General Awareness, Elementary Mathematics, and English/Hindi Language.
Give concise, accurate, exam-focused answers. Use simple language. When explaining concepts, relate them to the SSC GD exam pattern.
Always be encouraging and motivating. Answer in the language the student asks (English or Hindi).`;

router.post("/ai/ask", async (req, res): Promise<void> => {
  const body = AskAIBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SSC_SYSTEM_PROMPT },
        { role: "user", content: `Subject: ${body.data.subject ?? "General"}\n\nQuestion: ${body.data.question}\n\n${body.data.context ? `Context: ${body.data.context}` : ""}` }
      ],
      max_tokens: 800,
    });
    const response = completion.choices[0]?.message?.content ?? "I could not generate a response. Please try again.";
    const conversationId = randomUUID();
    res.json(AskAIResponse.parse({ response, conversationId, suggestions: ["Explain in Hindi", "Give an example", "What are related topics?"] }));
  } catch (err) {
    res.json(AskAIResponse.parse({ response: "AI is temporarily unavailable. Please check your study materials or try again later.", conversationId: randomUUID(), suggestions: [] }));
  }
});

router.post("/ai/explain", async (req, res): Promise<void> => {
  const body = ExplainQuestionBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  try {
    const [question] = await db.select().from(questionsTable).where(eq(questionsTable.id, body.data.questionId));
    if (!question) { res.status(404).json({ error: "Question not found" }); return; }
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SSC_SYSTEM_PROMPT },
        { role: "user", content: `Explain the answer to this SSC GD exam question in detail:\n\nQuestion: ${question.text}\n\nOptions: ${question.optionsJson}\n\nCorrect Answer: Option ${question.correctOption}\n\nBasic Explanation: ${question.explanation ?? "Not available"}\n\nProvide a comprehensive explanation suitable for SSC GD preparation.` }
      ],
      max_tokens: 600,
    });
    const response = completion.choices[0]?.message?.content ?? question.explanation ?? "See study materials.";
    res.json(ExplainQuestionResponse.parse({ response, conversationId: randomUUID(), suggestions: [] }));
  } catch (err) {
    res.json(ExplainQuestionResponse.parse({ response: "AI explanation temporarily unavailable.", conversationId: randomUUID(), suggestions: [] }));
  }
});

router.post("/ai/study-plan", async (req, res): Promise<void> => {
  const body = GenerateStudyPlanBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SSC_SYSTEM_PROMPT },
        { role: "user", content: `Create a detailed SSC GD exam study plan:\n- Target exam date: ${body.data.targetDate}\n- Weak subjects: ${body.data.weakSubjects.join(", ")}\n- Study hours per day: ${body.data.studyHoursPerDay}\n- Current level: ${body.data.currentLevel ?? "intermediate"}\n\nProvide a week-by-week plan with specific topics and goals. Format the response as a structured plan.` }
      ],
      max_tokens: 1000,
    });
    const plan = completion.choices[0]?.message?.content ?? "Focus on all four subjects equally with daily mock tests.";
    const daysToExam = Math.max(1, Math.ceil((new Date(body.data.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    const totalWeeks = Math.ceil(daysToExam / 7);
    const weeks = Array.from({ length: Math.min(totalWeeks, 12) }, (_, i) => ({
      week: i + 1,
      topics: body.data.weakSubjects.slice(0, 2).map(s => `${s} - Week ${i+1} Topics`),
      goals: [`Complete ${body.data.studyHoursPerDay * 7} hours of study`, "Take 2 mock tests"]
    }));
    res.json(GenerateStudyPlanResponse.parse({ plan, totalWeeks, dailyHours: body.data.studyHoursPerDay, weeks }));
  } catch (err) {
    res.json(GenerateStudyPlanResponse.parse({ plan: "Study all 4 subjects daily. Take mock tests every 3 days.", totalWeeks: 8, dailyHours: body.data.studyHoursPerDay ?? 4, weeks: [] }));
  }
});

router.post("/ai/analyze-test", async (req, res): Promise<void> => {
  const body = AnalyzeTestResultBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SSC_SYSTEM_PROMPT },
        { role: "user", content: `Analyze this SSC GD test result and provide actionable improvement tips:\nTest ID: ${body.data.testResultId}\n\nGive specific advice on:\n1. Time management\n2. Weak areas to focus on\n3. Study strategy\n4. Practice recommendations` }
      ],
      max_tokens: 600,
    });
    const response = completion.choices[0]?.message?.content ?? "Focus on your weak subjects and practice more mock tests.";
    res.json(AnalyzeTestResultResponse.parse({ response, conversationId: randomUUID(), suggestions: ["Show weak topics", "Create study plan", "Take a similar test"] }));
  } catch (err) {
    res.json(AnalyzeTestResultResponse.parse({ response: "Keep practicing! Focus on accuracy over speed.", conversationId: randomUUID(), suggestions: [] }));
  }
});

router.get("/ai/chat/history", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const messages = await db.select().from(chatMessagesTable)
    .where(eq(chatMessagesTable.userId, userId)).orderBy(desc(chatMessagesTable.createdAt)).limit(50);
  res.json(GetChatHistoryResponse.parse(messages.map(m => ({
    id: m.id, role: m.role, content: m.content, conversationId: m.conversationId, createdAt: m.createdAt.toISOString()
  }))));
});

router.post("/ai/chat", async (req, res): Promise<void> => {
  const body = ChatWithAIBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const userId = getUserId(req);
  const conversationId = body.data.conversationId ?? randomUUID();
  const messageId = randomUUID();
  await db.insert(chatMessagesTable).values({ id: messageId, userId, conversationId, role: "user", content: body.data.message });
  try {
    const history = await db.select().from(chatMessagesTable)
      .where(eq(chatMessagesTable.conversationId, conversationId)).orderBy(chatMessagesTable.createdAt).limit(10);
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SSC_SYSTEM_PROMPT },
        ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      max_tokens: 800,
    });
    const response = completion.choices[0]?.message?.content ?? "I'm here to help with your SSC GD preparation!";
    await db.insert(chatMessagesTable).values({ id: randomUUID(), userId, conversationId, role: "assistant", content: response });
    res.json(ChatWithAIResponse.parse({ response, conversationId, suggestions: ["More details", "Give example", "Next topic"] }));
  } catch (err) {
    const fallback = "I'm having trouble connecting right now. Try asking again!";
    await db.insert(chatMessagesTable).values({ id: randomUUID(), userId, conversationId, role: "assistant", content: fallback });
    res.json(ChatWithAIResponse.parse({ response: fallback, conversationId, suggestions: [] }));
  }
});

export default router;
