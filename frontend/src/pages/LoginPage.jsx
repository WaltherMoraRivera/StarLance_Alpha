import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Starfield from '../components/Starfield'
import api from '../services/api'

const AVATAR_COLORS = {
  admin: 'from-purple-600 to-purple-800',
  gabriel: 'from-cyan-600 to-blue-700',
  daniela: 'from-pink-500 to-rose-700',
}

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState(null)
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    api.get('/auth/users').then(({ data }) => setUsers(data)).catch(() => {})
  }, [])

  const handleSelect = (u) => {
    setSelected(u)
    setPassword('')
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError('')
    try {
      const loggedUser = await login(selected.username, password, remember)
      navigate(loggedUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch {
      setError('Contraseña incorrecta. ¡Inténtalo de nuevo!')
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4 py-10">
      <Starfield />

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3 animate-float inline-block">⭐</div>
          <h1 className="font-display font-black text-4xl bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            StarLance
          </h1>
          <p className="text-slate-400 mt-2 font-body">¿Quién eres hoy?</p>
        </div>

        {!selected ? (
          /* Avatar picker */
          <div className="grid grid-cols-3 gap-4">
            {users.map((u) => (
              <button
                key={u.username}
                onClick={() => handleSelect(u)}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl
                           bg-space-800 border-2 border-transparent
                           hover:border-purple-500 hover:shadow-glow
                           transition-all duration-200 active:scale-95"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${AVATAR_COLORS[u.username] || 'from-purple-600 to-purple-800'}
                                flex items-center justify-center text-3xl
                                group-hover:scale-110 transition-transform duration-200`}>
                  {u.avatar}
                </div>
                <span className="font-display font-bold text-base text-slate-200 group-hover:text-white">
                  {u.display_name}
                </span>
                {u.role === 'admin' && (
                  <span className="text-xs text-purple-400 font-semibold bg-purple-600/20 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          /* Password form */
          <div className="animate-slide-up">
            <div className="card mb-4">
              {/* Selected user header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${AVATAR_COLORS[selected.username] || 'from-purple-600 to-purple-800'}
                                flex items-center justify-center text-2xl flex-shrink-0`}>
                  {selected.avatar}
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Hola,</p>
                  <h2 className="font-display font-bold text-xl text-white">{selected.display_name}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="ml-auto text-slate-500 hover:text-slate-300 text-sm transition-colors">
                  Cambiar
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    autoFocus
                  />
                  {error && (
                    <p className="text-red-400 text-sm mt-2 font-semibold animate-slide-up">
                      ❌ {error}
                    </p>
                  )}
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none group">
                  <div
                    onClick={() => setRemember(!remember)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                      ${remember ? 'bg-purple-600 border-purple-600' : 'border-slate-500 bg-transparent'}`}
                  >
                    {remember && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-slate-400 text-sm group-hover:text-slate-300">Recordarme en este dispositivo</span>
                </label>

                <button
                  type="submit"
                  disabled={loading || !password}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Entrando...' : '🚀 Entrar'}
                </button>
              </form>
            </div>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-8">
          StarLance v1.0 · Familia Mora Rivera
        </p>
      </div>
    </div>
  )
}
