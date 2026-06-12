import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const KID_LINKS = [
  { to: '/dashboard', label: 'Tareas', icon: '✅' },
  { to: '/stars', label: 'Mis Estrellas', icon: '⭐' },
  { to: '/rewards', label: 'Recompensas', icon: '🎁' },
]

const ADMIN_LINKS = [
  { to: '/admin', label: 'Aprobar', icon: '🛡️' },
  { to: '/admin/tasks', label: 'Catálogo', icon: '📋' },
  { to: '/admin/rewards', label: 'Premios', icon: '🎁' },
  { to: '/admin/adjust', label: 'Ajustar', icon: '⚡' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const links = user?.role === 'admin' ? ADMIN_LINKS : KID_LINKS

  return (
    <header className="sticky top-0 z-50 bg-space-900/80 backdrop-blur-md border-b border-purple-600/20">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'}
          className="flex items-center gap-2 font-display font-black text-xl text-white select-none">
          <span className="text-2xl animate-float">⭐</span>
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            StarLance
          </span>
        </Link>

        {/* Nav links — hidden on very small screens, shown as bottom bar */}
        <nav className="hidden sm:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                ${pathname === l.to
                  ? 'bg-purple-600/30 text-purple-300 shadow-glow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-space-700'}`}
            >
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-space-700 px-3 py-1.5 rounded-xl border border-purple-600/20">
            <span className="text-lg">{user?.avatar}</span>
            <span className="text-sm font-semibold text-slate-200 hidden xs:block">
              {user?.display_name}
            </span>
          </div>
          <button onClick={logout} className="btn-ghost text-sm px-3 py-2">
            Salir
          </button>
        </div>
      </div>

      {/* Bottom mobile nav */}
      <nav className="sm:hidden flex border-t border-purple-600/10 bg-space-900/95">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-semibold transition-all
              ${pathname === l.to ? 'text-purple-400' : 'text-slate-500'}`}
          >
            <span className="text-lg">{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  )
}
