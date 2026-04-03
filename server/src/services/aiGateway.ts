import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

let model: GenerativeModel | null = null;

const getModel = () => {
  if (model) return model;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  return model;
};

import { Logger } from '../utils/logger.js';

export interface AIResponse {
  type: 'habit' | 'task' | 'wellness' | 'journal' | 'insight' | 'unknown';
  action: 'create' | 'update' | 'query';
  data: Record<string, unknown>;
  message: string;
}

export interface AIContext {
  userName: string;
  habits: Record<string, unknown>[];
  tasks: Record<string, unknown>[];
  wellness: Record<string, unknown>[];
  journals?: Record<string, unknown>[];
}

const SYSTEM_PROMPT = `
You are the intelligence layer of "Life-OS", a premium unified daily tracker.
Your goal is to parse unstructured user input into structured commands or provide deep, data-driven insights.

SAFETY RULES:
- You are ONLY allowed to suggest "create", "update", or "query" actions.
- You are FORBIDDEN from suggesting "delete" actions. If asked to delete, explain that as an AI assistant, you prioritize data integrity.

SUPPORTED MODULES:
1. Habit: Tracking repetitive actions.
2. Task: One-off to-dos.
3. Wellness: Physiological/mental states.
4. Journal: Daily reflections.
5. Insight: Pure conversation or analysis without a DB action.

CONTEXTUAL AWARENESS:
The user's current state will be provided. Use it to give specific, personalized responses.
If a user says "How am I doing?", look at their habits and tasks to provide a nuanced answer.

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{
  "type": "habit" | "task" | "wellness" | "journal" | "insight" | "unknown",
  "action": "create" | "update" | "query",
  "data": { ... module specific data ... },
  "message": "A refined, professional confirmation or insight message"
}
`;

export const processAIRequest = async (userInput: string, context?: AIContext): Promise<AIResponse> => {
  if (!process.env.GEMINI_API_KEY) {
    return {
      type: 'unknown',
      action: 'query',
      data: {},
      message: "AI capabilities are currently offline. Please provide a valid Gemini API Key in the Archive configuration."
    };
  }

  try {
    const contextualPrompt = context 
      ? `USER_NAME: ${context.userName}\nUSER_DATA_CONTEXT:\n- Habits: ${JSON.stringify(context.habits)}\n- Tasks: ${JSON.stringify(context.tasks)}\n- Wellness: ${JSON.stringify(context.wellness)}\n\n`
      : "";

    const prompt = `${SYSTEM_PROMPT}\n\n${contextualPrompt}User Input: "${userInput}"`;
    const result = await getModel().generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text) as AIResponse;
  } catch (error: unknown) {
    Logger.error("AI Gateway Error:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    const isRateLimit = errMsg.includes('429') || errMsg.includes('quota');
    return {
      type: 'unknown',
      action: 'query',
      data: {},
      message: isRateLimit
        ? "The AI service is temporarily rate-limited. Please wait a moment and try again."
        : "I encountered a synchronization error in the Archive. Please try again."
    };
  }
};
