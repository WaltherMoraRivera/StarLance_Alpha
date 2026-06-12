import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

const TODAY = new Date().toISOString().slice(0, 10)
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

function fmt(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export default function KidDashboard() {
  const { user, familyId } = useAuth()
  const [catalog, setCatalog] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [activeDate, setActiveDate] = useState(TODAY)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [catRes, taskRes, balRes] = await Promise.all([
        api.get('/catalog/?active_only=true'),
        api.get(`/tasks/?user_id=${user.id}`),
        api.get(`/balance/${user.id}`),
      ])
      setCatalog(catRes.data)
      setSubmissions(taskRes.data)
      setBalance(balRes.data.balance)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  // Reset selection when date changes
  useEffect(() => { setSelected(new Set()) }, [activeDate])

  // Tasks already submitted for active date
  const submittedForDate = submissions.filter(
    (t) => t.task_date === activeDate
  )
  const submittedCatalogIds = new Set(submittedForDate.map((t) => t.catalog_id).filter(Boolean))

  const toggle = (id) => {
    if (submittedCatalogIds.has(id)) return
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSubmit = async () => {
    if (selected.size === 0 || !familyId) return
    setSubmitting(true)
    setSuccessMsg('')
    try {
      const tasks = catalog.filter((c) => selected.has(c.id))
      await Promise.all(
        tasks.map((c) =>
          api.post('/tasks/', {
            title: c.name,
            description: c.description,
            points: c.stars,
            assigned_to_id: user.id,
            family_id: familyId,
            task_type: 'daily',
            task_date: activeDate,
            icon: c.icon,
            catalog_id: c.id,
          })
        )
      )
      setSuccessMsg(`¡${tasks.length} tarea${tasks.length > 1 ? 's' : ''} enviada${tasks.length > 1 ? 's' : ''}! Esperando aprobación 🎉`)
      setSelected(new Set())
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const statusBadge = (status) => {
    if (status === 'approved') return <span className="badge-approved">✅ Aprobada</span>
    if (status === 'rejected') return <span className="badge-rejected">❌ Rechazada</span>
    return <span className="badge-pending">⏳ Pendiente</span>
  }

  return (
    <div className="min-h-screen bg-space-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl text-white">
              {user?.avatar} Hola, {user?.display_name}!
            </h1>
            <p className="text-slate-400 text-sm mt-1">Selecciona las tareas que completaste</p>
          </div>
          <div className="text-right">
            <div className="badge-stars text-base px-4 py-2">
              ⭐ {balance}
            </div>
            <p className="text-slate-500 text-xs mt-1">estrellas totales</p>
          </div>
        </div>

        {/* Date tabs */}
        <div className="flex gap-2">
          {[
            { date: TODAY, label: '📅 Hoy' },
            { date: YESTERDAY, label: '⏪ Ayer' },
          ].map(({ date, label }) => (
            <button
              key={date}
              onClick={() => setActiveDate(date)}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all
                ${activeDate === date
                  ? 'bg-purple-600 text-white shadow-glow'
                  : 'bg-space-800 text-slate-400 border border-purple-600/20 hover:border-purple-500/50'}`}
            >
              {label} <span className="text-xs opacity-60">({fmt(date)})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-4xl animate-float">⭐</div>
        ) : (
          <>
            {/* Task grid */}
            <div className="grid grid-cols-2 gap-3">
              {catalog.map((task) => {
                const alreadySubmitted = submittedCatalogIds.has(task.id)
                const isSelected = selected.has(task.id)
                const submittedTask = submittedForDate.find((t) => t.catalog_id === task.id)

                return (
                  <button
                    key={task.id}
                    onClick={() => toggle(task.id)}
                    disabled={alreadySubmitted}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200
                      ${alreadySubmitted
                        ? 'opacity-60 cursor-default border-transparent bg-space-700'
                        : isSelected
                          ? 'border-purple-500 bg-purple-600/20 shadow-glow scale-[1.02]'
                          : 'border-transparent bg-space-800 hover:border-purple-600/50 active:scale-95'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{task.icon}</span>
                      {alreadySubmitted
                        ? statusBadge(submittedTask?.status)
                        : isSelected
                          ? <span className="text-purple-400 text-lg">✓</span>
                          : <span className="text-slate-600 text-lg">○</span>
                      }
                    </div>
                    <p className="font-semibold text-sm text-slate-200 leading-tight">{task.name}</p>
                    <div className="badge-stars mt-2 text-xs">⭐ {task.stars}</div>
                  </button>
                )
              })}
            </div>

            {/* Submit button */}
            {selected.size > 0 && (
              <div className="animate-slide-up">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-success w-full text-base"
                >
                  {submitting
                    ? '⏳ Enviando...'
                    : `🚀 Enviar ${selected.size} tarea${selected.size > 1 ? 's' : ''} (+${
                        catalog.filter((c) => selected.has(c.id)).reduce((a, c) => a + c.stars, 0)
                      } ⭐)`}
                </button>
              </div>
            )}

            {successMsg && (
              <div className="animate-slide-up bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-semibold rounded-xl p-4 text-center">
                {successMsg}
              </div>
            )}

            {/* Already submitted today */}
            {submittedForDate.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-slate-300 mb-3">
                  Enviadas el {fmt(activeDate)}
                </h3>
                <div className="space-y-2">
                  {submittedForDate.map((t) => (
                    <div key={t.id} className="card flex items-center gap-3">
                      <span className="text-xl">{t.icon || '⭐'}</span>
                      <span className="flex-1 font-semibold text-slate-200 text-sm">{t.title}</span>
                      <div className="badge-stars text-xs">⭐ {t.points}</div>
                      {statusBadge(t.status)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
