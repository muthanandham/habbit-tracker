import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Command, Send, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../api';

type AIActionType = 'habit' | 'task' | 'wellness' | 'journal' | 'insight' | 'unknown';
type AIActionMode = 'create' | 'update' | 'query';

interface AIResponsePayload {
  type?: AIActionType;
  action?: AIActionMode;
  data?: Record<string, unknown>;
  message?: string;
}

interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  canConfirm: boolean;
  status: 'idle' | 'loading' | 'success' | 'error' | 'info';
  pendingAction: AIResponsePayload | null;
}

interface ToastState {
  isOpen: boolean;
  message: string;
}

export const CommandBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    canConfirm: false,
    status: 'idle',
    pendingAction: null,
  });
  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    message: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const closeDialog = () => {
    setDialog({
      isOpen: false,
      title: '',
      message: '',
      confirmLabel: 'Confirm',
      canConfirm: false,
      status: 'idle',
      pendingAction: null,
    });
  };

  const today = new Date().toISOString().split('T')[0];

  const showToast = (message: string) => {
    setToast({ isOpen: true, message });
  };

  const dispatchEntityRefresh = (entity: 'tasks' | 'wellness' | 'habits' | 'journal') => {
    window.dispatchEvent(
      new CustomEvent('lifeos:entity-updated', {
        detail: { entity },
      })
    );
  };

  useEffect(() => {
    if (!toast.isOpen) return undefined;

    const timeout = window.setTimeout(() => {
      setToast({ isOpen: false, message: '' });
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  const normalizeTaskPayload = (data: Record<string, unknown>) => {
    const title = typeof data.title === 'string' ? data.title.trim() : '';
    if (!title) return null;

    const allowedPriorities = ['low', 'medium', 'high', 'urgent'];
    const priority = typeof data.priority === 'string' && allowedPriorities.includes(data.priority)
      ? data.priority
      : 'medium';

    const dueDate = typeof data.dueDate === 'string' && data.dueDate.trim()
      ? data.dueDate
      : undefined;

    return {
      title,
      description: typeof data.description === 'string' ? data.description : undefined,
      priority,
      dueDate,
      status: 'todo',
      isMustDo: Boolean(data.isMustDo),
      tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    };
  };

  const normalizeHabitPayload = (data: Record<string, unknown>) => {
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    if (!name) return null;

    const allowedCategories = ['health', 'fitness', 'mindfulness', 'productivity', 'learning', 'social', 'creative', 'other'];
    const allowedFrequencies = ['daily', 'weekly', 'monthly'];
    const frequency = typeof data.frequency === 'string' && allowedFrequencies.includes(data.frequency)
      ? data.frequency
      : 'daily';
    const category = typeof data.category === 'string' && allowedCategories.includes(data.category)
      ? data.category
      : 'other';

    return {
      name,
      description: typeof data.description === 'string' ? data.description : undefined,
      category,
      frequency,
      targetDays: Array.isArray(data.targetDays)
        ? data.targetDays.filter((day): day is number => typeof day === 'number' && day >= 0 && day <= 6)
        : [0, 1, 2, 3, 4, 5, 6],
      targetCount: typeof data.targetCount === 'number' && data.targetCount > 0 ? data.targetCount : 1,
      unit: typeof data.unit === 'string' ? data.unit : undefined,
      reminder: {
        enabled: Boolean((data.reminder as { enabled?: unknown } | undefined)?.enabled),
        time: typeof (data.reminder as { time?: unknown } | undefined)?.time === 'string'
          ? (data.reminder as { time?: string }).time
          : undefined,
      },
      color: typeof data.color === 'string' ? data.color : undefined,
      icon: typeof data.icon === 'string' ? data.icon : undefined,
    };
  };

  const normalizeJournalPayload = (data: Record<string, unknown>) => {
    const content = typeof data.content === 'string' ? data.content.trim() : '';
    if (!content) return null;

    return {
      date: typeof data.date === 'string' && data.date.trim() ? data.date : today,
      title: typeof data.title === 'string' ? data.title : undefined,
      content,
      mood: typeof data.mood === 'number' ? data.mood : undefined,
      tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === 'string') : [],
      isPrivate: data.isPrivate === undefined ? true : Boolean(data.isPrivate),
    };
  };

  const executeWellnessAction = async (data: Record<string, unknown>) => {
    const todayRes = await api.get(`/wellness/date/${today}`);
    const existing = todayRes.data as {
      mood?: { score?: number; emotions?: string[]; notes?: string };
      nutrition?: { waterIntake?: number };
    } | null;

    const nextPayload: Record<string, unknown> = {};

    // Helper to get numeric value from common AI keys
    const getVal = (keys: string[]) => {
      for (const k of keys) {
        if (typeof data[k] === 'number') return data[k] as number;
        if (typeof data[k] === 'string' && !isNaN(Number(data[k]))) return Number(data[k]);
      }
      return null;
    };

    const waterVal = getVal(['waterIntake', 'water', 'amount']);
    if (waterVal !== null) {
      const currentWater = existing?.nutrition?.waterIntake ?? 0;
      nextPayload.nutrition = { waterIntake: currentWater + waterVal };
    }

    const moodVal = getVal(['mood', 'score']);
    if (moodVal !== null) {
      nextPayload.mood = {
        score: moodVal,
        emotions: existing?.mood?.emotions ?? [],
        notes: existing?.mood?.notes,
      };
    }

    if (Object.keys(nextPayload).length === 0) {
      // eslint-disable-next-line no-console
      console.warn('AI Wellness data mismatch:', data);
      throw new Error('not_applicable');
    }

    await api.patch(`/wellness/date/${today}`, nextPayload);
  };

  const executePendingAction = async () => {
    if (!dialog.pendingAction || !dialog.canConfirm) {
      return;
    }

    setDialog((prev) => ({
      ...prev,
      status: 'loading',
      confirmLabel: 'Applying...',
    }));

    try {
      const { pendingAction } = dialog;

      if (pendingAction.type === 'task' && pendingAction.data) {
        const payload = normalizeTaskPayload(pendingAction.data);
        if (!payload) {
          throw new Error('not_applicable');
        }
        await api.post('/tasks', payload);
        dispatchEntityRefresh('tasks');
        showToast('Task created from popup AI');
      } else if (pendingAction.type === 'habit' && pendingAction.data) {
        const payload = normalizeHabitPayload(pendingAction.data);
        if (!payload) {
          throw new Error('not_applicable');
        }
        await api.post('/habits', payload);
        dispatchEntityRefresh('habits');
        showToast('New habit created from popup AI');
      } else if (pendingAction.type === 'journal' && pendingAction.data) {
        const payload = normalizeJournalPayload(pendingAction.data);
        if (!payload) {
          throw new Error('not_applicable');
        }
        await api.post('/journal', payload);
        dispatchEntityRefresh('journal');
        showToast('Journal entry created from popup AI');
      } else if (pendingAction.type === 'wellness' && pendingAction.data) {
        await executeWellnessAction(pendingAction.data);
        dispatchEntityRefresh('wellness');
        showToast('Wellness updated from popup AI');
      } else {
        throw new Error('not_applicable');
      }

      setDialog((prev) => ({
        ...prev,
        title: 'Action Applied',
        message: 'Your request has been successfully committed to Life-OS.',
        confirmLabel: 'Done',
        canConfirm: false,
        status: 'success',
        pendingAction: null,
      }));
    } catch (error) {
      const notApplicable = error instanceof Error && error.message === 'not_applicable';
      setDialog((prev) => ({
        ...prev,
        title: notApplicable ? 'Not Applicable' : 'Action Failed',
        message: notApplicable
          ? 'The popup AI understood your request, but it cannot safely apply that action from this dialog.'
          : 'The AI action could not be completed. Please try again or use the full Assistant page.',
        confirmLabel: 'Close',
        canConfirm: false,
        status: notApplicable ? 'info' : 'error',
        pendingAction: null,
      }));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    setIsProcessing(true);
    const userInput = input;
    setInput('');

    try {
      const { data } = await api.post<AIResponsePayload>('/ai/process', { input: userInput });
      // eslint-disable-next-line no-console
      console.log('AI Processed:', data);

      const actionable =
        (data.action === 'create' || data.action === 'update') &&
        (data.type === 'task' || data.type === 'wellness' || data.type === 'habit' || data.type === 'journal');

      setDialog({
        isOpen: true,
        title: actionable ? 'AI Confirmation' : 'Not Applicable',
        message: data.message || 'The AI responded, but there was no actionable result.',
        confirmLabel: actionable ? 'Confirm' : 'Close',
        canConfirm: actionable,
        status: actionable ? 'idle' : 'info',
        pendingAction: actionable ? data : null,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('AI Gateway Error:', error);
      setDialog({
        isOpen: true,
        title: 'AI Synchronization Error',
        message: 'The AI system is currently facing a synchronization error.',
        confirmLabel: 'Close',
        canConfirm: false,
        status: 'error',
        pendingAction: null,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => setIsOpen(true)}
          data-testid="command-bar-trigger"
          className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full glass-panel flex items-center gap-2 sm:gap-3 group transition-all duration-300 hover:border-accent-gold/50 shadow-premium z-[60]"
        >
          <Sparkles className="w-5 h-5 text-accent-gold animate-pulse" />
          <span className="text-text-secondary font-precision text-xs sm:text-sm font-medium group-hover:text-text-primary transition-colors">
            Ask AI...
          </span>
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-border-subtle border border-border-subtle text-[10px] font-mono text-text-muted">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </motion.button>
      )}

      {/* Expanded Command Interface */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-surface/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-bg-surface border border-border-bright rounded-2xl shadow-premium overflow-hidden"
            >
              <form onSubmit={handleSubmit} data-testid="command-bar-form" className="p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-accent-gold/10">
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 text-accent-gold animate-spin" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-accent-gold" />
                  )}
                </div>
                
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isProcessing ? "AI is thinking..." : "I just drank 500ml water..."}
                  disabled={isProcessing}
                  data-testid="command-bar-input"
                  className={clsx(
                    "flex-1 bg-transparent border-none outline-none text-text-primary font-precision text-lg placeholder:text-text-muted",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                />

                <div className="flex items-center gap-2">

                  <button
                    type="submit"
                    disabled={!input.trim() || isProcessing}
                    data-testid="command-bar-submit"
                    className={clsx(
                      "p-2 rounded-full transition-all duration-300",
                      (input.trim() && !isProcessing)
                        ? "bg-accent-gold text-accent-foreground shadow-lg shadow-accent-gold/20" 
                        : "bg-border-subtle text-text-muted"
                    )}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-border-subtle text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Suggestions / Shortcuts */}
              <div className="px-4 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
                {['Log Water', 'Mood Check', 'Habit Check'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setInput(tag + ': ')}
                    className="whitespace-nowrap px-3 py-1 rounded-full bg-border-subtle border border-border-subtle text-xs text-text-secondary hover:bg-border-bright hover:border-accent-gold/20 hover:text-text-primary transition-all font-precision"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* System Dialog */}
      <AnimatePresence>
        {dialog.isOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface/70 backdrop-blur-md"
              onClick={closeDialog}
            />

            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              className="relative w-full max-w-md rounded-2xl border border-border-bright bg-bg-surface shadow-premium"
            >
              <div className="border-b border-border-subtle px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-accent-gold/10 p-2">
                    <Sparkles className="h-5 w-5 text-accent-gold" />
                  </div>
                  <div>
                    <h3 className="font-precision text-base font-semibold text-text-primary">
                      {dialog.title}
                    </h3>
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">
                      Life-OS Assistant
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                  {dialog.message}
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-border-subtle px-5 py-4">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-xl border border-border-bright px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-border-subtle hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={dialog.canConfirm ? executePendingAction : closeDialog}
                  disabled={dialog.status === 'loading'}
                  className={clsx(
                    "rounded-xl px-4 py-2 text-sm font-semibold transition-transform",
                    dialog.canConfirm
                      ? "bg-accent-gold text-accent-foreground shadow-lg shadow-accent-gold/20 hover:scale-[1.01]"
                      : "bg-border-bright text-text-primary hover:bg-border-bright",
                    dialog.status === 'loading' && "cursor-wait opacity-70"
                  )}
                >
                  {dialog.confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast.isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-24 left-1/2 z-[140] -translate-x-1/2 rounded-2xl border border-border-bright bg-bg-surface px-4 py-3 text-sm text-text-primary shadow-premium"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
