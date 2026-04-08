import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, CheckCircle, Circle, Star, Calendar, AlertCircle } from 'lucide-react'
import api from '../api'

interface Task {
  _id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'done' | 'cancelled'
  isMustDo: boolean
  dueDate?: string
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddModal, setShowAddModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium')
  const [isMustDo, setIsMustDo] = useState(false)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const handleEntityUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ entity?: string }>;
      if (customEvent.detail?.entity === 'tasks') {
        fetchTasks();
      }
    };

    window.addEventListener('lifeos:entity-updated', handleEntityUpdated as EventListener);
    return () => window.removeEventListener('lifeos:entity-updated', handleEntityUpdated as EventListener);
  }, [fetchTasks]);

  const toggleTask = async (id: string, currentStatus: string) => {
    try {
      const newStatus: Task['status'] = currentStatus === 'done' ? 'todo' : 'done';
      await api.patch(`/tasks/${id}/status`, { status: newStatus });
      setTasks(tasks.map(t => 
        t._id === id ? { ...t, status: newStatus } : t
      ));
    } catch (error) {
      console.error('Failed to toggle task', error);
    }
  }

  const toggleMustDo = async (id: string, currentVal: boolean) => {
    try {
      await api.put(`/tasks/${id}`, { isMustDo: !currentVal });
      setTasks(tasks.map(t => 
        t._id === id ? { ...t, isMustDo: !currentVal } : t
      ));
    } catch (error) {
      console.error('Failed to update priority', error);
    }
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) return
    
    try {
      await api.post('/tasks', {
        title: newTaskTitle,
        priority: newTaskPriority,
        isMustDo: isMustDo,
        status: 'todo'
      });
      setNewTaskTitle('')
      setNewTaskPriority('medium')
      setIsMustDo(false)
      setShowAddModal(false)
      fetchTasks();
    } catch (error) {
      console.error('Failed to add task', error);
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  }

  const mustDoTasks = tasks.filter(t => t.isMustDo && t.status !== 'done')
  const otherTasks = tasks.filter(t => !t.isMustDo && t.status !== 'done')
  const completedTasks = tasks.filter(t => t.status === 'done')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-task"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-text-primary">
            Tasks
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {mustDoTasks.length > 0 ? `Focus on your ${mustDoTasks.length} must-do items` : 'Manage your daily objectives'}
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          data-testid="add-task-button"
          className="glass-button-primary px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
        >
          <Plus size={18} strokeWidth={1.5} />
          Initialize Objective
        </button>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Must-Do Section */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-heading font-semibold text-accent-task flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-task animate-pulse" />
            Must-Do List
          </h2>
          <div className="space-y-3">
            {mustDoTasks.map(task => (
              <div 
                key={task._id} 
                data-testid={`task-item-${task.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-bg-surface/50 border border-border-subtle hover:border-accent-task/30 transition-all group shadow-sm"
              >
                <button 
                  onClick={() => toggleTask(task._id, task.status)}
                  data-testid="task-toggle"
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.status === 'done' 
                      ? 'border-accent-task bg-accent-task' 
                      : 'border-text-secondary hover:border-accent-task'
                  }`}
                >
                  {task.status === 'done' ? (
                    <CheckCircle size={14} className="text-bg-app" strokeWidth={3} />
                  ) : (
                    <Circle size={14} className="opacity-0 group-hover:opacity-40" />
                  )}
                </button>
                <span className={`flex-1 text-sm sm:text-base font-medium ${task.status === 'done' ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                   {task.title}
                 </span>
                 <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                   task.priority === 'urgent' ? 'bg-red-500/20 text-red-500' :
                   task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                   'bg-accent-task/10 text-accent-task'
                 }`}>
                   {task.priority}
                 </span>
                <button 
                  onClick={() => toggleMustDo(task._id, task.isMustDo)}
                  className="p-1.5 text-accent-task hover:bg-accent-task/10 rounded-lg transition-all"
                  title="Unmark as Must-Do"
                >
                  <Star size={16} fill="currentColor" strokeWidth={1.5} className="text-accent-gold" />

                </button>
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} strokeWidth={1.5} className="text-red-400 group-hover:text-red-400 transition-colors" />

                </button>
              </div>
            ))}
            {mustDoTasks.length === 0 && (
              <div className="text-center py-12 bg-bg-surface/30 rounded-2xl border border-dashed border-border-subtle">
                <AlertCircle size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
                <p className="text-text-secondary text-sm italic">
                  No high-priority tasks. Add one below or mark an existing task.
                </p>
              </div>
            )}
          </div>

          <h2 className="text-lg font-heading font-semibold text-text-primary mt-12 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-text-muted" />
            Archive Backlog
          </h2>
          <div className="space-y-2">
            {otherTasks.map(task => (
              <div 
                key={task._id} 
                className="flex items-center gap-3 p-3 rounded-lg bg-bg-surface/30 border border-transparent hover:border-border-subtle hover:bg-bg-surface/50 transition-all group"
              >
                <button 
                  onClick={() => toggleTask(task._id, task.status)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.status === 'done' 
                      ? 'border-accent-task bg-accent-task' 
                      : 'border-text-secondary hover:border-accent-task'
                  }`}
                >
                  {task.status === 'done' && (
                    <CheckCircle size={12} className="text-bg-app" strokeWidth={3} />
                  )}
                </button>
                <span className={`text-sm flex-1 font-medium ${task.status === 'done' ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                  {task.title}
                </span>
                <button 
                  onClick={() => toggleMustDo(task._id, task.isMustDo)}
                  className="p-1.5 text-text-muted hover:text-accent-task hover:bg-accent-task/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Mark as Must-Do"
                >
                  <Star size={14} strokeWidth={1.5} className="text-accent-gold/40 group-hover:text-accent-gold transition-colors" />

                </button>
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            ))}
            {otherTasks.length === 0 && (
              <p className="text-text-secondary text-xs italic py-4 px-4 bg-bg-surface/20 rounded-lg">No other tasks in backlog.</p>
            )}
          </div>
        </div>

        {/* Completed Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-semibold text-text-muted tracking-tight">Vault History</h2>
          <div className="card-elevated p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {completedTasks.map(task => (
              <div 
                key={task._id} 
                className="flex items-center gap-3 p-3 rounded-xl bg-bg-surface/20 hover:bg-bg-surface/40 border border-transparent hover:border-border-subtle/30 transition-all group"
              >
                <button 
                  onClick={() => toggleTask(task._id, task.status)}
                  className="w-5 h-5 rounded-full bg-accent-task/10 border border-accent-task/20 flex items-center justify-center hover:bg-accent-task/20 transition-all"
                >
                  <CheckCircle size={12} className="text-accent-task" strokeWidth={2.5} />
                </button>
                <span className="text-sm text-text-muted line-through flex-1 font-medium">
                  {task.title}
                </span>
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={12} strokeWidth={1.5} />
                </button>
              </div>
            ))}
            {completedTasks.length === 0 && (
              <div className="text-center py-12 opacity-40">
                <p className="text-text-secondary text-xs">No tasks archived yet today.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-elevated p-6 w-full max-w-md mx-4 animate-in">
            <h3 className="text-xl font-heading font-semibold text-text-primary mb-6">
              Create New Objective
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-text-secondary text-[11px] uppercase tracking-wider font-semibold mb-2">Objective Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What is your focus?"
                  data-testid="new-task-title"
                  className="input-field w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-text-secondary text-[11px] uppercase tracking-wider font-semibold mb-2">Priority Matrix</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTaskPriority(p)}
                      className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all border ${
                        newTaskPriority === p
                          ? 'bg-accent-task border-accent-task text-bg-app shadow-lg shadow-accent-task/20'
                          : 'bg-bg-lowered border-border-subtle text-text-secondary hover:border-text-muted'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-4 p-4 rounded-xl bg-bg-lowered border border-border-subtle cursor-pointer hover:border-accent-task/40 transition-all group">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  isMustDo ? 'bg-accent-task border-accent-task' : 'border-text-muted group-hover:border-text-primary'
                }`}>
                  {isMustDo && <Star size={14} fill="currentColor" className="text-bg-app" />}
                </div>
                <input 
                  type="checkbox" 
                  checked={isMustDo}
                  onChange={(e) => setIsMustDo(e.target.checked)}
                  data-testid="must-do-toggle"
                  className="hidden"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">High Intensity Focus</p>
                  <p className="text-[10px] text-text-secondary uppercase tracking-tight">Mark as primary must-do task</p>
                </div>
              </label>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-border-subtle text-text-secondary font-semibold hover:bg-bg-elevated transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                disabled={!newTaskTitle.trim()}
                data-testid="save-task-button"
                className="flex-1 px-4 py-3 rounded-xl bg-accent-task text-bg-app font-bold shadow-lg shadow-accent-task/20 hover:scale-[1.02] active:scale-98 disabled:opacity-50 transition-all"
              >
                Initialize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
