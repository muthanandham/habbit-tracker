import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Clock3,
  CheckSquare,
  Target,
  Activity,
  BookOpen,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Tag,
  Hash,
  AlertCircle,
  TrendingUp,
  Droplets,
  Smile,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'

type HistoryFilter = 'all' | 'task' | 'habit' | 'wellness' | 'journal'

function pad2(value: number) {
  return value.toString().padStart(2, '0')
}

function toLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function parseDateKey(dateKey: string) {
  // Interpreted as a local calendar date.
  return new Date(`${dateKey}T12:00:00`)
}

function formatDateLabel(dateKey: string) {
  return parseDateKey(dateKey).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRangeLabel(fromDate: string, toDate: string) {
  if (!fromDate || !toDate) return ''
  if (fromDate === toDate) return formatDateLabel(fromDate)
  return `${formatDateLabel(fromDate)} to ${formatDateLabel(toDate)}`
}

function addMonths(anchor: Date, delta: number) {
  const next = new Date(anchor)
  next.setMonth(next.getMonth() + delta)
  next.setDate(1)
  next.setHours(12, 0, 0, 0)
  return next
}

function isBetweenInclusive(dateKey: string, from: string, to: string) {
  if (!from || !to) return false
  const min = from < to ? from : to
  const max = from < to ? to : from
  return dateKey >= min && dateKey <= max
}

interface HabitRecord {
  _id: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  streak?: {
    current?: number
  }
  createdAt?: string
  updatedAt?: string
}

interface TaskRecord {
  _id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'done' | 'cancelled'
  isMustDo: boolean
  createdAt?: string
  updatedAt?: string
  completedAt?: string
}

interface WellnessRecord {
  _id?: string
  date: string
  mood?: {
    score?: number
  }
  nutrition?: {
    waterIntake?: number
  }
  createdAt?: string
  updatedAt?: string
}

interface JournalRecord {
  _id: string
  title?: string
  content: string
  mood?: number
  tags: string[]
  date: string
  createdAt?: string
  updatedAt?: string
}

interface TimelineRecord {
  id: string
  type: Exclude<HistoryFilter, 'all'>
  title: string
  subtitle: string
  detail: string
  timestamp: string
  metadata?: {
    tags?: string[]
    mood?: number
    fullContent?: string
    priority?: string
    status?: string
    streak?: number
    frequency?: string
    waterIntake?: number
    isMustDo?: boolean
  }
}

interface TimelineGroup {
  dateKey: string
  label: string
  records: TimelineRecord[]
}

const filterLabels: Record<HistoryFilter, string> = {
  all: 'All Records',
  task: 'Tasks',
  habit: 'Habits',
  wellness: 'Wellness',
  journal: 'Journal',
}

const typeStyles: Record<Exclude<HistoryFilter, 'all'>, { label: string; badge: string }> = {
  task: {
    label: 'Task',
    badge: 'bg-accent-task/15 text-accent-task',
  },
  habit: {
    label: 'Habit',
    badge: 'bg-accent-habit/15 text-accent-habit',
  },
  wellness: {
    label: 'Wellness',
    badge: 'bg-accent-wellness/15 text-accent-wellness',
  },
  journal: {
    label: 'Journal',
    badge: 'bg-accent-assistant/15 text-accent-assistant',
  },
}

export default function History() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialFilter = (searchParams.get('filter') as HistoryFilter) || 'all'
  
  const [loading, setLoading] = useState(true)
  const [filter, setFilterState] = useState<HistoryFilter>(initialFilter)
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => addMonths(new Date(), 0))
  const [habits, setHabits] = useState<HabitRecord[]>([])
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [wellness, setWellness] = useState<WellnessRecord[]>([])
  const [journals, setJournals] = useState<JournalRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<TimelineRecord | null>(null)
  const calendarRef = useRef<HTMLDivElement | null>(null)

  const setFilter = (newFilter: HistoryFilter) => {
    setFilterState(newFilter)
    setSearchParams(prev => {
      if (newFilter === 'all') prev.delete('filter')
      else prev.set('filter', newFilter)
      return prev
    })
  }

  const fetchRecords = useCallback(async () => {
    try {
      const [habitsRes, tasksRes, wellnessRes, journalsRes] = await Promise.all([
        api.get('/habits'),
        api.get('/tasks'),
        api.get('/wellness'),
        api.get('/journal'),
      ])

      setHabits(habitsRes.data)
      setTasks(tasksRes.data)
      setWellness(wellnessRes.data)
      setJournals(journalsRes.data)
    } catch (error) {
      console.error('Failed to fetch history records', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  useEffect(() => {
    const handleEntityUpdated = () => {
      fetchRecords()
    }

    window.addEventListener('lifeos:entity-updated', handleEntityUpdated)
    return () => window.removeEventListener('lifeos:entity-updated', handleEntityUpdated)
  }, [fetchRecords])

  useEffect(() => {
    if (!calendarOpen && !selectedRecord) return

    const handlePointerDown = (event: MouseEvent) => {
      if (calendarOpen) {
        if (!(event.target instanceof Node)) return
        if (!calendarRef.current) return
        if (calendarRef.current.contains(event.target)) return
        setCalendarOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCalendarOpen(false)
        setSelectedRecord(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [calendarOpen, selectedRecord])

  useEffect(() => {
    if (!calendarOpen) return
    if (fromDate) {
      setCalendarMonth(addMonths(parseDateKey(fromDate), 0))
      return
    }
    setCalendarMonth(addMonths(new Date(), 0))
  }, [calendarOpen, fromDate])

  const timeline = useMemo<TimelineRecord[]>(() => {
    const habitRecords = habits.map((habit) => ({
      id: `habit-${habit._id}`,
      type: 'habit' as const,
      title: habit.name,
      subtitle: `${habit.frequency} habit`,
      detail: `Current streak: ${habit.streak?.current || 0} days`,
      timestamp: habit.updatedAt || habit.createdAt || new Date().toISOString(),
      metadata: {
        streak: habit.streak?.current,
        frequency: habit.frequency
      }
    }))

    const taskRecords = tasks.map((task) => ({
      id: `task-${task._id}`,
      type: 'task' as const,
      title: task.title,
      subtitle: `${task.priority} priority${task.isMustDo ? ' • must-do' : ''}`,
      detail: `Status: ${task.status.replace('_', ' ')}`,
      timestamp: task.completedAt || task.updatedAt || task.createdAt || new Date().toISOString(),
      metadata: {
        priority: task.priority,
        status: task.status,
        isMustDo: task.isMustDo
      }
    }))

    const wellnessRecords = wellness.map((entry) => ({
      id: `wellness-${entry._id || entry.date}`,
      type: 'wellness' as const,
      title: `Wellness log for ${new Date(entry.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`,
      subtitle: `Mood ${entry.mood?.score || 0}/10`,
      detail: `Water intake: ${entry.nutrition?.waterIntake || 0}ml`,
      timestamp: entry.updatedAt || entry.createdAt || `${entry.date}T12:00:00.000Z`,
      metadata: {
        mood: entry.mood?.score,
        waterIntake: entry.nutrition?.waterIntake
      }
    }))

    const journalRecords = journals.map((entry) => ({
      id: `journal-${entry._id}`,
      type: 'journal' as const,
      title: entry.title || 'Untitled journal entry',
      subtitle: `Mood ${entry.mood || 0}/10 • ${entry.tags.length} tags`,
      detail: entry.content.slice(0, 120),
      timestamp: entry.updatedAt || entry.createdAt || `${entry.date}T12:00:00.000Z`,
      metadata: {
        fullContent: entry.content,
        tags: entry.tags,
        mood: entry.mood
      }
    }))

    return [...taskRecords, ...habitRecords, ...wellnessRecords, ...journalRecords].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [habits, tasks, wellness, journals])

  const filteredTimeline = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const fromBoundary = fromDate ? new Date(`${fromDate}T00:00:00`) : null
    const toBoundary = toDate ? new Date(`${toDate}T23:59:59.999`) : null

    return timeline.filter((record) => {
      const recordTime = new Date(record.timestamp).getTime()
      const matchesFilter = filter === 'all' || record.type === filter
      const matchesSearch =
        !normalizedSearch ||
        record.title.toLowerCase().includes(normalizedSearch) ||
        record.subtitle.toLowerCase().includes(normalizedSearch) ||
        record.detail.toLowerCase().includes(normalizedSearch)
      const matchesFromDate = !fromBoundary || recordTime >= fromBoundary.getTime()
      const matchesToDate = !toBoundary || recordTime <= toBoundary.getTime()

      return matchesFilter && matchesSearch && matchesFromDate && matchesToDate
    })
  }, [timeline, filter, search, fromDate, toDate])

  const groupedTimeline = useMemo<TimelineGroup[]>(() => {
    const groups = new Map<string, TimelineRecord[]>()

    filteredTimeline.forEach((record) => {
      const dateKey = toLocalDateKey(new Date(record.timestamp))
      const current = groups.get(dateKey) || []
      current.push(record)
      groups.set(dateKey, current)
    })

    return Array.from(groups.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([dateKey, records]) => ({
        dateKey,
        label: parseDateKey(dateKey).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        records,
      }))
  }, [filteredTimeline])

  const stats = {
    total: timeline.length,
    tasks: tasks.length,
    habits: habits.length,
    wellness: wellness.length,
    journals: journals.length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-assistant"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-text-primary">
            History Records
          </h1>
          <p className="text-text-secondary mt-1">
            A unified archive of habits, tasks, wellness check-ins, and journal entries.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-full bg-accent-gold/10 px-4 py-2 text-sm text-accent-gold">
          <Clock3 className="w-4 h-4" />
          Chronological View
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card-elevated p-4">
          <p className="text-text-secondary text-sm">All Records</p>
          <p className="text-2xl font-heading font-bold text-text-primary mt-1">{stats.total}</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-text-secondary text-sm">Tasks</p>
          <p className="text-2xl font-heading font-bold text-accent-task mt-1">{stats.tasks}</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-text-secondary text-sm">Habits</p>
          <p className="text-2xl font-heading font-bold text-accent-habit mt-1">{stats.habits}</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-text-secondary text-sm">Wellness Logs</p>
          <p className="text-2xl font-heading font-bold text-accent-wellness mt-1">{stats.wellness}</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-text-secondary text-sm">Journal Entries</p>
          <p className="text-2xl font-heading font-bold text-accent-assistant mt-1">{stats.journals}</p>
        </div>
      </div>

      <div className="card-elevated p-5 space-y-5">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(filterLabels) as HistoryFilter[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  filter === option
                    ? 'bg-accent-gold text-accent-foreground shadow-lg shadow-accent-gold/20'
                    : 'bg-border-subtle text-text-secondary hover:bg-border-bright hover:text-text-primary'
                }`}
              >
                {filterLabels[option]}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search records..."
              className="input-field w-full pl-11"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between" ref={calendarRef}>
          <div className="xl:max-w-xl xl:flex-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Date
                </span>
                <span className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                  Click start, then end
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCalendarOpen((open) => !open)}
                className="input-field flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className={fromDate && toDate ? 'text-text-primary' : 'text-text-muted'}>
                  {fromDate && toDate ? formatRangeLabel(fromDate, toDate) : 'All dates'}
                </span>
                <Calendar className="h-4 w-4 text-text-muted" />
              </button>
            </div>

            {calendarOpen && (
              <div className="relative mt-3 rounded-3xl border border-border-subtle bg-bg-surface/95 p-4 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((current) => addMonths(current, -1))}
                    className="rounded-full bg-border-subtle p-2 text-text-secondary transition-all hover:bg-border-bright hover:text-text-primary"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="text-sm font-semibold text-text-primary">
                    {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCalendarMonth((current) => addMonths(current, 1))}
                    className="rounded-full bg-border-subtle p-2 text-text-secondary transition-all hover:bg-border-bright hover:text-text-primary"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-1">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-7 gap-1">
                  {(() => {
                    const monthStart = new Date(calendarMonth)
                    monthStart.setDate(1)
                    monthStart.setHours(12, 0, 0, 0)
                    const startWeekday = monthStart.getDay()
                    const lastDay = new Date(calendarMonth)
                    lastDay.setMonth(lastDay.getMonth() + 1)
                    lastDay.setDate(0)
                    lastDay.setHours(12, 0, 0, 0)
                    const daysInMonth = lastDay.getDate()

                    const cells: Array<{ dateKey: string; inMonth: boolean }> = []

                    for (let i = 0; i < startWeekday; i += 1) {
                      const day = new Date(monthStart)
                      day.setDate(day.getDate() - (startWeekday - i))
                      cells.push({ dateKey: toLocalDateKey(day), inMonth: false })
                    }

                    for (let dayNum = 1; dayNum <= daysInMonth; dayNum += 1) {
                      const day = new Date(monthStart)
                      day.setDate(dayNum)
                      cells.push({ dateKey: toLocalDateKey(day), inMonth: true })
                    }

                    while (cells.length % 7 !== 0) {
                      const last = parseDateKey(cells[cells.length - 1].dateKey)
                      const next = new Date(last)
                      next.setDate(next.getDate() + 1)
                      next.setHours(12, 0, 0, 0)
                      cells.push({ dateKey: toLocalDateKey(next), inMonth: false })
                    }

                    const handlePick = (dateKey: string) => {
                      if (!fromDate && !toDate) {
                        setFromDate(dateKey)
                        setToDate(dateKey)
                        return
                      }

                      if (fromDate && toDate && fromDate === toDate) {
                        const start = fromDate < dateKey ? fromDate : dateKey
                        const end = fromDate < dateKey ? dateKey : fromDate
                        setFromDate(start)
                        setToDate(end)
                        return
                      }

                      setFromDate(dateKey)
                      setToDate(dateKey)
                    }

                    return cells.map((cell) => {
                      const isSelected = fromDate && toDate && isBetweenInclusive(cell.dateKey, fromDate, toDate)
                      const isEdge = cell.dateKey === fromDate || cell.dateKey === toDate
                      const base =
                        'h-10 w-full rounded-2xl text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/40'
                      const inMonthTone = cell.inMonth ? 'text-text-primary' : 'text-text-muted/60'
                      const selectedTone = isSelected
                        ? isEdge
                          ? 'bg-accent-gold text-accent-foreground shadow-lg shadow-accent-gold/15'
                          : 'bg-accent-gold/15 text-text-primary'
                        : 'bg-transparent hover:bg-border-bright'

                      return (
                        <button
                          key={cell.dateKey}
                          type="button"
                          onClick={() => handlePick(cell.dateKey)}
                          className={`${base} ${inMonthTone} ${selectedTone}`}
                          aria-label={formatDateLabel(cell.dateKey)}
                        >
                          {Number(cell.dateKey.split('-')[2])}
                        </button>
                      )
                    })
                  })()}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs uppercase tracking-[0.16em] text-text-muted">
                    {fromDate && toDate ? formatRangeLabel(fromDate, toDate) : 'All dates'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFromDate('')
                        setToDate('')
                      }}
                      className="rounded-full bg-border-subtle px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary transition-all hover:bg-border-bright hover:text-text-primary"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarOpen(false)}
                      className="rounded-full bg-accent-gold px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground shadow-lg shadow-accent-gold/20 transition-all hover:brightness-110"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setFromDate('')
              setToDate('')
            }}
            className="rounded-full bg-border-subtle px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-border-bright hover:text-text-primary"
          >
            Clear Dates
          </button>
        </div>

        <div className="space-y-8">
          {groupedTimeline.map((group) => (
            <section key={group.dateKey} className="space-y-3">
              <div className="sticky top-0 z-10 -mx-2 rounded-2xl bg-bg-surface/90 px-2 py-2 backdrop-blur">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-text-primary">
                    {group.label}
                  </h2>
                  <span className="text-xs uppercase tracking-[0.16em] text-text-muted">
                    {group.records.length} record{group.records.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {group.records.map((record) => {
                const style = typeStyles[record.type]
                const Icon =
                  record.type === 'task'
                    ? CheckSquare
                    : record.type === 'habit'
                      ? Target
                      : record.type === 'wellness'
                        ? Activity
                        : BookOpen

                return (
                  <div
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="group relative rounded-2xl border border-border-subtle bg-bg-surface/40 p-4 transition-all hover:border-border-bright hover:bg-bg-surface/60 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/0 to-accent-gold/0 group-hover:from-accent-gold/[0.02] group-hover:to-accent-gold/[0.05] transition-all duration-500" />
                    <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-4">
                        <div className="mt-0.5 rounded-2xl bg-border-subtle p-3 group-hover:bg-border-bright transition-colors">
                          <Icon className="h-5 w-5 text-text-primary" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-text-primary group-hover:text-accent-gold transition-colors">{record.title}</h3>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${style.badge}`}>
                              {style.label}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary">{record.subtitle}</p>
                          <p className="text-sm leading-relaxed text-text-muted line-clamp-1">{record.detail}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-xs uppercase tracking-[0.18em] text-text-muted">
                        {new Date(record.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </section>
          ))}

          {groupedTimeline.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-border-subtle py-16 text-center">
              <p className="text-text-secondary">
                No records match your current filter.
              </p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecord(null)}
              className="absolute inset-0 bg-bg-app/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-border-bright bg-bg-surface shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2 ${typeStyles[selectedRecord.type].badge}`}>
                    {selectedRecord.type === 'task' ? <CheckSquare className="w-5 h-5" /> :
                     selectedRecord.type === 'habit' ? <Target className="w-5 h-5" /> :
                     selectedRecord.type === 'wellness' ? <Activity className="w-5 h-5" /> :
                     <BookOpen className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-heading font-semibold text-text-primary">
                      {typeStyles[selectedRecord.type].label} Details
                    </h2>
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">
                      {new Date(selectedRecord.timestamp).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="rounded-full p-2 text-text-muted transition-all hover:bg-border-subtle hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {selectedRecord.type === 'journal' ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h1 className="text-3xl font-heading font-bold text-text-primary leading-tight">
                        {selectedRecord.title}
                      </h1>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {selectedRecord.metadata?.tags?.map(tag => (
                          <span key={tag} className="flex items-center gap-1.5 rounded-full bg-accent-assistant/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-assistant border border-accent-assistant/20">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 py-4 border-y border-border-subtle/50">
                      <div className="flex items-center gap-2">
                        <Smile className="w-5 h-5 text-accent-gold" />
                        <span className="text-sm font-medium text-text-secondary">Mood Score:</span>
                        <span className="text-sm font-bold text-text-primary">{selectedRecord.metadata?.mood}/10</span>
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                      <p className="text-lg leading-relaxed text-text-secondary whitespace-pre-wrap font-precision">
                        {selectedRecord.metadata?.fullContent}
                      </p>
                    </div>
                  </div>
                ) : selectedRecord.type === 'task' ? (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h1 className="text-3xl font-heading font-bold text-text-primary">
                        {selectedRecord.title}
                      </h1>
                      <div className="flex flex-wrap gap-3">
                        <span className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${
                          selectedRecord.metadata?.status === 'done' ? 'bg-green-500/10 text-green-500' : 'bg-accent-gold/10 text-accent-gold'
                        }`}>
                          <Hash className="w-3.5 h-3.5" />
                          {selectedRecord.metadata?.status?.replace('_', ' ')}
                        </span>
                        <span className="flex items-center gap-2 rounded-full bg-accent-task/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent-task">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {selectedRecord.metadata?.priority} Priority
                        </span>
                        {selectedRecord.metadata?.isMustDo && (
                          <span className="flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-500">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Critical Must-Do
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-bg-app/50 p-6 border border-border-subtle">
                      <p className="text-text-secondary leading-relaxed">
                        This task was tracked as part of your daily productivity flow. 
                        It is marked as <span className="text-text-primary font-semibold">{selectedRecord.metadata?.status?.replace('_', ' ')}</span>.
                      </p>
                    </div>
                  </div>
                ) : selectedRecord.type === 'habit' ? (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h1 className="text-3xl font-heading font-bold text-text-primary">
                        {selectedRecord.title}
                      </h1>
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-2 rounded-full bg-accent-habit/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent-habit">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {selectedRecord.metadata?.streak} Day Streak
                        </span>
                        <span className="flex items-center gap-2 rounded-full bg-border-subtle px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-text-secondary">
                          <Clock3 className="w-3.5 h-3.5" />
                          {selectedRecord.metadata?.frequency} Frequency
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-bg-app/50 p-6 border border-border-subtle">
                        <h4 className="text-xs uppercase tracking-widest text-text-muted mb-2 font-bold">Consistency</h4>
                        <p className="text-2xl font-bold text-text-primary">{selectedRecord.metadata?.streak} Days</p>
                        <p className="text-xs text-text-secondary mt-1">Keep the momentum going!</p>
                      </div>
                      <div className="rounded-2xl bg-bg-app/50 p-6 border border-border-subtle">
                        <h4 className="text-xs uppercase tracking-widest text-text-muted mb-2 font-bold">Cadence</h4>
                        <p className="text-2xl font-bold text-text-primary">{selectedRecord.metadata?.frequency?.charAt(0).toUpperCase()}{selectedRecord.metadata?.frequency?.slice(1)}</p>
                        <p className="text-xs text-text-secondary mt-1">Scheduled frequency</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h1 className="text-3xl font-heading font-bold text-text-primary">
                        Wellness Check-in
                      </h1>
                      <p className="text-text-secondary">{selectedRecord.title}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="rounded-2xl bg-bg-app/50 p-6 border border-border-subtle">
                        <div className="flex items-center justify-between mb-4">
                          <Smile className="w-8 h-8 text-accent-gold" />
                          <span className="text-3xl font-bold text-text-primary">{selectedRecord.metadata?.mood}/10</span>
                        </div>
                        <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold">Mental Clarity</h4>
                        <div className="mt-4 h-2 w-full bg-border-subtle rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent-gold" 
                            style={{ width: `${(selectedRecord.metadata?.mood || 0) * 10}%` }}
                          />
                        </div>
                      </div>
                      <div className="rounded-2xl bg-bg-app/50 p-6 border border-border-subtle">
                        <div className="flex items-center justify-between mb-4">
                          <Droplets className="w-8 h-8 text-blue-400" />
                          <span className="text-3xl font-bold text-text-primary">{selectedRecord.metadata?.waterIntake}ml</span>
                        </div>
                        <h4 className="text-xs uppercase tracking-widest text-text-muted font-bold">Hydration Level</h4>
                        <p className="text-xs text-text-secondary mt-2">Daily intake recorded</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-border-subtle bg-bg-surface/50 px-6 py-4 flex justify-end items-center gap-3">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="rounded-full bg-border-subtle px-6 py-2 text-sm font-semibold text-text-primary hover:bg-border-bright transition-all"
                >
                  Close Archive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
