import { useState } from 'react';
import { Send, Sparkles, Bot, User, Trash2, Check } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../api';

interface AIAction {
  type: 'habit' | 'task' | 'wellness' | 'journal';
  data: Record<string, unknown>;
  applied?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: AIAction;
}

export default function AIAssistant() {
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello ${user?.firstName || user?.username || 'there'}! I'm your Life-OS AI assistant. I can help you with:\n\n• Analyzing your habits and suggesting improvements\n• Prioritizing your tasks based on your patterns\n• Wellness insights and health recommendations\n• Journal reflection and emotional analysis\n• General productivity advice\n\nWhat would you like to explore today?`,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/process', { input: currentInput });
      const aiResponse = res.data;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        action: aiResponse.type !== 'insight' && aiResponse.type !== 'unknown' 
          ? { type: aiResponse.type, data: aiResponse.data } 
          : undefined
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: unknown) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered a synchronization error with the Archive. Please ensure your Gemini API Key is valid.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeWellnessAction = async (data: Record<string, unknown>) => {
    const today = new Date().toISOString().split('T')[0];
    const todayRes = await api.get(`/wellness/date/${today}`);
    const existing = todayRes.data as {
      mood?: { score?: number; emotions?: string[]; notes?: string };
      nutrition?: { waterIntake?: number };
    } | null;

    const nextPayload: Record<string, unknown> = {};
    const currentWater = existing?.nutrition?.waterIntake ?? 0;

    if (typeof data.waterIntake === 'number') {
      nextPayload.nutrition = { waterIntake: currentWater + data.waterIntake };
    } else if (
      data.nutrition &&
      typeof data.nutrition === 'object' &&
      typeof (data.nutrition as { waterIntake?: unknown }).waterIntake === 'number'
    ) {
      nextPayload.nutrition = {
        waterIntake: currentWater + Number((data.nutrition as { waterIntake?: unknown }).waterIntake),
      };
    }

    if (typeof data.mood === 'number') {
      nextPayload.mood = {
        score: data.mood,
        emotions: existing?.mood?.emotions ?? [],
        notes: existing?.mood?.notes,
      };
    } else if (
      data.mood &&
      typeof data.mood === 'object' &&
      typeof (data.mood as { score?: unknown }).score === 'number'
    ) {
      nextPayload.mood = {
        score: Number((data.mood as { score?: unknown }).score),
        emotions: Array.isArray((data.mood as { emotions?: unknown }).emotions)
          ? ((data.mood as { emotions?: unknown }).emotions as string[])
          : existing?.mood?.emotions ?? [],
        notes: typeof (data.mood as { notes?: unknown }).notes === 'string'
          ? (data.mood as { notes?: string }).notes
          : existing?.mood?.notes,
      };
    }

    if (Object.keys(nextPayload).length === 0) {
      throw new Error('not_applicable');
    }

    await api.patch(`/wellness/date/${today}`, nextPayload);
  };

  const applyAction = async (messageId: string, action: AIAction) => {
    try {
      if (action.type === 'wellness') {
        await executeWellnessAction(action.data);
      } else if (action.type === 'journal') {
        const payload = { ...action.data };
        if (!payload.date) {
          payload.date = new Date().toISOString().split('T')[0];
        }
        await api.post('/journal', payload);
      } else {
        const endpoint = `/${action.type}s`;
        await api.post(endpoint, action.data);
      }
      
      setMessages(prev => prev.map(m => 
        m.id === messageId && m.action 
          ? { ...m, action: { ...m.action, applied: true } } 
          : m
      ));
    } catch (error) {
      console.error("Failed to apply action:", error);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Hello ${user?.firstName || user?.username || 'there'}! I'm your Life-OS AI assistant. How can I help you today?`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="h-full lg:h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-accent-assistant" />
            AI Life Assistant
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Your personal AI companion for life optimization
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col card-elevated overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant'
                    ? 'bg-accent-assistant/20 text-accent-assistant'
                    : 'bg-accent-task/20 text-accent-task'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Bot className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === 'assistant'
                    ? 'bg-zinc-800/50 text-zinc-100'
                    : 'bg-accent-task/20 text-text-primary'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>

                {/* AI Suggested Action Card */}
                {message.role === 'assistant' && message.action && (
                  <div className="mt-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-700/50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent-assistant" />
                        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Suggested {message.action.type}
                        </span>
                      </div>
                      {message.action.applied ? (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <Check className="w-3 h-3" /> Committed to Vault
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => message.action && applyAction(message.id, message.action)}
                            className="bg-accent-assistant/10 hover:bg-accent-assistant/20 text-accent-assistant p-1.5 rounded-lg transition-colors"
                            title="Commit to Life-OS"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-zinc-300">
                      {message.action.type === 'task' && (
                        <p><strong>{String(message.action.data.title || '')}</strong> • {String(message.action.data.priority || '')}</p>
                      )}
                      {message.action.type === 'habit' && (
                        <p><strong>{String(message.action.data.name || '')}</strong> • {String(message.action.data.frequency || '')}</p>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-zinc-500 mt-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-assistant/20 text-accent-assistant flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-zinc-800/50 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-accent-assistant rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-accent-assistant rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-accent-assistant rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask me anything about your habits, tasks, wellness..."
              className="input-field flex-1"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="glass-button-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
            <button
               onClick={clearChat}
               className="glass-button p-2 sm:p-3 text-text-muted hover:text-text-primary flex-shrink-0"
               title="Clear chat"
             >
               <Trash2 className="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setInput("Analyze my habits this week")}
          className="glass-button text-sm py-2 px-4"
        >
          Analyze Habits
        </button>
        <button
          onClick={() => setInput("What should I focus on today?")}
          className="glass-button text-sm py-2 px-4"
        >
          Today&apos;s Priorities
        </button>
        <button
          onClick={() => setInput("How can I improve my wellness?")}
          className="glass-button text-sm py-2 px-4"
        >
          Wellness Tips
        </button>
        <button
          onClick={() => setInput("Help me reflect on my week")}
          className="glass-button text-sm py-2 px-4"
        >
          Weekly Reflection
        </button>
      </div>
    </div>
  );
}