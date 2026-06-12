import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

const KIDS = [
  { id: 'user_gabriel', name: 'Gabriel', avatar: '⚡' },
  { id: 'user_daniela', name: 'Daniela', avatar: '🌟' },
]

function fmt(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = (dateStr.slice ? dateStr : String(dateStr)).slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [pendingTasks, setPendingTasks] = useState([])
  const [balances, setBalances] = useState({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})

  const loadData = useCallback(async () => {
    try {
      const [g, d, bg, bd] = await Promise.all([
        api.get('/tasks/?user_id=user_gabriel'),
        api.get('/tasks/?user_id=user_daniela'),
        api.get('/balance/user_gabriel'),
        api.get('/balance/user_daniela'),
      ])
      const all = [...g.data, ...d.data]
      setPendingTasks(
        all
          .filter((t) => t.status === 'completed')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      )
      setBalances({ user_gabriel: bg.data.balance, user_daniela: bd.data.balance })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const approve = async (taskId) => {
    setActionLoading((p) => ({ ...p, [taskId]: 'approve' }))
    try {
      await api.patch(`/tasks/${taskId}/approve`, { approver_id: user.id })
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading((p) => ({ ...p, [taskId]: null }))
    }
  }

  const reject = async (taskId) => {
    setActionLoading((p) => ({ ...p, [taskId]: 'reject' }))
    try {
      await api.patch(`/tasks/${taskId}/reject`)
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading((p) => ({ ...p, [taskId]: null }))
    }
  }

  const kidInfo = (userId) => KIDS.find((k) => k.id === userId) || { name: userId, avatar: '👤' }

  return (
    <div className="min-h-screen bg-space-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <h1 className="font-display font-black text-2xl text-white">🛡️ Panel de Control</h1>

        {/* Kid balances */}
        <div className="grid grid-cols-2 gap-4">
          {KIDS.map((k) => (
            <div key={k.id} className="card text-center">
              <div className="text-3xl mb-1">{k.avatar}</div>
              <div className="font-display font-bold text-slate-200">{k.name}</div>
              <div className="badge-stars mt-2 text-base">⭐ {balances[k.id] ?? '...'}</div>
            </div>
          ))}
        </div>

        {/* Pending approvals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg text-slate-200">
              ⏳ Pendientes de aprobación
            </h2>
            {pendingTasks.length > 0 && (
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-1 rounded-full border border-amber-500/30">
                {pendingTasks.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-10 text-4xl animate-float">⭐</div>
          ) : pendingTasks.length === 0 ? (
            <div className="card text-center text-slate-400 py-10">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold">¡Todo al día!</p>
              <p className="text-sm mt-1">No hay tareas pendientes de aprobar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((t) => {
                const kid = kidInfo(t.assigned_to_id)
                const isLoading = actionLoading[t.id]
                return (
                  <div key={t.id}
                    className="card border-amber-500/20 bg-gradient-to-r from-space-800 to-amber-500/5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{t.icon || '⭐'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold text-slate-100">{t.title}</span>
                          <div className="badge-stars text-xs">⭐ {t.points}</div>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-slate-400 text-sm">
                            {kid.avatar} {kid.name}
                          </span>
                          <span className="text-slate-600 text-xs">·</span>
                          <span className="text-slate-500 text-xs">
                            📅 {fmt(t.task_date || t.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => reject(t.id)}
                        disabled={!!isLoading}
                        className="btn-danger flex-1 py-2 text-sm disabled:opacity-50"
                      >
                        {isLoading === 'reject' ? '⏳' : '❌ Rechazar'}
                      </button>
                      <button
                        onClick={() => approve(t.id)}
                        disabled={!!isLoading}
                        className="btn-success flex-1 py-2 text-sm disabled:opacity-50"
                      >
                        {isLoading === 'approve' ? '⏳' : '✅ Aprobar'}
                      </button>
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
