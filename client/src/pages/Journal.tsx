import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-journal"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-text-primary">
            Journal
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Capture your thoughts and reflect on your journey
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/history?filter=journal" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-surface border border-border-subtle text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-bright transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden xs:inline">History</span>
          </Link>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            data-testid="add-journal-button"
            className="glass-button-primary px-4 sm:px-6 py-2 rounded-lg text-sm"
          >
            {isAdding ? 'Cancel' : 'New Entry'}
          </button>
        </div>
      </div>

      {/* New Entry Form */}
      {isAdding && (
        <div className="card-elevated p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Entry Title (Optional)"
            data-testid="journal-title-input"
            className="w-full bg-transparent text-2xl font-heading font-semibold border-none focus:ring-0 placeholder:text-text-secondary/30"
          />
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-4 border-y border-border-subtle">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-text-secondary uppercase tracking-widest min-w-[40px]">Mood</span>
              <input 
                type="range" min="1" max="10" 
                value={newMood}
                onChange={(e) => setNewMood(parseInt(e.target.value))}
                className="flex-1 sm:w-24 h-2 bg-bg-surface rounded-full appearance-none cursor-pointer accent-accent-journal"
              />
              <span className="text-sm font-mono text-accent-journal min-w-[20px]">{newMood}</span>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Tags (comma separated)"
                className="w-full bg-transparent text-sm border-none focus:ring-0 placeholder:text-text-secondary/30 p-0"
              />
            </div>
          </div>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="What&apos;s on your mind today?"
            data-testid="journal-content-input"
            className="w-full h-64 bg-transparent border-none focus:ring-0 resize-none text-text-primary leading-relaxed placeholder:text-text-secondary/30"
          />

          <div className="flex justify-end pt-4">
            <button 
              onClick={addEntry}
              disabled={!newContent.trim()}
              data-testid="save-journal-button"
              className="glass-button-primary px-8 py-2 rounded-lg disabled:opacity-50"
            >
              Save Entry
            </button>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-12 relative before:absolute before:left-[17px] before:top-2 before:bottom-0 before:w-px before:bg-border-subtle px-4 sm:px-0">
        {entries.map((entry) => (
          <div key={entry._id} className="relative pl-10 sm:pl-12 group">
            {/* Timeline Dot */}
            <div className="absolute left-0 top-1.5 w-9 h-9 rounded-full bg-bg-app border border-border-subtle flex items-center justify-center z-10 group-hover:border-accent-journal transition-colors">
              <div className={`w-2 h-2 rounded-full ${entry.mood && entry.mood >= 8 ? 'bg-green-400' : entry.mood && entry.mood >= 5 ? 'bg-accent-journal' : 'bg-red-400'}`} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-heading font-semibold text-text-primary group-hover:text-accent-journal transition-colors truncate">
                    {entry.title || 'Untitled Entry'}
                  </h3>
                  <p className="text-text-secondary text-[10px] font-mono uppercase tracking-widest mt-1">
                    {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <button 
                  onClick={() => deleteEntry(entry._id)}
                  className="p-2 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-border-subtle rounded-lg transition-all text-text-secondary hover:text-red-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap italic opacity-80 group-hover:opacity-100 transition-opacity">
                  {entry.content}
                </p>
              </div>

              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {entry.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-border-subtle text-[10px] text-text-secondary uppercase tracking-widest border border-border-subtle">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {entries.length === 0 && !isAdding && (
          <div className="text-center py-20 border-2 border-dashed border-border-subtle rounded-3xl">
            <p className="text-text-secondary">Your journal is empty. Start writing your story.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="mt-4 text-accent-journal hover:underline text-sm"
            >
              Create your first entry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
