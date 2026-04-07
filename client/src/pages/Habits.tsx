import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

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
  const [newHabitIcon, setNewHabitIcon] = useState('✨')
  const [newHabitFrequency, setNewHabitFrequency] = useState<'daily' | 'weekly'>('daily')

  const habitTemplates = {
    productivity: {
      title: '⚡ Productivity',
      items: [
        { name: "Read 10 Pages", icon: "📚" },
        { name: "Learn New Skill", icon: "🧠" },
        { name: "Plan Tomorrow", icon: "📝" },
        { name: "Phone-Free Morning", icon: "📵" },
        { name: "Write/Journal", icon: "✍️" },
        { name: "Deep Work Block", icon: "🎯" }
      ]
    },
    physical: {
      title: '🏃 Physical',
      items: [
        { name: "Hit the Gym", icon: "🏋️" },
        { name: "Drink 3L Water", icon: "💧" },
        { name: "Eat 3+ Veggies", icon: "🥗" },
        { name: "10k Steps", icon: "🏃" },
        { name: "Hit Protein Goal", icon: "🥩" },
        { name: "Posture Check", icon: "🧘‍♂️" }
      ]
    },
    discipline: {
      title: '🛡️ Discipline',
      items: [
        { name: "No Porn / NoFap", icon: "🚫" },
        { name: "No Alcohol", icon: "🛑" },
        { name: "Smoke-Free Day", icon: "🚭" },
        { name: "No Social Media", icon: "📵" },
        { name: "No Junk Food", icon: "🍕" },
        { name: "Cold Shower", icon: "🚿" }
      ]
    },
    social: {
      title: '🤝 Social',
      items: [
        { name: "Call a Loved One", icon: "📞" },
        { name: "Compliment Someone", icon: "✨" },
        { name: "Quality Time", icon: "👨‍👩‍👦" },
        { name: "Act of Kindness", icon: "🎁" }
      ]
    },
    wealth: {
      title: '💰 Wealth',
      items: [
        { name: "Check Budget", icon: "📊" },
        { name: "No Spend Day", icon: "🏷️" },
        { name: "Track Expenses", icon: "💸" },
        { name: "Read Finance News", icon: "📰" }
      ]
    }
  };
  type HabitCategory = keyof typeof habitTemplates;
  const [activeCategory, setActiveCategory] = useState<HabitCategory>('productivity');

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
      setNewHabitIcon('✨')
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

  const icons = ['✨', '🧘', '💧', '🏃', '📚', '📵', '🎸', '✍️', '🥗', '😴', '🧹', '💪']

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
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden xs:inline">History</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            data-testid="add-habit-button"
            className="glass-button-primary px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Habit
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
              className="flex items-center gap-3 p-4 rounded-xl bg-bg-surface/30 border border-border-subtle hover:bg-bg-surface hover:border-accent-habit/50 hover:-translate-y-0.5 transition-all group cursor-pointer"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{preset.icon}</span>
              <span className="text-sm font-medium text-text-primary group-hover:text-accent-habit transition-colors text-left leading-tight">
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
                        <svg className="w-4 h-4 text-bg-app" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className="text-2xl">{habit.icon}</span>
                    <div>
                      <p className={`font-medium text-sm sm:text-base ${completed ? 'text-text-secondary' : 'text-text-primary'}`}>
                        {habit.name}
                      </p>
                      <p className="text-text-secondary text-xs sm:text-sm">
                        {habit.streak.current} day streak
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-accent-habit font-mono text-sm">{habit.streak.current}🔥</p>
                      <p className="text-text-secondary text-xs">current</p>
                    </div>
                    <button
                      onClick={() => deleteHabit(habit._id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
                        <svg className="w-4 h-4 text-bg-app" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className="text-2xl">{habit.icon}</span>
                    <div>
                      <p className={`font-medium ${completed ? 'text-text-secondary' : 'text-text-primary'}`}>
                        {habit.name}
                      </p>
                      <p className="text-text-secondary text-sm">
                        Total completions: {habit.streak.best} {/* Simplified for now */}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteHabit(habit._id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
            <h3 className="text-xl font-heading font-semibold text-text-primary mb-4">
              Add New Habit
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm mb-2">Habit Name</label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Morning Meditation"
                  data-testid="new-habit-name"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewHabitIcon(icon)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        newHabitIcon === icon 
                          ? 'bg-accent-habit/20 border-2 border-accent-habit' 
                          : 'bg-bg-surface hover:bg-bg-elevated'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-2">Frequency</label>
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
                className="flex-1 glass-button-primary py-2 rounded-lg disabled:opacity-50"
              >
                Add Habit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
