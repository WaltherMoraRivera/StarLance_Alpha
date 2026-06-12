import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

function fmt(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

const STATUS_INFO = {
  approved: { label: '✅ Aprobada', cls: 'badge-approved' },
  rejected: { label: '❌ Rechazada', cls: 'badge-rejected' },
  completed: { label: '⏳ Pendiente', cls: 'badge-pending' },
  pending: { label: '⏳ Pendiente', cls: 'badge-pending' },
}

export default function KidStars() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [taskRes, balRes] = await Promise.all([
        api.get(`/tasks/?user_id=${user.id}`),
        api.get(`/balance/${user.id}`),
      ])
      setTasks(taskRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
      setBalance(balRes.data.balance)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  const approvedCount = tasks.filter((t) => t.status === 'approved').length
  const pendingCount = tasks.filter((t) => t.status === 'completed' || t.status === 'pending').length

  return (
    <div className="min-h-screen bg-space-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <h1 className="font-display font-black text-2xl text-white">
          ⭐ Mis Estrellas
        </h1>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <div className="text-3xl font-display font-black text-gold-400 animate-pulse-slow">
              {balance}
            </div>
            <div className="text-slate-400 text-xs mt-1">Total ⭐</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-display font-black text-emerald-400">{approvedCount}</div>
            <div className="text-slate-400 text-xs mt-1">Aprobadas</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-display font-black text-amber-400">{pendingCount}</div>
            <div className="text-slate-400 text-xs mt-1">Pendientes</div>
          </div>
        </div>

        {/* Big star counter */}
        <div className="card text-center py-8 border-gold-500/30 bg-gradient-to-b from-gold-500/10 to-transparent">
          <div className="text-6xl font-display font-black text-gold-400 mb-1">{balance}</div>
          <div className="text-slate-300 font-semibold">estrellas acumuladas ⭐</div>
        </div>

        {/* History */}
        <div>
          <h2 className="font-display font-bold text-lg text-slate-200 mb-3">
            📋 Historial completo
          </h2>

          {loading ? (
            <div className="text-center py-10 text-4xl animate-float">⭐</div>
          ) : tasks.length === 0 ? (
            <div className="card text-center text-slate-400 py-10">
              <div className="text-4xl mb-3">🌟</div>
              <p>Aún no tienes tareas registradas.</p>
              <p className="text-sm mt-1">¡Ve al dashboard y selecciona las tareas que hiciste!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((t) => {
                const info = STATUS_INFO[t.status] || STATUS_INFO.pending
                return (
                  <div key={t.id} className="card flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">{t.icon || '⭐'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-200 truncate">{t.title}</p>
                      <p className="text-slate-500 text-xs">
                        {t.task_date ? fmt(t.task_date) : fmt(t.created_at?.slice(0, 10))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`badge-stars text-xs ${t.status !== 'approved' ? 'opacity-40' : ''}`}>
                        ⭐ {t.points}
                      </div>
                      <span className={info.cls}>{info.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
