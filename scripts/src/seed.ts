import { randomUUID } from "crypto";
import { db, usersTable, testsTable, questionsTable, notesTable, videosTable, notificationsTable } from "@workspace/db";

const subjects = ["General Intelligence", "General Knowledge", "Mathematics", "English", "Current Affairs"];
const difficulties = ["easy", "medium", "hard"];

const sampleQuestions = [
  { text: "Which article of the Indian Constitution guarantees the Right to Equality?", subject: "General Knowledge", options: [{ id: "a", text: "Article 12" }, { id: "b", text: "Article 14" }, { id: "c", text: "Article 19" }, { id: "d", text: "Article 21" }], correct: "b", explanation: "Article 14 guarantees the Right to Equality — equal protection of laws and equality before law for all persons in India." },
  { text: "If A is the mother of B, and B is the brother of C, how is A related to C?", subject: "General Intelligence", options: [{ id: "a", text: "Sister" }, { id: "b", text: "Aunt" }, { id: "c", text: "Mother" }, { id: "d", text: "Grandmother" }], correct: "c", explanation: "A is the mother of B. B is the brother of C, so C is also A's child. Therefore A is the Mother of C." },
  { text: "The value of √(0.0625) is:", subject: "Mathematics", options: [{ id: "a", text: "0.025" }, { id: "b", text: "0.25" }, { id: "c", text: "2.5" }, { id: "d", text: "0.025" }], correct: "b", explanation: "√(0.0625) = √(625/10000) = 25/100 = 0.25" },
  { text: "Who wrote the national song 'Vande Mataram'?", subject: "General Knowledge", options: [{ id: "a", text: "Rabindranath Tagore" }, { id: "b", text: "Bankim Chandra Chattopadhyay" }, { id: "c", text: "Sarojini Naidu" }, { id: "d", text: "Mahatma Gandhi" }], correct: "b", explanation: "Vande Mataram was written by Bankim Chandra Chattopadhyay in his novel Anandamath (1882)." },
  { text: "Find the odd one out: 2, 5, 10, 17, 26, 37, 50, 64", subject: "General Intelligence", options: [{ id: "a", text: "37" }, { id: "b", text: "50" }, { id: "c", text: "64" }, { id: "d", text: "26" }], correct: "c", explanation: "The pattern is: 1²+1, 2²+1, 3²+1, 4²+1... giving 2,5,10,17,26,37,50,65. So 64 should be 65 — 64 is the odd one out." },
  { text: "The headquarters of the International Monetary Fund (IMF) is located in:", subject: "General Knowledge", options: [{ id: "a", text: "New York" }, { id: "b", text: "Geneva" }, { id: "c", text: "Washington D.C." }, { id: "d", text: "London" }], correct: "c", explanation: "The IMF headquarters is in Washington D.C., USA. It was established in 1944 after the Bretton Woods Conference." },
  { text: "A train travels 360 km in 4 hours. Its speed in m/s is:", subject: "Mathematics", options: [{ id: "a", text: "25 m/s" }, { id: "b", text: "100 m/s" }, { id: "c", text: "90 m/s" }, { id: "d", text: "22.5 m/s" }], correct: "a", explanation: "Speed = 360/4 = 90 km/h. Convert to m/s: 90 × (1000/3600) = 90/3.6 = 25 m/s" },
  { text: "Choose the correctly spelled word:", subject: "English", options: [{ id: "a", text: "Accomodation" }, { id: "b", text: "Accommodation" }, { id: "c", text: "Accommadation" }, { id: "d", text: "Acomodation" }], correct: "b", explanation: "The correct spelling is 'Accommodation' — remember double 'c' and double 'm'." },
  { text: "Who is known as the 'Iron Man of India'?", subject: "General Knowledge", options: [{ id: "a", text: "Jawaharlal Nehru" }, { id: "b", text: "Mahatma Gandhi" }, { id: "c", text: "Sardar Vallabhbhai Patel" }, { id: "d", text: "Bhagat Singh" }], correct: "c", explanation: "Sardar Vallabhbhai Patel is called the Iron Man of India for his role in uniting 562 princely states into the Indian Union." },
  { text: "If MANGO is coded as NBOIP, how is APPLE coded?", subject: "General Intelligence", options: [{ id: "a", text: "BQPMF" }, { id: "b", text: "BQQMF" }, { id: "c", text: "ZOONF" }, { id: "d", text: "BQPPF" }], correct: "b", explanation: "Each letter is shifted forward by 1: A→B, P→Q, P→Q, L→M, E→F. So APPLE = BQQMF. Wait — correct answer is BQQMF." },
  { text: "The largest planet in our solar system is:", subject: "General Knowledge", options: [{ id: "a", text: "Saturn" }, { id: "b", text: "Neptune" }, { id: "c", text: "Jupiter" }, { id: "d", text: "Uranus" }], correct: "c", explanation: "Jupiter is the largest planet in our solar system. It is so large that all other planets could fit inside it." },
  { text: "LCM of 12, 15, and 20 is:", subject: "Mathematics", options: [{ id: "a", text: "30" }, { id: "b", text: "60" }, { id: "c", text: "120" }, { id: "d", text: "240" }], correct: "b", explanation: "12 = 2²×3, 15 = 3×5, 20 = 2²×5. LCM = 2²×3×5 = 60." },
  { text: "Who was the first woman Prime Minister of India?", subject: "General Knowledge", options: [{ id: "a", text: "Sonia Gandhi" }, { id: "b", text: "Pratibha Patil" }, { id: "c", text: "Indira Gandhi" }, { id: "d", text: "Sarojini Naidu" }], correct: "c", explanation: "Indira Gandhi was India's first and only female Prime Minister, serving from 1966–1977 and 1980–1984." },
  { text: "Direction: A person walks 10m North, then turns right and walks 5m, then turns right and walks 10m. In which direction is he facing?", subject: "General Intelligence", options: [{ id: "a", text: "North" }, { id: "b", text: "South" }, { id: "c", text: "East" }, { id: "d", text: "West" }], correct: "b", explanation: "Starting facing North → walks 10m. Turns right (now facing East) → walks 5m. Turns right (now facing South) → walks 10m. Now facing South." },
  { text: "The Fundamental Duties of Indian citizens are mentioned in which part of the Constitution?", subject: "General Knowledge", options: [{ id: "a", text: "Part III" }, { id: "b", text: "Part IV" }, { id: "c", text: "Part IV-A" }, { id: "d", text: "Part V" }], correct: "c", explanation: "Fundamental Duties are in Part IV-A (Article 51A) of the Constitution, added by the 42nd Amendment in 1976." },
];

