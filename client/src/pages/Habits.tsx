import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, History as HistoryIcon, Trash2, Check, Zap } from 'lucide-react'

import api from '../api'
import { ModuleIcon } from '../components/ModuleIcon'

interface Habit {
  _id: string
  name: string
  icon: string
  frequency: 'daily' | 'weekly' | 'monthly'
  streak: {
    current: number
    best: number
    lastCompletedDate?: string
  }
  createdAt: string
}

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddModal, setShowAddModal] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitIcon, setNewHabitIcon] = useState('default')
  const [newHabitFrequency, setNewHabitFrequency] = useState<'daily' | 'weekly'>('daily')

  const habitTemplates = {
    productivity: {
      title: 'Productivity',
      items: [
        { name: "Read 10 Pages", icon: "book" },
        { name: "Learn New Skill", icon: "skill" },
        { name: "Plan Tomorrow", icon: "plan" },
        { name: "Phone-Free Morning", icon: "detox" },
        { name: "Write/Journal", icon: "journal" },
        { name: "Deep Work Block", icon: "task" }
      ]
    },
    physical: {
      title: 'Physical',
      items: [
        { name: "Hit the Gym", icon: "gym" },
        { name: "Drink 3L Water", icon: "water" },
        { name: "Eat 3+ Veggies", icon: "nutrition" },
        { name: "10k Steps", icon: "steps" },
        { name: "Hit Protein Goal", icon: "protein" },
        { name: "Posture Check", icon: "posture" }
      ]
    },
    discipline: {
      title: 'Discipline',
      items: [
        { name: "No Porn / NoFap", icon: "discipline" },
        { name: "No Alcohol", icon: "discipline" },
        { name: "Smoke-Free Day", icon: "discipline" },
        { name: "No Social Media", icon: "detox" },
        { name: "No Junk Food", icon: "nutrition" },
        { name: "Cold Shower", icon: "cold" }
      ]
    },
    social: {
      title: 'Social',
      items: [
        { name: "Call a Loved One", icon: "call" },
        { name: "Compliment Someone", icon: "compliment" },
        { name: "Quality Time", icon: "family" },
        { name: "Act of Kindness", icon: "kindness" }
      ]
    },
    wealth: {
      title: 'Wealth',
      items: [
        { name: "Check Budget", icon: "budget" },
        { name: "No Spend Day", icon: "spend" },
        { name: "Track Expenses", icon: "expenses" },
        { name: "Read Finance News", icon: "news" }
      ]
    }
  };
  
  type HabitCategory = keyof typeof habitTemplates;
  const [activeCategory, setActiveCategory] = useState<HabitCategory>('productivity');

  const iconOptions = [
    { name: 'Target', icon: 'default' },
    { name: 'Mind', icon: 'meditate' },
    { name: 'Water', icon: 'water' },
    { name: 'Fitness', icon: 'gym' },
    { name: 'Reading', icon: 'book' },
    { name: 'Screen', icon: 'smartphone' },
    { name: 'Focus', icon: 'plan' },
    { name: 'Journal', icon: 'journal' },
    { name: 'Energy', icon: 'energy' },
    { name: 'Rest', icon: 'sleep' },
    { name: 'Wealth', icon: 'wealth' },
    { name: 'Protocol', icon: 'discipline' },
  ];



  const fetchHabits = useCallback(async () => {
    try {
      const res = await api.get('/habits');
      setHabits(res.data);
    } catch (error) {
      console.error('Failed to fetch habits', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  useEffect(() => {
    const handleEntityUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ entity?: string }>;
      if (customEvent.detail?.entity === 'habits') {
        fetchHabits();
      }
    };

    window.addEventListener('lifeos:entity-updated', handleEntityUpdated as EventListener);
    return () => window.removeEventListener('lifeos:entity-updated', handleEntityUpdated as EventListener);
  }, [fetchHabits]);

  const isCompletedToday = (lastCompletedDate?: string) => {
    if (!lastCompletedDate) return false;
    const today = new Date().toISOString().split('T')[0];
    const last = new Date(lastCompletedDate).toISOString().split('T')[0];
    return today === last;
  };

  const toggleHabit = async (id: string, currentlyCompleted: boolean) => {
    try {
      if (!currentlyCompleted) {
        await api.post(`/habits/${id}/complete`);
      } else {
        await api.post(`/habits/${id}/uncomplete`);
      }
      fetchHabits(); // Re-fetch to get updated streaks
    } catch (error) {
      console.error('Failed to toggle habit', error);
    }
  }

  const addHabit = async () => {
    if (!newHabitName.trim()) return
    
    try {
      await api.post('/habits', {
        name: newHabitName,
        icon: newHabitIcon,
        frequency: newHabitFrequency,
        category: 'other' // Default for now
      });
      setNewHabitName('')
      setNewHabitIcon('default')
      setNewHabitFrequency('daily')
      setShowAddModal(false)
      fetchHabits();
    } catch (error) {
      console.error('Failed to add habit', error);
    }
  }

  const addPresetHabit = async (name: string, icon: string) => {
    try {
      await api.post('/habits', {
        name,
        icon,
        frequency: 'daily',
        category: 'other'
      });
      fetchHabits();
    } catch (error) {
      console.error('Failed to add preset habit', error);
    }
  }

  const deleteHabit = async (id: string) => {
    try {
      await api.delete(`/habits/${id}`);
      setHabits(habits.filter(h => h._id !== id));
    } catch (error) {
      console.error('Failed to delete habit', error);
    }
  }

  const todayStats = {
    total: habits.filter(h => h.frequency === 'daily').length,
    completed: habits.filter(h => h.frequency === 'daily' && isCompletedToday(h.streak.lastCompletedDate)).length,
    weekly: habits.filter(h => h.frequency === 'weekly').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-habit"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-text-primary">
            Habits
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {todayStats.total > 0 
              ? `${todayStats.completed}/${todayStats.total} daily habits completed today`
              : 'Create your first habit to start tracking!'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/history?filter=habit" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-surface border border-border-subtle text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-bright transition-all">
          <HistoryIcon size={16} strokeWidth={1.5} />
            <span className="hidden xs:inline">Archive</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            data-testid="add-habit-button"
            className="glass-button-primary px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <Plus size={18} strokeWidth={1.5} />
            Initialize Habit
          </button>

        </div>
      </div>

      {/* Quick Add Presets (Tabbed) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider px-1">
            Quick Add Templates
          </h2>
          <div className="flex gap-2 bg-bg-surface/50 p-1.5 rounded-full border border-border-subtle inline-flex overflow-x-auto hide-scrollbar">
            {(Object.keys(habitTemplates) as HabitCategory[]).map(key => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === key
                    ? 'bg-accent-habit/20 text-accent-habit shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                }`}
              >
                {habitTemplates[key].title}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in" key={activeCategory}>
          {habitTemplates[activeCategory].items.map(preset => (
            <button
              key={preset.name}
              onClick={() => addPresetHabit(preset.name, preset.icon)}
              className="flex items-center gap-4 p-4 rounded-xl bg-bg-surface border border-border-subtle hover:bg-bg-elevated hover:border-accent-habit/50 hover:-translate-y-0.5 transition-all group cursor-pointer"
            >
              <div className="p-2.5 rounded-lg bg-bg-lowered group-hover:bg-accent-habit/10 transition-colors">
                <ModuleIcon name={preset.icon} size={18} module="habit" />
              </div>
              <span className="text-sm font-semibold text-text-primary group-hover:text-accent-habit transition-colors text-left leading-tight">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <p className="text-text-secondary text-sm">Daily Progress</p>
          <p className="text-2xl font-heading font-bold text-accent-habit mt-1">
            {todayStats.completed}/{todayStats.total}
          </p>
          <div className="mt-2 h-2 bg-bg-lowered rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-habit rounded-full transition-all"
              style={{ width: `${todayStats.total > 0 ? (todayStats.completed / todayStats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="card-elevated p-4">
          <p className="text-text-secondary text-sm">Best Streak</p>
          <p className="text-2xl font-heading font-bold text-orange-400 mt-1">
            {habits.length > 0 ? Math.max(...habits.map(h => h.streak.best)) : 0}
          </p>
          <p className="text-text-secondary text-xs mt-1">days (all-time)</p>
        </div>

        <div className="card-elevated p-4">
          <p className="text-text-secondary text-sm">Weekly Habits</p>
          <p className="text-2xl font-heading font-bold text-accent-task mt-1">
            {todayStats.weekly}
          </p>
          <p className="text-text-secondary text-xs mt-1">active</p>
        </div>

        <div className="card-elevated p-4">
          <p className="text-text-secondary text-sm">Current Progress</p>
          <p className="text-2xl font-heading font-bold text-accent-wellness mt-1">
            {habits.length > 0 ? Math.round((habits.reduce((acc, h) => acc + h.streak.current, 0) / habits.length)) : 0}
          </p>
          <p className="text-text-secondary text-xs mt-1">avg streak</p>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {/* Daily Habits */}
        <div className="card-elevated p-5">
          <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
            Daily Habits
          </h2>
          <div className="space-y-3">
            {habits.filter(h => h.frequency === 'daily').map((habit) => {
              const completed = isCompletedToday(habit.streak.lastCompletedDate);
              return (
                <div 
                  key={habit._id}
                  data-testid={`habit-item-${habit.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-bg-surface/50 hover:bg-bg-surface transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleHabit(habit._id, completed)}
                      data-testid="habit-toggle"
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        completed 
                          ? 'border-accent-habit bg-accent-habit' 
                          : 'border-text-secondary hover:border-accent-habit'
                      }`}
                    >
                      {completed && (
                        <Check size={14} strokeWidth={3} className="text-bg-app" />
                      )}
                    </button>
                    <div className="p-2.5 rounded-xl bg-bg-lowered border border-border-subtle group-hover:border-accent-habit/30 transition-all">
                      <ModuleIcon name={habit.icon} size={20} module="habit" />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm sm:text-base ${completed ? 'text-text-secondary' : 'text-text-primary'}`}>
                        {habit.name}
                      </p>
                      <p className="text-text-secondary text-[10px] font-mono leading-none mt-1">
                        STREAK {habit.streak.current}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-accent-habit font-mono text-sm flex items-center gap-1 justify-end">
                        {habit.streak.current} <Zap size={12} fill="currentColor" />
                      </p>
                      <p className="text-text-secondary text-[10px] uppercase tracking-widest font-mono">Current</p>
                    </div>
                    <button
                      onClick={() => deleteHabit(habit._id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
            {habits.filter(h => h.frequency === 'daily').length === 0 && (
              <p className="text-text-secondary text-center py-8">No daily habits yet.</p>
            )}
          </div>
        </div>

        {/* Weekly Habits */}
        <div className="card-elevated p-5">
          <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
            Weekly Habits
          </h2>
          <div className="space-y-3">
            {habits.filter(h => h.frequency === 'weekly').map((habit) => {
              const completed = isCompletedToday(habit.streak.lastCompletedDate);
              return (
                <div 
                  key={habit._id}
                  className="flex items-center justify-between p-4 rounded-lg bg-bg-surface/50 hover:bg-bg-surface transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleHabit(habit._id, completed)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        completed 
                          ? 'border-accent-task bg-accent-task' 
                          : 'border-text-secondary hover:border-accent-task'
                      }`}
                    >
                      {completed && (
                        <Check size={14} strokeWidth={3} className="text-bg-app" />
                      )}
                    </button>
                    <div className="p-2.5 rounded-xl bg-bg-lowered border border-border-subtle group-hover:border-accent-habit/30 transition-all">
                      <ModuleIcon name={habit.icon} size={20} module="habit" />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm sm:text-base ${completed ? 'text-text-secondary' : 'text-text-primary'}`}>
                        {habit.name}
                      </p>
                      <p className="text-text-secondary text-[10px] font-mono leading-none mt-1">
                        TOTAL {habit.streak.best}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteHabit(habit._id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              );
            })}
            {habits.filter(h => h.frequency === 'weekly').length === 0 && (
              <p className="text-text-secondary text-center py-8">No weekly habits yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-elevated p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-heading font-bold text-text-primary uppercase tracking-[0.1em] border-b border-border-subtle pb-4 mb-6">
              Initialize Habit
            </h3>

            
            <div className="space-y-4">
              <div>
                <label className="block text-text-primary/90 text-xs font-bold uppercase tracking-[0.2em] mb-2">Habit Name</label>

                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Morning Meditation"
                  data-testid="new-habit-name"
                  className="input-field w-full"
                />
              </div>

              <div className="bg-bg-lowered/50 rounded-2xl p-5 border border-border-subtle shadow-inner">
                <label className="block text-text-secondary text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-center">
                  Select Formal Symbol
                </label>

                <div className="grid grid-cols-4 gap-3">
                  {iconOptions.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setNewHabitIcon(opt.icon)}
                      className={`group relative aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        newHabitIcon === opt.icon 
                          ? 'bg-accent-habit/15 shadow-[0_0_20px_rgba(var(--accent-habit),0.2)] ring-2 ring-accent-habit ring-offset-4 ring-offset-bg-surface' 
                          : 'bg-bg-surface border border-border-subtle hover:border-accent-habit/50 hover:bg-bg-elevated'
                      }`}
                    >
                      <ModuleIcon 
                        name={opt.icon} 
                        size={22} 
                        module={newHabitIcon === opt.icon ? 'habit' : 'other'} 
                        className="transition-transform group-hover:scale-110"
                      />
                      
                      {/* Tooltip */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-bg-app border border-border-bright px-2 py-1 rounded text-[10px] uppercase tracking-tighter text-text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                        {opt.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>


              <div>
                <label className="block text-text-primary/90 text-xs font-bold uppercase tracking-[0.2em] mb-2">Frequency</label>

                <div className="flex gap-2">
                  <button
                    onClick={() => setNewHabitFrequency('daily')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      newHabitFrequency === 'daily'
                        ? 'bg-accent-habit text-bg-app'
                        : 'bg-bg-surface text-text-secondary hover:bg-bg-elevated'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setNewHabitFrequency('weekly')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      newHabitFrequency === 'weekly'
                        ? 'bg-accent-task text-bg-app'
                        : 'bg-bg-surface text-text-secondary hover:bg-bg-elevated'
                    }`}
                  >
                    Weekly
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 glass-button py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addHabit}
                disabled={!newHabitName.trim()}
                data-testid="save-habit-button"
                className="flex-1 bg-accent-habit text-accent-foreground py-3 rounded-xl font-bold uppercase tracking-widest text-xs shadow-[0_10px_15px_-3px_rgba(var(--accent-habit),0.2)] hover:brightness-110 active:scale-95 disabled:opacity-30 transition-all"
              >
                Establish Habit
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
