import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { 
  Trash2, 
  History, 
  Plus, 
  X, 
  BookOpen, 
  Tag, 
  ChevronRight,
  PenTool,
  Clock,
  Search
} from 'lucide-react'

import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'


interface JournalEntry {
  _id: string
  date: string
  title?: string
  content: string
  mood?: number
  tags: string[]
  createdAt: string
}

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // New entry form state
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newMood, setNewMood] = useState(5)
  const [newTags, setNewTags] = useState('')

  const fetchEntries = useCallback(async () => {
    try {
      const res = await api.get('/journal');
      setEntries(res.data);
    } catch (error) {
      console.error('Failed to fetch journal entries', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    const handleEntityUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ entity?: string }>;
      if (customEvent.detail?.entity === 'journal') {
        fetchEntries();
      }
    };

    window.addEventListener('lifeos:entity-updated', handleEntityUpdated as EventListener);
    return () => window.removeEventListener('lifeos:entity-updated', handleEntityUpdated as EventListener);
  }, [fetchEntries]);

  const addEntry = async () => {
    if (!newContent.trim()) return
    
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post('/journal', {
        title: newTitle || undefined,
        content: newContent,
        mood: newMood,
        tags: newTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        date: today
      });
      
      setNewTitle('');
      setNewContent('');
      setNewMood(5);
      setNewTags('');
      setIsAdding(false);
      fetchEntries();
    } catch (error) {
      console.error('Failed to add journal entry', error);
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      await api.delete(`/journal/${id}`);
      setEntries(entries.filter(e => e._id !== id));
    } catch (error) {
      console.error('Failed to delete entry', error);
    }
  }

  const filteredEntries = entries.filter(entry => 
    entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-assistant"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Editorial Header */}
      <div className="relative pt-8 px-4 sm:px-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-assistant/10 border border-accent-assistant/20 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-assistant">
              <PenTool className="w-3 h-3" />
              Mindful Reflection
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-text-primary tracking-tight">
              The Ledger of <br/><span className="text-accent-assistant">Thoughts.</span>
            </h1>
            <p className="text-text-secondary max-w-lg text-lg leading-relaxed">
              An intimate archive for your internal dialogue. Captured moments in the continuum of growth.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/history?filter=journal" 
              className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-bg-surface border border-border-subtle text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-bright transition-all"
            >
              <History className="w-4 h-4 group-hover:rotate-[-12deg] transition-transform" />
              Archive
            </Link>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 bg-text-primary text-bg-app px-6 py-2.5 rounded-full text-sm font-bold hover:bg-accent-assistant transition-all shadow-xl shadow-accent-assistant/10"
            >
              {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAdding ? 'Close Editor' : 'Capture Thought'}
            </button>
          </div>
        </div>
      </div>

      {/* Modern Editor */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="card-elevated p-8 md:p-12 space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-accent-assistant" />
            
            <div className="space-y-6">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title your reflection..."
                className="w-full bg-transparent text-3xl font-heading font-bold border-none focus:ring-0 placeholder:text-text-muted/40"
              />
              
              <div className="flex flex-col lg:flex-row lg:items-center gap-8 py-6 border-y border-border-subtle/50">
                <div className="space-y-3 lg:min-w-[300px]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Affective State</span>
                    <span className="text-sm font-mono text-accent-assistant">{newMood}/10</span>
                  </div>
                  <div className="flex gap-1.5 h-3 w-full group">
                    {[...Array(10)].map((_, i) => {
                      const score = i + 1;
                      const isActive = score <= newMood;
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setNewMood(score)}
                          className={`flex-1 rounded-sm transition-all duration-300 ${
                            isActive 
                              ? 'bg-accent-assistant shadow-[0_0_8px_rgba(150,150,255,0.3)]' 
                              : 'bg-bg-lowered'
                          } hover:bg-accent-assistant/60`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted font-medium uppercase tracking-tighter">
                    <span>Heavy</span>
                    <span>Stable</span>
                    <span>Radiant</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                    <Tag className="w-3 h-3" /> Semantic Tags
                  </span>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="reflection, clarity, focus..."
                    className="w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:border-accent-assistant transition-all outline-none"
                  />
                </div>
              </div>

              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Transcribe the whispers of the mind..."
                className="w-full h-80 bg-transparent border-none focus:ring-0 resize-none text-xl leading-relaxed text-text-secondary placeholder:text-text-muted/30 font-precision"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-subtle/50">
              <p className="text-xs text-text-muted flex items-center gap-2">
                <Clock className="w-3 h-3" /> 
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <button 
                onClick={addEntry}
                disabled={!newContent.trim()}
                className="bg-accent-assistant text-white px-10 py-3 rounded-full text-sm font-bold shadow-xl shadow-accent-assistant/20 disabled:opacity-30 disabled:shadow-none hover:scale-[1.02] transition-all"
              >
                Commit to Archive
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8 px-4 sm:px-0">
        {/* Search & Statistics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter thoughts..."
              className="w-full bg-bg-surface border border-border-subtle rounded-full pl-11 pr-4 py-2.5 text-sm focus:border-accent-assistant outline-none transition-all"
            />
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Total Thoughts</p>
              <p className="text-xl font-heading font-bold text-text-primary">{entries.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Avg Quality</p>
              <p className="text-xl font-heading font-bold text-accent-assistant">
                {entries.length > 0 ? (entries.reduce((acc, curr) => acc + (curr.mood || 0), 0) / entries.length).toFixed(1) : '–'}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Entry Timeline */}
        <div className="space-y-16 relative before:absolute before:left-[17px] before:top-4 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-border-subtle before:via-border-subtle/20 before:to-transparent">
          {filteredEntries.map((entry) => (
            <motion.div 
              layout
              key={entry._id} 
              className="relative pl-12 group"
            >
              {/* Vertical Timeline Indicator */}
              <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-bg-app border border-border-subtle flex items-center justify-center z-10 group-hover:border-accent-assistant transition-all duration-500 group-hover:scale-110">
                <div className={`w-2.5 h-2.5 rounded-full ${entry.mood && entry.mood >= 8 ? 'bg-green-400' : entry.mood && entry.mood >= 5 ? 'bg-accent-assistant' : 'bg-red-400'} shadow-lg shadow-current/20`} />
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-heading font-bold text-text-primary group-hover:text-accent-assistant transition-colors">
                        {entry.title || 'Untitled Thought'}
                      </h3>
                      {entry.mood && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-bg-surface border border-border-subtle text-text-muted">
                          {entry.mood}/10
                        </span>
                      )}
                    </div>
                    <p className="text-text-muted text-[10px] font-bold uppercase tracking-[0.2em]">
                      {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => deleteEntry(entry._id)}
                      className="p-2.5 hover:bg-red-500/10 rounded-full transition-all text-text-muted hover:text-red-400 border border-transparent hover:border-red-400/20"
                      title="Purge Thought"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-text-secondary text-lg leading-relaxed whitespace-pre-wrap font-precision opacity-80 group-hover:opacity-100 transition-opacity">
                    {entry.content}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-bg-surface text-[10px] font-bold text-text-muted uppercase tracking-widest border border-border-subtle group-hover:border-accent-assistant/20 group-hover:text-accent-assistant transition-all">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link 
                    to={`/history?search=${entry._id}`}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
                  >
                    View in Archive <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredEntries.length === 0 && !isAdding && (
            <div className="text-center py-32 card-elevated border-dashed border-2 bg-transparent">
              <BookOpen className="w-12 h-12 text-text-muted/20 mx-auto mb-6" />
              <h3 className="text-xl font-heading font-semibold text-text-primary">No matching records found.</h3>
              <p className="text-text-secondary mt-2">The Archive is silent. Perhaps it&apos;s time to speak.</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-8 text-accent-assistant font-bold text-sm uppercase tracking-widest border-b-2 border-accent-assistant/20 hover:border-accent-assistant transition-all pb-1"
              >
                Capture First Thought
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
