import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import api from '../api'

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
      setAiPulse("Your AI intelligence layer is currently offline. Connect a Gemini API Key to activate proactive insights.");
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
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden xs:inline">History</span>
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
            <div className="w-12 h-12 rounded-full bg-accent-habit/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-habit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 13 11 14 13 17.657 18.657z" />
              </svg>
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
            <div className="w-12 h-12 rounded-full bg-accent-task/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-task" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
            <div className="w-12 h-12 rounded-full bg-accent-wellness/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-wellness" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
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
                        <svg className="w-3 h-3 text-bg-app" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xl">{habit.icon}</span>
                    <span className={completed ? 'text-text-secondary line-through' : 'text-text-primary'}>
                      {habit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-accent-habit">{habit.streak.current}🔥</span>
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
          <div className="p-4 rounded-lg bg-bg-surface/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{stats.mood >= 8 ? '😊' : stats.mood >= 5 ? '😐' : '😔'}</span>
              <span className="text-text-secondary text-sm">Today&apos;s Mood</span>
            </div>
            <div className="flex items-end gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div
                  key={n}
                  className={`w-full rounded-t transition-all ${
                    n <= stats.mood 
                      ? 'bg-accent-wellness h-8' 
                      : 'bg-bg-lowered h-4'
                  }`}
                />
              ))}
            </div>
            <p className="text-text-primary mt-2 font-mono text-lg">{stats.mood || 0}/10</p>
          </div>

          {/* Energy */}
          <div className="p-4 rounded-lg bg-bg-surface/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚡</span>
              <span className="text-text-secondary text-sm">Morning Energy</span>
            </div>
            <div className="flex items-end gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div
                  key={n}
                  className={`w-full rounded-t transition-all ${
                    n <= stats.energy 
                      ? 'bg-accent-assistant h-8' 
                      : 'bg-bg-lowered h-4'
                  }`}
                />
              ))}
            </div>
            <p className="text-text-primary mt-2 font-mono text-lg">{stats.energy || 0}/10</p>
          </div>

          {/* Sleep */}
          <div className="p-4 rounded-lg bg-bg-surface/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">😴</span>
              <span className="text-text-secondary text-sm">Sleep</span>
            </div>
            <p className="text-text-primary text-2xl font-mono">{stats.sleepDuration}h</p>
            <p className="text-text-secondary text-xs mt-1">Goal: 8h</p>
            <div className="mt-2 h-2 bg-bg-lowered rounded-full overflow-hidden">
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
        <div className="p-4 rounded-lg bg-gradient-to-r from-accent-assistant/10 to-accent-habit/10 border border-accent-assistant/20">
          <p className="text-text-primary text-sm leading-relaxed">
            <span className="text-accent-assistant font-medium mr-2">Digital Pulse:</span> 
            {aiLoading ? (
              <span className="animate-pulse">Retrieving insights from the Archive...</span>
            ) : (
              aiPulse
            )}
          </p>
        </div>
      </div>
    </div>
  )
}