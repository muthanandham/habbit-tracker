import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import * as dotenv from "dotenv";
import { differenceInDays, startOfDay, subDays, getDay } from 'date-fns';
import { Logger } from '../utils/logger.js';

dotenv.config();

let model: GenerativeModel | null = null;
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_HF_MODEL = "openai/gpt-oss-120b:fastest";

type TrackableItem = {
  status?: string;
  streak?: {
    current?: number;
    lastCompletedDate?: string;
  };
};

type Provider = 'gemini' | 'huggingface';

const getProvider = (): Provider => {
  const configured = process.env.AI_PROVIDER?.toLowerCase();
  if (configured === 'huggingface' || process.env.HF_TOKEN) {
    return 'huggingface';
  }
  return 'gemini';
};

const hasAIProviderConfig = (): boolean => {
  return Boolean(process.env.GEMINI_API_KEY || process.env.HF_TOKEN);
};

const getModel = () => {
  if (model) return model;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  return model;
};

// Helper function to calculate completion ratio
const calculateCompletionRatio = (items: TrackableItem[]): number => {
  if (items.length === 0) return 0;

  const completedItems = items.filter(item =>
    // For habits: check if completed recently based on streak or lastCompletedDate
    // For tasks: check if status is 'done'
    item.status === 'done' ||
    (item.streak && item.streak.current > 0 && item.streak.lastCompletedDate &&
     differenceInDays(new Date(), new Date(item.streak.lastCompletedDate)) <= 1)
  ).length;

  return (completedItems / items.length) * 100;
};

// Helper function to analyze day-of-week patterns
const analyzeDayOfWeekPatterns = (items: TrackableItem[], type: 'habit' | 'task'): { missedDays: string[]; advice: string } => {
  // Group items by day of week (0 = Sunday, 1 = Monday, etc.)
  const dayCounts: { [key: number]: { total: number; missed: number } } = {};

  // Initialize counters for each day of week
  for (let i = 0; i < 7; i++) {
    dayCounts[i] = { total: 0, missed: 0 };
  }

  const today = startOfDay(new Date());

  // Look back 4 weeks for pattern analysis
  const fourWeeksAgo = subDays(today, 28);

  items.forEach(item => {
    // For habits, we need to look at completion history
    // Since we don't have full history in the current model, we'll use streak data as proxy
    // For a more accurate analysis, we would need a habit completion log

    // Simplified approach: if habit has a streak > 0, assume it was completed recently
    // This is a limitation - in a real implementation, we'd need a completion tracking table
    const lastCompleted = item.streak?.lastCompletedDate ? new Date(item.streak.lastCompletedDate) : null;
    const isCompletedRecently = lastCompleted &&
      differenceInDays(today, lastCompleted) <= 1 &&
      lastCompleted >= fourWeeksAgo;

    if (lastCompleted && lastCompleted >= fourWeeksAgo) {
      const dayOfWeek = getDay(lastCompleted);
      dayCounts[dayOfWeek].total++;

      if (!isCompletedRecently) {
        dayCounts[dayOfWeek].missed++;
      }
    }
  });

  // Find days with high miss rates (>50% missed)
  const missedDays: string[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let day = 0; day < 7; day++) {
    if (dayCounts[day].total >= 3) { // At least 3 occurrences to be significant
      const missRate = (dayCounts[day].missed / dayCounts[day].total) * 100;
      if (missRate > 50) {
        missedDays.push(dayNames[day]);
      }
    }
  }

  // Generate advice based on missed days
  let advice = '';
  if (missedDays.length > 0) {
    advice = `I notice you often miss ${type}s on ${missedDays.join(', ')}. `;

    if (missedDays.includes('Sunday')) {
      advice += `Sundays can be challenging with relaxed routines. Consider scheduling your ${type}s for Sunday morning or pairing them with a pleasant Sunday activity like coffee or a walk. `;
    }

    if (missedDays.includes('Saturday')) {
      advice += `Weekends often disrupt weekday patterns. Try maintaining a lighter version of your routine on Saturdays to keep the habit alive. `;
    }

    advice += `Would you like help adjusting your ${type} schedule or breaking down these ${type}s into smaller, more manageable actions?`;
  } else {
    advice = `Your ${type} completion patterns look consistent across days of the week. Great job maintaining regularity!`;
  }

  return { missedDays, advice };
};

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

  // Analytical properties added by processAIRequest
  habitCompletionRatio?: number;
  taskCompletionRatio?: number;
  habitPatternAnalysis?: { missedDays: string[]; advice: string };
  taskPatternAnalysis?: { missedDays: string[]; advice: string };
}

const isAIResponse = (value: unknown): value is AIResponse => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AIResponse>;
  return (
    typeof candidate.type === 'string' &&
    typeof candidate.action === 'string' &&
    typeof candidate.message === 'string' &&
    typeof candidate.data === 'object' &&
    candidate.data !== null
  );
};

const extractBalancedJsonObject = (text: string): string | null => {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
};

const sanitizeJsonCandidate = (text: string): string => {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
};

const parseAIResponse = (rawText: string): AIResponse => {
  const candidates = [
    sanitizeJsonCandidate(rawText),
    sanitizeJsonCandidate(extractBalancedJsonObject(rawText) || ''),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (isAIResponse(parsed)) {
        return parsed;
      }
    } catch {
      // Try next candidate
    }
  }

  return {
    type: 'insight',
    action: 'query',
    data: {},
    message: sanitizeJsonCandidate(rawText).slice(0, 1200) || "I'm here, but I couldn't format that response correctly. Please try again.",
  };
};

