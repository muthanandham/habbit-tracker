import { Router, Request as ExpressRequest, Response } from "express";
import { processAIRequest } from "../services/aiGateway.js";
import { authenticateToken } from "../middleware/auth.js";
import { Habit } from "../models/Habit.js";
import { Task } from "../models/Task.js";
import { Wellness } from "../models/Wellness.js";
import { User } from "../models/User.js";
import { Journal } from "../models/Journal.js";
import { Logger } from "../utils/logger.js";

interface RequestWithUser extends ExpressRequest {
  user?: {
    userId: string;
    email: string;
  };
}

import { body, validationResult } from "express-validator";

const router = Router();

router.post(
  "/process",
  authenticateToken,
  [
    body("input")
      .trim()
      .notEmpty()
      .withMessage("Missing Archive synchronization string (Input).")
      .isLength({ max: 2000 })
      .withMessage("Input exceeds maximum length (2000 characters).")
      .escape()
  ],
  async (req: RequestWithUser, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { input } = req.body;
    const userId = req.user?.userId;

  try {
    // Fetch context data in parallel
    const [user, habits, tasks, wellness, journals] = await Promise.all([
      User.findById(userId),
      Habit.find({ userId }).limit(10),
      Task.find({ userId }).sort({ createdAt: -1 }).limit(20),
      Wellness.find({ userId }).sort({ date: -1 }).limit(3),
      Journal.find({ userId }).sort({ date: -1 }).limit(5)
    ]);

    const result = await processAIRequest(input, {
      userName: user?.firstName || user?.username || "Friend",
      habits: habits.map(h => ({ name: h.name, frequency: h.frequency, streak: h.streak })),
      tasks: tasks.map(t => ({ title: t.title, priority: t.priority, dueDate: t.dueDate, status: t.status })),
      wellness: wellness.map(w => ({ date: w.date, mood: w.mood.score, water: w.nutrition.waterIntake })),
      journals: journals.map(j => ({ title: j.title, date: j.date, tags: j.tags }))
    });

    res.json(result);
  } catch (error) {
    Logger.error("AI Route Error:", error);
    res.status(500).json({ error: "I encountered a synchronization error in the Archive. Please try again." });
  }
});

router.get("/health", (req, res) => {
  const provider = process.env.AI_PROVIDER || (process.env.HF_TOKEN ? "huggingface" : "gemini");
  const isEnabled = !!(process.env.GEMINI_API_KEY || process.env.HF_TOKEN);
  res.json({ 
    status: isEnabled ? "Synchronized" : "Offline",
    service: provider,
    apiKeyFound: isEnabled
  });
});

export default router;
