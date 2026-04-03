import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { CommandBar } from './Navigation/CommandBar'
import { 
  LayoutDashboard, 
  Target, 
  CheckSquare, 
  Activity, 
  BookOpen, 
  Sparkles,
  LogOut,
  User as UserIcon,
  Crown
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/habits', label: 'Habits', icon: Target },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/wellness', label: 'Wellness', icon: Activity },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/assistant', label: 'Assistant', icon: Sparkles },
]

export default function Layout() {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg-app flex font-precision">
      {/* Sidebar */}
      <aside className="w-72 bg-bg-lowered border-r border-border-subtle flex flex-col z-40">
        {/* Logo */}
        <div className="p-8">
          <h1 className="font-editorial text-3xl font-normal text-accent-gold tracking-tight italic">
            Life-OS
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1 h-1 rounded-full bg-accent-gold animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold">
              Unified Archive
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-accent-gold/10 text-accent-gold shadow-[inset_0_0_12px_rgba(233,193,118,0.05)]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`
              }
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                item.path === '/assistant' ? 'text-accent-gold' : ''
              }`} />
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-6 border-t border-border-subtle">
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-bg-surface border border-border-bright flex items-center justify-center shadow-lg">
                <UserIcon className="w-5 h-5 text-accent-gold" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-text-primary truncate">{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username || 'User'}</p>
                <div className="flex items-center gap-1">
                  <Crown className="w-3 h-3 text-accent-gold" />
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Sovereign</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-accent-gold transition-all duration-300 flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-semibold">Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-gold/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto p-10 min-h-screen">
          <Outlet />
        </div>
      </main>

      {/* Universal Command Bar */}
      <CommandBar />
    </div>
  )
}
