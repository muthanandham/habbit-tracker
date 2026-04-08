import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Activity, Moon, Zap, CheckCircle, ListTodo, TrendingUp, History as HistoryIcon } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import api from '../api'
import { ModuleIcon } from '../components/ModuleIcon'


interface TodayStats {
  habitsCompleted: number
  totalHabits: number
  tasksCompleted: number
  totalTasks: number
  currentStreak: number
  mood: number
  energy: number
  sleepDuration: number
}

interface Habit {
  _id: string
  name: string
  icon: string
  frequency: string
  streak: {
    current: number
    lastCompletedDate?: string
  }
}

interface Task {
  _id: string
  title: string
  priority: string
  status: string
  isMustDo: boolean
}

interface Wellness {
  _id: string
  mood: { score: number }
  energy: { morning: number }
  sleep: { duration: number }
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [habits, setHabits] = useState<Habit[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [wellness, setWellness] = useState<Wellness | null>(null)
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')
  const [aiPulse, setAiPulse] = useState<string>('')
  const [aiLoading, setAiLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  const fetchAiPulse = useCallback(async () => {
    try {
      const res = await api.post('/ai/process', { 
        input: "Give me a 1-sentence proactive pulse check on my day based on my data. Keep it premium and motivational." 
      });
      setAiPulse(res.data.message);
    } catch (error) {
      setAiPulse("Your AI intelligence layer is currently offline. Configure your AI provider to activate proactive insights.");

    } finally {
      setAiLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [habitsRes, tasksRes, wellnessRes] = await Promise.all([
        api.get('/habits'),
        api.get('/tasks'),
        api.get(`/wellness/date/${today}`)
      ]);
      
      setHabits(habitsRes.data);
      setTasks(tasksRes.data);
      if (wellnessRes.data) {
        setWellness(wellnessRes.data);
      }

      // Fetch AI Pulse separately to not block main dashboard
      fetchAiPulse();
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  }, [today, fetchAiPulse]);

  useEffect(() => {
    fetchData();
    
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [fetchData])

  const isCompletedToday = (lastCompletedDate?: string) => {
    if (!lastCompletedDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    const last = new Date(lastCompletedDate).toISOString().split('T')[0];
    return todayStr === last;
  };

  const stats: TodayStats = {
    habitsCompleted: habits.filter(h => h.frequency === 'daily' && isCompletedToday(h.streak.lastCompletedDate)).length,
    totalHabits: habits.filter(h => h.frequency === 'daily').length,
    tasksCompleted: tasks.filter(t => t.status === 'done').length,
    totalTasks: tasks.length,
    currentStreak: habits.length > 0 ? Math.max(...habits.map(h => h.streak.current), 0) : 0,
    mood: wellness?.mood?.score || 0,
    energy: wellness?.energy?.morning || 0, // Simplified for dashboard
    sleepDuration: wellness?.sleep?.duration || 0
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTimePhase = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }

  const timePhase = getTimePhase()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-assistant"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-text-primary">
            {greeting}, {user?.firstName || user?.username || 'there'}
          </h1>
          <p className="text-text-secondary text-sm mt-1">{formatDate()}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${
            timePhase === 'morning' ? 'bg-yellow-500/20 text-yellow-400' :
            timePhase === 'afternoon' ? 'bg-orange-500/20 text-orange-400' :
            'bg-indigo-500/20 text-indigo-400'
          }`}>
            {timePhase.charAt(0).toUpperCase() + timePhase.slice(1)} Mode
          </div>
          <Link to="/history?filter=task" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-surface border border-border-subtle text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-bright transition-all">
            <HistoryIcon size={16} strokeWidth={1.5} />
            <span className="hidden xs:inline">Archive</span>
          </Link>

        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Longest Streak</p>
              <p className="text-3xl font-heading font-bold text-accent-habit mt-1">
                {stats.currentStreak}
              </p>
              <p className="text-text-secondary text-xs mt-1">days</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-accent-habit/10 flex items-center justify-center border border-accent-habit/20">
              <TrendingUp size={24} className="text-accent-habit" />
            </div>
          </div>
        </div>

        {/* Habits Progress */}
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Today&apos;s Habits</p>
              <p className="text-3xl font-heading font-bold text-accent-task mt-1">
                {stats.habitsCompleted}/{stats.totalHabits}
              </p>
              <p className="text-text-secondary text-xs mt-1">
                {stats.totalHabits > 0 ? Math.round((stats.habitsCompleted / stats.totalHabits) * 100) : 0}% complete
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-accent-task/10 flex items-center justify-center border border-accent-task/20">
              <CheckCircle size={24} className="text-accent-task" />
            </div>
          </div>
        </div>

        {/* Tasks Progress */}
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Today&apos;s Tasks</p>
              <p className="text-3xl font-heading font-bold text-accent-wellness mt-1">
                {stats.tasksCompleted}/{stats.totalTasks}
              </p>
              <p className="text-text-secondary text-xs mt-1">
                {stats.totalTasks > 0 ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) : 0}% complete
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-accent-wellness/10 flex items-center justify-center border border-accent-wellness/20">
              <ListTodo size={24} className="text-accent-wellness" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Habits Section */}
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              Active Habits
            </h2>
            <Link to="/habits" className="text-sm text-accent-habit hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {habits.slice(0, 5).map((habit) => {
              const completed = isCompletedToday(habit.streak.lastCompletedDate);
              return (
                <div key={habit._id} className="flex items-center justify-between p-3 rounded-lg bg-bg-surface/50 hover:bg-bg-surface transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      completed 
                        ? 'border-accent-habit bg-accent-habit' 
                        : 'border-text-secondary'
                    }`}>
                      {completed && (
                        <CheckCircle size={12} className="text-bg-app" />
                      )}
                    </div>
                    <div className="p-1.5 rounded-lg bg-bg-lowered">
                      <ModuleIcon name={habit.icon} size={16} module="habit" />
                    </div>
                    <span className={`text-sm ${completed ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                      {habit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-accent-habit">
                    {habit.streak.current} <Zap size={10} fill="currentColor" />
                  </div>
                </div>
              );
            })}
            {habits.length === 0 && (
              <p className="text-text-secondary text-sm py-4 italic">No habits found. Time to start something new!</p>
            )}
          </div>
        </div>

        {/* Today's Tasks Section */}
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              Must-Do Tasks
            </h2>
            <Link to="/tasks" className="text-sm text-accent-task hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {tasks.filter(t => t.isMustDo && t.status !== 'done').slice(0, 4).map((task) => (
              <div key={task._id} className="flex items-center justify-between p-3 rounded-lg bg-bg-surface/50 hover:bg-bg-surface transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.priority === 'high' || task.priority === 'urgent'
                      ? 'border-red-500'
                      : 'border-text-secondary'
                  }`}>
                  </div>
                  <span className="text-text-primary font-medium">
                    {task.title}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                  task.priority === 'urgent' ? 'bg-red-500/20 text-red-500' :
                  task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
            {tasks.filter(t => t.isMustDo && t.status !== 'done').length === 0 && (
              <p className="text-text-secondary text-sm py-4 italic">You&apos;ve cleared all your focus tasks!</p>
            )}
          </div>
        </div>
      </div>

      {/* Wellness Pulse Section */}
      <div className="card-elevated p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-text-primary">
            Wellness Pulse
          </h2>
          <Link to="/wellness" className="text-sm text-accent-wellness hover:underline">
            Details
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center sm:text-left">
          {/* Mood */}
          <div className="p-4 rounded-xl bg-bg-surface/50 border border-border-subtle/50">
            <div className="flex items-center gap-2 mb-3">
              <ModuleIcon name={stats.mood >= 8 ? 'smile' : stats.mood >= 5 ? 'meh' : 'frown'} size={18} module="wellness" />
              <span className="text-text-secondary text-[11px] uppercase tracking-wider font-semibold">Mood Score</span>
            </div>
            <div className="flex items-end gap-1 h-10">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div
                  key={n}
                  className={`w-full rounded-t-sm transition-all ${
                    n <= stats.mood 
                      ? 'bg-accent-wellness' 
                      : 'bg-bg-lowered'
                  }`}
                  style={{ height: `${n <= stats.mood ? 100 : 20}%` }}
                />
              ))}
            </div>
            <p className="text-text-primary mt-3 font-mono text-xl">{stats.mood || 0}<span className="text-text-muted text-xs ml-1">/10</span></p>
          </div>

          {/* Energy */}
          <div className="p-4 rounded-xl bg-bg-surface/50 border border-border-subtle/50">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={18} className="text-accent-assistant" />
              <span className="text-text-secondary text-[11px] uppercase tracking-wider font-semibold">Energy Level</span>
            </div>
            <div className="flex items-end gap-1 h-10">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div
                  key={n}
                  className={`w-full rounded-t-sm transition-all ${
                    n <= stats.energy 
                      ? 'bg-accent-assistant' 
                      : 'bg-bg-lowered'
                  }`}
                  style={{ height: `${n <= stats.energy ? 100 : 20}%` }}
                />
              ))}
            </div>
            <p className="text-text-primary mt-3 font-mono text-xl">{stats.energy || 0}<span className="text-text-muted text-xs ml-1">/10</span></p>
          </div>

          {/* Sleep */}
          <div className="p-4 rounded-xl bg-bg-surface/50 border border-border-subtle/50">
            <div className="flex items-center gap-2 mb-3">
              <Moon size={18} className="text-accent-habit" />
              <span className="text-text-secondary text-[11px] uppercase tracking-wider font-semibold">Sleep Matrix</span>
            </div>
            <p className="text-text-primary text-2xl font-mono leading-none">{stats.sleepDuration}<span className="text-xs text-text-muted ml-1">HOURS</span></p>
            <p className="text-text-secondary text-[10px] mt-2 font-medium tracking-wide">TARGET: 8.0H</p>
            <div className="mt-3 h-1.5 bg-bg-lowered rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-habit rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((stats.sleepDuration / 8) * 100, 100)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="card-elevated p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-text-primary">
            AI Engine
          </h2>
          <Link to="/ai-assistant" className="text-sm text-accent-assistant hover:underline">
            Chat
          </Link>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-bg-elevated to-bg-surface border border-accent-assistant/20 shadow-lg shadow-accent-assistant/5">
          <div className="text-text-primary text-sm leading-relaxed flex items-start gap-4">
            <div className="p-2 rounded-xl bg-accent-assistant/10 border border-accent-assistant/20 shrink-0">
              <Sparkles size={18} className="text-accent-assistant" />
            </div>
            <div className="pt-1">
              <span className="text-accent-assistant font-semibold uppercase tracking-wider text-[10px] block mb-1">Archive Intelligence Layer</span> 
              {aiLoading ? (
                <span className="animate-pulse text-text-secondary italic">Retrieving insights from the Archive...</span>
              ) : (
                <span className="text-text-primary font-medium">{aiPulse}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}