import { useState, useEffect, useCallback } from 'react'
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
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Must-Do Section */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-heading font-semibold text-accent-task flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-task animate-pulse" />
            Must-Do
          </h2>
          <div className="space-y-3">
            {mustDoTasks.map(task => (
              <div 
                key={task._id} 
                data-testid={`task-item-${task.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-bg-surface/50 border border-transparent hover:border-accent-task/30 transition-all group"
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
                  {task.status === 'done' && (
                    <svg className="w-4 h-4 text-bg-app" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className={`flex-1 text-sm sm:text-base ${task.status === 'done' ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                   {task.title}
                 </span>
                 <span className="text-[10px] sm:text-xs px-2 py-1 rounded bg-accent-task/10 text-accent-task uppercase tracking-wider font-bold">
                   {task.priority}
                 </span>
                <button 
                  onClick={() => toggleMustDo(task._id, task.isMustDo)}
                  className="p-1 text-text-secondary hover:text-accent-task sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="p-1 text-text-secondary hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {mustDoTasks.length === 0 && (
              <p className="text-text-secondary text-center py-8 bg-bg-surface/30 rounded-lg italic">
                No high-priority tasks. Add one below or mark an existing task.
              </p>
            )}
          </div>

          <h2 className="text-lg font-heading font-semibold text-text-primary mt-8 mb-4">Other Backlog</h2>
          <div className="space-y-2">
            {otherTasks.map(task => (
              <div 
                key={task._id} 
                className="flex items-center gap-3 p-3 rounded-lg bg-bg-surface/30 hover:bg-bg-surface/50 transition-all group"
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
                    <svg className="w-3 h-3 text-bg-app" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className={`text-sm flex-1 ${task.status === 'done' ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                  {task.title}
                </span>
                <button 
                  onClick={() => toggleMustDo(task._id, task.isMustDo)}
                  className="p-1 text-text-secondary hover:text-accent-task opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.1 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="p-1 text-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {otherTasks.length === 0 && (
              <p className="text-text-secondary text-xs italic py-4">No other tasks in backlog.</p>
            )}
          </div>
        </div>

        {/* Completed Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-semibold text-text-secondary">Completed</h2>
          <div className="card-elevated p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {completedTasks.map(task => (
              <div 
                key={task._id} 
                className="flex items-center gap-3 p-2 rounded hover:bg-bg-surface/50 transition-all group"
              >
                <button 
                  onClick={() => toggleTask(task._id, task.status)}
                  className="w-5 h-5 rounded-full bg-accent-task/20 border border-accent-task/30 flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-accent-task" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <span className="text-sm text-text-secondary line-through flex-1">
                  {task.title}
                </span>
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-red-400 transition-all"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {completedTasks.length === 0 && (
              <p className="text-text-secondary text-xs text-center py-8">No tasks completed yet today.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-elevated p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-heading font-semibold text-text-primary mb-4">
              Add New Task
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Finalize project proposal"
                  data-testid="new-task-title"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-2">Priority Level</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTaskPriority(p)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        newTaskPriority === p
                          ? 'bg-accent-task text-bg-app'
                          : 'bg-bg-surface text-text-secondary hover:bg-bg-elevated'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-bg-surface/50 cursor-pointer hover:bg-bg-surface transition-all">
                <input 
                  type="checkbox" 
                  checked={isMustDo}
                  onChange={(e) => setIsMustDo(e.target.checked)}
                  data-testid="must-do-toggle"
                  className="w-5 h-5 rounded border-text-secondary text-accent-task focus:ring-accent-task bg-transparent"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">Mark as Must-Do</p>
                  <p className="text-xs text-text-secondary">Will highlight this task in your focus list</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 glass-button py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                disabled={!newTaskTitle.trim()}
                data-testid="save-task-button"
                className="flex-1 glass-button-primary py-2 rounded-lg disabled:opacity-50"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