const sampleNotes = [
  { subject: "General Intelligence", chapter: "Blood Relations", title: "Blood Relations — Complete Guide", description: "Complete guide on blood relation questions for SSC GD with solved examples and shortcuts", fileUrl: "https://example.com/blood-relations.pdf", isPremium: false },
  { subject: "General Knowledge", chapter: "Indian Polity", title: "Indian Constitution — Important Articles", description: "All important articles of Indian Constitution with easy-to-remember mnemonics", fileUrl: "https://example.com/constitution.pdf", isPremium: false },
  { subject: "Mathematics", chapter: "Number System", title: "Number System — Tricks & Shortcuts", description: "Quick shortcuts for number system problems in SSC GD exam", fileUrl: "https://example.com/number-system.pdf", isPremium: false },
  { subject: "General Knowledge", chapter: "History", title: "Modern Indian History — Complete Notes", description: "Comprehensive notes covering 1857 revolt to Independence with important dates", fileUrl: "https://example.com/modern-history.pdf", isPremium: true },
  { subject: "English", chapter: "Grammar", title: "English Grammar — SSC GD Pattern", description: "Grammar rules, error detection, fill in the blanks for SSC GD level", fileUrl: "https://example.com/english-grammar.pdf", isPremium: false },
  { subject: "Mathematics", chapter: "Profit & Loss", title: "Profit & Loss — Formula Sheet", description: "All formulas with 50 solved examples at SSC GD difficulty", fileUrl: "https://example.com/profit-loss.pdf", isPremium: false },
  { subject: "Current Affairs", chapter: "2024 Events", title: "Current Affairs 2024 — Annual Compilation", description: "Complete 2024 current affairs for SSC GD exam preparation", fileUrl: "https://example.com/current-affairs-2024.pdf", isPremium: true },
  { subject: "General Intelligence", chapter: "Coding-Decoding", title: "Coding Decoding — All Patterns", description: "All types of coding-decoding with practice questions", fileUrl: "https://example.com/coding-decoding.pdf", isPremium: false },
];

