import { useState, useEffect, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../services/api'

const KIDS = [
  { id: 'user_gabriel', name: 'Gabriel', avatar: '⚡' },
  { id: 'user_daniela', name: 'Daniela', avatar: '🌟' },
]

export default function AdminAdjustStars() {
  const [balances, setBalances] = useState({})
  const [values, setValues] = useState({ user_gabriel: '', user_daniela: '' })
  const [saving, setSaving] = useState({})
  const [msgs, setMsgs] = useState({})
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [g, d] = await Promise.all([
        api.get('/balance/user_gabriel'),
        api.get('/balance/user_daniela'),
      ])
      setBalances({ user_gabriel: g.data.balance, user_daniela: d.data.balance })
      setValues({ user_gabriel: String(g.data.balance), user_daniela: String(d.data.balance) })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = async (kid) => {
    const newVal = parseInt(values[kid.id])
    if (isNaN(newVal) || newVal < 0) return
    setSaving((p) => ({ ...p, [kid.id]: true }))
    setMsgs((p) => ({ ...p, [kid.id]: '' }))
    try {
      await api.post(`/balance/${kid.id}/adjust`, { new_total: newVal })
      setBalances((p) => ({ ...p, [kid.id]: newVal }))
      setMsgs((p) => ({ ...p, [kid.id]: `✅ Actualizado a ⭐ ${newVal}` }))
    } catch (e) {
      setMsgs((p) => ({ ...p, [kid.id]: '❌ Error al actualizar' }))
    } finally {
      setSaving((p) => ({ ...p, [kid.id]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-space-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="font-display font-black text-2xl text-white">⚡ Ajustar Estrellas</h1>
          <p className="text-slate-400 text-sm mt-1">
            Modifica el total de estrellas de cada hermano. El cambio se registra en el historial.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-4xl animate-float">⭐</div>
        ) : (
          <div className="space-y-4">
            {KIDS.map((kid) => (
              <div key={kid.id} className="card space-y-4">
                {/* Kid header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-space-700 flex items-center justify-center text-2xl">
                    {kid.avatar}
                  </div>
                  <div>
                    <p className="font-display font-bold text-slate-100">{kid.name}</p>
                    <div className="badge-stars text-sm">⭐ {balances[kid.id] ?? '...'} actuales</div>
                  </div>
                </div>

                {/* Input */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">
                    Nuevo total de estrellas
                  </label>
                  <div className="flex gap-3">
                    {/* Decrement / increment quick buttons */}
                    <div className="flex rounded-xl overflow-hidden border border-space-600">
                      {[-10, -5, -1].map((d) => (
                        <button
                          key={d}
                          onClick={() => setValues((p) => ({
                            ...p,
                            [kid.id]: String(Math.max(0, parseInt(p[kid.id] || 0) + d))
                          }))}
                          className="w-10 h-full bg-space-700 hover:bg-space-600 text-slate-300 text-xs font-bold transition-colors border-r border-space-600 last:border-0"
                        >
                          {d}
                        </button>
                      ))}
                    </div>

                    <input
                      type="number"
                      min={0}
                      value={values[kid.id]}
                      onChange={(e) => setValues((p) => ({ ...p, [kid.id]: e.target.value }))}
                      className="input text-center text-lg font-bold flex-1"
                    />

                    <div className="flex rounded-xl overflow-hidden border border-space-600">
                      {[1, 5, 10].map((d) => (
                        <button
                          key={d}
                          onClick={() => setValues((p) => ({
                            ...p,
                            [kid.id]: String(parseInt(p[kid.id] || 0) + d)
                          }))}
                          className="w-10 h-full bg-space-700 hover:bg-space-600 text-slate-300 text-xs font-bold transition-colors border-r border-space-600 last:border-0"
                        >
                          +{d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delta preview */}
                  {values[kid.id] !== '' && parseInt(values[kid.id]) !== balances[kid.id] && (
                    <p className="text-slate-400 text-xs mt-1.5">
                      Cambio:{' '}
                      <span className={parseInt(values[kid.id]) > balances[kid.id] ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {parseInt(values[kid.id]) > balances[kid.id] ? '+' : ''}
                        {parseInt(values[kid.id]) - balances[kid.id]} ⭐
                      </span>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSave(kid)}
                  disabled={saving[kid.id] || values[kid.id] === String(balances[kid.id])}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving[kid.id] ? '⏳ Guardando...' : '💾 Guardar cambio'}
                </button>

                {msgs[kid.id] && (
                  <p className={`text-sm font-semibold text-center animate-slide-up
                    ${msgs[kid.id].startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {msgs[kid.id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