const SYSTEM_PROMPT = `
You are the intelligence layer of "Life-OS", a premium unified daily tracker.
Your goal is to parse unstructured user input into structured commands or provide deep, data-driven insights.

SAFETY RULES:
- You are ONLY allowed to suggest "create", "update", or "query" actions.
- You are FORBIDDEN from suggesting "delete" actions. If asked to delete, explain that as an AI assistant, you prioritize data integrity.

SUPPORTED MODULES:
1. Habit: Tracking repetitive actions.
   - For creation: { "name": "string", "category": "health"|"productivity"|"mindfulness"|"other", "frequency": "daily"|"weekly", "targetCount": number }
2. Task: One-off to-dos.
   - For creation: { "title": "string", "description": "string", "category": "string" }
3. Wellness: Physiological/mental states.
   - For logging: { "waterIntake": number, "mood": number (1-10), "energy": number (1-10) }
4. Journal: Daily reflections.
   - For reflection: { "content": "string", "title": "string", "mood": number }
5. Insight: Pure conversation or analysis without a DB action.

CONTEXTUAL AWARENESS:
The user's current state will be provided. Use it to give specific, personalized responses.
If a user says "How am I doing?", look at their habits and tasks to provide a nuanced answer.

ADDITIONAL ANALYTICAL CAPABILITIES:
You now receive completion ratio data and day-of-week pattern analysis. Use this to provide advice and identify missed patterns.

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{
  "type": "habit" | "task" | "wellness" | "journal" | "insight" | "unknown",
  "action": "create" | "update" | "query",
  "data": { ... module specific data ... },
  "message": "A refined, professional confirmation or insight message"
}
`;

const callHuggingFace = async (prompt: string): Promise<string> => {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error("Missing HF_TOKEN");
  }

  const modelName = process.env.HF_MODEL || DEFAULT_HF_MODEL;
  return callHuggingFaceRouter(prompt, modelName, token);
};

const callHuggingFaceRouter = async (prompt: string, modelName: string, token: string): Promise<string> => {
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: "system",
          content: "You return only valid JSON. Do not wrap your response in markdown fences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 500,
    }),
  });

  const rawText = await response.text();
  if (!response.ok) {
    if (response.status === 400 && rawText.includes("model_not_supported")) {
      if (modelName !== DEFAULT_HF_MODEL) {
        Logger.warn(`HF model "${modelName}" is not supported by the router. Falling back to "${DEFAULT_HF_MODEL}".`);
        return callHuggingFaceRouter(prompt, DEFAULT_HF_MODEL, token);
      }
    }
    throw new Error(`HF ${response.status}: ${rawText}`);
  }

  const payload = JSON.parse(rawText) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Hugging Face returned an empty response");
  }

  return content.trim();
};

export const processAIRequest = async (userInput: string, context?: AIContext): Promise<AIResponse> => {
  if (!hasAIProviderConfig()) {
    return {
      type: 'unknown',
      action: 'query',
      data: {},
      message: "AI capabilities are currently offline. Please provide a valid AI provider key in the Archive configuration."
    };
  }

  try {
    // Initialize analysis variables
    let habitCompletionRatio: number | null = null;
    let taskCompletionRatio: number | null = null;
    let habitPatternAnalysis: { missedDays: string[]; advice: string } | null = null;
    let taskPatternAnalysis: { missedDays: string[]; advice: string } | null = null;

    // Calculate completion ratios
    if (context?.habits && context.habits.length > 0) {
      habitCompletionRatio = calculateCompletionRatio(context.habits);

      // Analyze day-of-week patterns for habits
      habitPatternAnalysis = analyzeDayOfWeekPatterns(context.habits, 'habit');
    }

    if (context?.tasks && context.tasks.length > 0) {
      taskCompletionRatio = calculateCompletionRatio(context.tasks);

      // Analyze day-of-week patterns for tasks
      taskPatternAnalysis = analyzeDayOfWeekPatterns(context.tasks, 'task');
    }

    // Build contextual prompt with analysis
    const habitRatioText = habitCompletionRatio !== null ? `${habitCompletionRatio.toFixed(1)}%` : 'N/A';
    const taskRatioText = taskCompletionRatio !== null ? `${taskCompletionRatio.toFixed(1)}%` : 'N/A';
    const habitPatternText = habitPatternAnalysis ? `- Habit Pattern Analysis: ${habitPatternAnalysis.advice}\n` : '';
    const taskPatternText = taskPatternAnalysis ? `- Task Pattern Analysis: ${taskPatternAnalysis.advice}\n` : '';

    const contextualPrompt = context
      ? `USER_NAME: ${context.userName}\nUSER_DATA_CONTEXT:\n- Habits: ${JSON.stringify(context.habits)}\n- Tasks: ${JSON.stringify(context.tasks)}\n- Wellness: ${JSON.stringify(context.wellness)}\n- Habit Completion Ratio: ${habitRatioText}\n- Task Completion Ratio: ${taskRatioText}\n${habitPatternText}${taskPatternText}\n\n`
      : "";

    const prompt = `${SYSTEM_PROMPT}\n\n${contextualPrompt}User Input: "${userInput}"`;
    let text: string;

    if (getProvider() === 'huggingface') {
      text = await callHuggingFace(prompt);
    } else {
      const result = await getModel().generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      });
      const response = await result.response;
      text = response.text();
    }

    return parseAIResponse(text);
  } catch (error: unknown) {
    Logger.error("AI Gateway Error:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    const isRateLimit = errMsg.includes('429') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit');
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