const sampleVideos = [
  { subject: "General Intelligence", title: "Mastering Blood Relations — Full Chapter", duration: 2700, instructor: "Rajesh Kumar", isPremium: false, thumbnailUrl: "https://picsum.photos/seed/v1/640/360" },
  { subject: "General Knowledge", title: "Indian Constitution — Articles for SSC GD", duration: 3600, instructor: "Priya Sharma", isPremium: false, thumbnailUrl: "https://picsum.photos/seed/v2/640/360" },
  { subject: "Mathematics", title: "Percentage — Lightning Fast Methods", duration: 2400, instructor: "Vikram Singh", isPremium: false, thumbnailUrl: "https://picsum.photos/seed/v3/640/360" },
  { subject: "General Intelligence", title: "Syllogism — Master Class", duration: 1800, instructor: "Rajesh Kumar", isPremium: true, thumbnailUrl: "https://picsum.photos/seed/v4/640/360" },
  { subject: "English", title: "Reading Comprehension — Strategy & Practice", duration: 2100, instructor: "Anita Verma", isPremium: false, thumbnailUrl: "https://picsum.photos/seed/v5/640/360" },
  { subject: "Mathematics", title: "Time & Work — Shortcut Tricks", duration: 1950, instructor: "Vikram Singh", isPremium: false, thumbnailUrl: "https://picsum.photos/seed/v6/640/360" },
  { subject: "General Knowledge", title: "Geography of India — Maps & Facts", duration: 3300, instructor: "Priya Sharma", isPremium: true, thumbnailUrl: "https://picsum.photos/seed/v7/640/360" },
  { subject: "General Intelligence", title: "Series Completion — All Types", duration: 2250, instructor: "Rajesh Kumar", isPremium: false, thumbnailUrl: "https://picsum.photos/seed/v8/640/360" },
];

async function seed() {
  console.log("Seeding database...");

  const testId1 = randomUUID();
  const testId2 = randomUUID();
  const testId3 = randomUUID();

  await db.insert(testsTable).values([
    { id: testId1, title: "SSC GD Full Mock Test — Set 1", type: "full", totalQuestions: 80, duration: 60, maxMarks: 80, negativeMarking: 0.25, isPremium: false, description: "Complete SSC GD pattern mock test covering all 4 subjects" },
    { id: testId2, title: "General Intelligence — Chapter Test", type: "chapter", subject: "General Intelligence", totalQuestions: 25, duration: 20, maxMarks: 25, negativeMarking: 0.25, isPremium: false, description: "Chapter-wise test for General Intelligence & Reasoning" },
    { id: testId3, title: "SSC GD PYQ — 2023 Exam Paper", type: "pyq", totalQuestions: 80, duration: 60, maxMarks: 80, negativeMarking: 0.25, isPremium: true, year: 2023, description: "Official SSC GD 2023 question paper with detailed solutions" },
  ]).onConflictDoNothing();

  for (const q of sampleQuestions) {
    await db.insert(questionsTable).values({
      id: randomUUID(), text: q.text, optionsJson: JSON.stringify(q.options),
      correctOption: q.correct, explanation: q.explanation, subject: q.subject,
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      isPYQ: Math.random() > 0.7, year: Math.random() > 0.5 ? 2022 + Math.floor(Math.random() * 3) : null,
      testId: Math.random() > 0.5 ? testId1 : null,
    }).onConflictDoNothing();
  }

  for (const n of sampleNotes) {
    await db.insert(notesTable).values({
      id: randomUUID(), title: n.title, subject: n.subject, chapter: n.chapter,
      description: n.description, fileUrl: n.fileUrl, isPremium: n.isPremium,
    }).onConflictDoNothing();
  }

  for (const v of sampleVideos) {
    await db.insert(videosTable).values({
      id: randomUUID(), title: v.title, subject: v.subject, thumbnailUrl: v.thumbnailUrl,
      duration: v.duration, isPremium: v.isPremium, instructor: v.instructor,
    }).onConflictDoNothing();
  }

  await db.insert(notificationsTable).values([
    { id: randomUUID(), userId: null, title: "Welcome to SSC GD Smart Coach!", message: "Start your preparation journey today. Attempt your first mock test and track your progress.", type: "general", target: "all" },
    { id: randomUUID(), userId: null, title: "New Mock Test Added", message: "SSC GD Full Mock Test Set 2 is now available. Test yourself with 80 fresh questions.", type: "test", target: "all" },
    { id: randomUUID(), userId: null, title: "Daily Quiz is Live!", message: "Today's daily quiz is now live. Complete it to maintain your streak and earn points.", type: "quiz", target: "all" },
  ]).onConflictDoNothing();

  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
