import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Command, Send, Mic, X } from 'lucide-react';
import { clsx } from 'clsx';

export const CommandBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (!input.trim()) return;
    
    const userInput = input;
    setInput('');

    try {
      const response = await fetch('http://localhost:5000/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userInput }),
      });
      
      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log('AI Processed:', data);
      
      // For now, we just alert the message, later we'll use a Toast system
      if (data.message) {
        alert(`AI: ${data.message}`);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('AI Gateway Error:', error);
      alert('AI system is currently facing a synchronization error.');
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
          className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full glass-panel flex items-center gap-3 group transition-all duration-300 hover:border-accent-gold/50 shadow-premium z-50"
        >
          <Sparkles className="w-5 h-5 text-accent-gold animate-pulse" />
          <span className="text-text-secondary font-precision text-sm font-medium group-hover:text-text-primary transition-colors">
            Ask AI...
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-text-muted">
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
                  <Sparkles className="w-6 h-6 text-accent-gold" />
                </div>
                
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="I just drank 500ml water..."
                  data-testid="command-bar-input"
                  className="flex-1 bg-transparent border-none outline-none text-text-primary font-precision text-lg placeholder:text-text-muted"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    data-testid="command-bar-submit"
                    className={clsx(
                      "p-2 rounded-full transition-all duration-300",
                      input.trim() 
                        ? "bg-accent-gold text-accent-foreground shadow-lg shadow-accent-gold/20" 
                        : "bg-white/5 text-text-muted"
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Suggestions / Shortcuts */}
              <div className="px-4 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
                {['Log Water', 'New Task', 'Mood Check', 'Habit Check'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setInput(tag + ': ')}
                    className="whitespace-nowrap px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-text-secondary hover:bg-white/10 hover:border-accent-gold/20 hover:text-text-primary transition-all font-precision"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
