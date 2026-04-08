import { useState } from 'react';

import { 
  Send, 
  Sparkles, 
  Check, 
  History, 
  ChevronRight,
  BrainCircuit,
  Terminal,
  Clock
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import api from '../api';
import { ModuleIcon } from '../components/ModuleIcon';

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
      content: `Hello ${user?.firstName || user?.username || 'there'}! I am the Archive Intelligence Layer.\n\nI have indexed your bio-metrics, habits, and task vectors. I can help you with:\n\n• Pattern analysis and habit optimization\n• Dynamic task prioritization\n• Wellness trajectory insights\n• Semantic search through your history\n\nWhat would you like to explore today?`,
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
        content: "I encountered a synchronization error with the Archive Intelligence hardware. Please verify your connection protocols.",
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
    const existing = todayRes.data;

    const nextPayload: Record<string, unknown> = {};
    const currentWater = existing?.nutrition?.waterIntake ?? 0;

    if (typeof data.waterIntake === 'number') {
      nextPayload.nutrition = { waterIntake: currentWater + data.waterIntake };
    }
    
    if (typeof data.mood === 'number') {
      nextPayload.mood = {
        score: data.mood,
        emotions: existing?.mood?.emotions ?? [],
        notes: existing?.mood?.notes,
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
      
      // Notify other tabs/components
      window.dispatchEvent(new CustomEvent('lifeos:entity-updated', { detail: { entity: action.type } }));
    } catch (error) {
      console.error("Failed to apply action:", error);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Hello ${user?.firstName || user?.username || 'there'}! The Archive Intelligence Layer is reset and ready. How shall we proceed?`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="h-full lg:h-[calc(100vh-6rem)] flex flex-col max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4 sm:px-0">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-assistant/10 border border-accent-assistant/20 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-assistant">
            <BrainCircuit className="w-3 h-3" />
            Neural Protocol Active
          </div>
          <h1 className="text-4xl font-heading font-bold text-text-primary tracking-tight">
            Archive <span className="text-accent-assistant">Intelligence.</span>
          </h1>
          <p className="text-text-secondary text-sm max-w-md">
            Contextual awareness driven by your personal data archive. Proactive, precise, and private.
          </p>
        </div>
        <button 
          onClick={clearChat}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-surface border border-border-subtle text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-primary hover:border-border-bright transition-all"
        >
          <History className="w-3 h-3" />
          Reset Session
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-bg-surface/30 border border-border-subtle rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Visual Identity */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 ${
                  message.role === 'assistant'
                    ? 'bg-accent-assistant/10 border-accent-assistant/20 text-accent-assistant shadow-lg shadow-accent-assistant/5'
                    : 'bg-bg-elevated border-border-subtle text-text-secondary shadow-sm'
                }`}>
                  {message.role === 'assistant' ? <Sparkles className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
                </div>

                {/* Message Content */}
                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${message.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                    message.role === 'assistant'
                      ? 'bg-bg-surface border border-border-subtle text-text-primary shadow-sm'
                      : 'bg-accent-assistant text-white font-medium shadow-xl shadow-accent-assistant/10'
                  }`}>
                    {message.content}

                    {/* Actionable Intelligence Cards */}
                    {message.role === 'assistant' && message.action && (
                      <div className="mt-6 p-5 bg-bg-app rounded-2xl border border-accent-assistant/20 relative overflow-hidden group/action">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/action:opacity-[0.08] transition-opacity">
                            <ModuleIcon name={message.action.type === 'habit' ? 'skill' : message.action.type === 'task' ? 'plan' : message.action.type === 'wellness' ? 'smile' : 'journal'} size={100} module={message.action.type} />
                        </div>

                        <div className="relative z-10 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ModuleIcon name={message.action.type === 'habit' ? 'skill' : message.action.type === 'task' ? 'plan' : message.action.type === 'wellness' ? 'smile' : 'journal'} size={14} module={message.action.type} />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                Proposed {message.action.type}
                              </span>
                            </div>
                            {message.action.applied && (
                              <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 uppercase tracking-widest">
                                <Check className="w-3 h-3" /> Committed to Vault
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            {message.action.type === 'task' && (
                              <>
                                <h4 className="font-heading font-bold text-lg text-text-primary capitalize">{String(message.action.data.title || 'New Task')}</h4>
                                <p className="text-xs text-text-secondary flex items-center gap-2">
                                  Priority: <span className="text-accent-assistant uppercase font-bold">{String(message.action.data.priority || 'Medium')}</span>
                                </p>
                              </>
                            )}
                            {message.action.type === 'habit' && (
                              <>
                                <h4 className="font-heading font-bold text-lg text-text-primary capitalize">{String(message.action.data.name || 'New Habit')}</h4>
                                <p className="text-xs text-text-secondary flex items-center gap-2">
                                  Frequency: <span className="text-accent-assistant uppercase font-bold">{String(message.action.data.frequency || 'Daily')}</span>
                                </p>
                              </>
                            )}
                            {message.action.type === 'wellness' && (
                                <h4 className="font-heading font-bold text-lg text-text-primary">Update Wellness Record</h4>
                            )}
                            {message.action.type === 'journal' && (
                                <h4 className="font-heading font-bold text-lg text-text-primary">{String(message.action.data.title || 'New Reflection')}</h4>
                            )}
                          </div>

                          {!message.action.applied && (
                            <button 
                              onClick={() => message.action && applyAction(message.id, message.action)}
                              className="w-full flex items-center justify-center gap-2 bg-text-primary text-bg-app py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-accent-assistant transition-all group-hover/action:scale-[1.02]"
                            >
                              Commit to Life-OS
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      {message.role === 'assistant' ? 'Archive AI' : user?.username || 'Observer'}
                    </span>
                    <span className="text-[10px] text-text-muted/40">•</span>
                    <span className="text-[10px] text-text-muted/40">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-accent-assistant/5 border border-accent-assistant/10 text-accent-assistant animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-accent-assistant rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-accent-assistant rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-accent-assistant rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Console Input Area */}
        <div className="p-6 md:p-8 bg-bg-app/50 border-t border-border-subtle">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Initiate prompt sequence..."
                  className="w-full bg-bg-surface border border-border-subtle rounded-2xl pl-12 pr-4 py-4 text-sm text-text-primary focus:border-accent-assistant outline-none transition-all shadow-inner focus:ring-1 focus:ring-accent-assistant/20"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-accent-assistant text-white p-4 rounded-2xl shadow-xl shadow-accent-assistant/20 disabled:opacity-30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* System Presets */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Analyze Patterns", icon: <BrainCircuit className="w-3 h-3" />, prompt: "Analyze my habits and tasks for the last week and find correlations." },
                { label: "Optimize Today", icon: <Terminal className="w-3 h-3" />, prompt: "What are my highest impact priorities for today based on my current energy levels?" },
                { label: "Wellness Audit", icon: <Clock className="w-3 h-3" />, prompt: "Evaluate my recent wellness data and suggest one actionable change for better sleep." }
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setInput(preset.prompt)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-surface border border-border-subtle text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-primary hover:border-accent-assistant/30 transition-all"
                >
                  {preset.icon}
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}