import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { CommandBar } from './Navigation/CommandBar'
import { useTheme } from '../hooks/useTheme'
import { 
  LayoutDashboard, 
  Target, 
  CheckSquare, 
  Activity, 
  BookOpen, 
  Sparkles,
  History as HistoryIcon,
  LogOut,
  User as UserIcon,
  Crown,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/habits', label: 'Habits', icon: Target },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/wellness', label: 'Wellness', icon: Activity },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/history', label: 'History', icon: HistoryIcon },
  { path: '/assistant', label: 'Assistant', icon: Sparkles },
]

export default function Layout() {
  const { logout, user } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="h-screen w-full bg-bg-app flex flex-col lg:flex-row font-precision overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-bg-lowered border-b border-border-subtle z-50">
        <h1 className="font-editorial text-2xl font-normal text-accent-gold italic">
          Life-OS
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-72 flex-shrink-0 h-full bg-bg-lowered border-r border-border-subtle 
        flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-editorial text-3xl font-normal text-accent-gold tracking-tight italic">
              Life-OS
            </h1>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full border border-border-subtle bg-bg-surface/60 p-2 text-text-secondary transition-all hover:bg-bg-surface hover:text-text-primary"
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
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
                    : 'text-text-secondary hover:text-text-primary hover:bg-border-subtle'
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
          <div className="glass-panel p-3.5 rounded-2xl flex items-center justify-between gap-3 bg-bg-surface/30 border border-border-subtle hover:border-accent-gold/20 transition-all duration-300">
            <Link 
              to="/profile" 
              className="flex items-center gap-3 group flex-1 min-w-0 outline-none"
              data-testid="nav-profile"
            >
              <div className="w-10 h-10 rounded-full bg-bg-surface border border-border-bright flex-shrink-0 flex items-center justify-center shadow-md group-hover:border-accent-gold transition-colors">
                <UserIcon className="w-5 h-5 text-accent-gold" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-gold transition-colors">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username || 'User'}
                </p>
                <div className="flex items-center gap-1">
                  <Crown className="w-3 h-3 text-accent-gold" />
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Sovereign</p>
                </div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-bg-surface/50 border border-border-bright text-text-muted hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/30 transition-all duration-300"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-gold/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 pb-24 min-h-full">
          <Outlet />
        </div>
      </main>

      {/* Universal Command Bar */}
      <CommandBar />
    </div>
  )
}
