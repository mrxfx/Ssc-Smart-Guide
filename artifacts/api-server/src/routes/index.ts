import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import testsRouter from "./tests";
import questionsRouter from "./questions";
import notesRouter from "./notes";
import videosRouter from "./videos";
import quizRouter from "./quiz";
import aiRouter from "./ai";
import leaderboardRouter from "./leaderboard";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(testsRouter);
router.use(questionsRouter);
router.use(notesRouter);
router.use(videosRouter);
router.use(quizRouter);
router.use(aiRouter);
router.use(leaderboardRouter);
router.use(notificationsRouter);
router.use(adminRouter);

export default router;
