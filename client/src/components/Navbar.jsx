import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import NotificationBell from './NotificationBell.jsx'
import {
  Ticket,
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const Navbar = () => {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const roleBadgeStyles = {
    admin: 'bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:text-indigo-300 dark:border-indigo-800',
    employee: 'bg-sky-500/10 text-sky-700 border-sky-200 dark:text-sky-300 dark:border-sky-800',
    customer: 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-300 dark:border-emerald-800',
  }

  const navLinks = {
    admin: [
      { to: '/admin', label: 'All Tickets', icon: LayoutDashboard },
      { to: '/admin/users', label: 'User Management', icon: Users },
    ],
    employee: [
      { to: '/employee', label: 'Assigned Tickets', icon: Ticket },
    ],
    customer: [
      { to: '/customer', label: 'My Tickets', icon: Ticket },
    ],
  }

  const links = navLinks[role] || []

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link
              to={role === 'admin' ? '/admin' : role === 'employee' ? '/employee' : '/customer'}
              className="flex items-center gap-2.5 font-bold text-lg text-slate-900 dark:text-white group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:bg-indigo-700 transition">
                <Ticket size={20} />
              </div>
              <span>TicketFlow</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Profile, Notifications & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Real-time Notification Bell */}
            <NotificationBell />

            {user && (
              <div className="flex items-center gap-3 pr-2 border-r border-slate-200 dark:border-slate-800">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                <span
                  className={`capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    roleBadgeStyles[role] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {role}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu and notifications */}
          <div className="flex md:hidden items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-4 space-y-2 bg-white dark:bg-slate-900">
          {user && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <span
                className={`capitalize px-2 py-0.5 rounded-full text-xs font-semibold border ${
                  roleBadgeStyles[role]
                }`}
              >
                {role}
              </span>
            </div>
          )}

          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400'
                }`}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
