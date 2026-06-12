import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import Modal from '../../components/Modal'
import api from '../../services/api'

export default function KidRewards() {
  const { user, familyId } = useAuth()
  const [rewards, setRewards] = useState([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [redeeming, setRedeeming] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = useCallback(async () => {
    if (!user || !familyId) return
    try {
      const [rewRes, balRes] = await Promise.all([
        api.get(`/rewards/?family_id=${familyId}`),
        api.get(`/balance/${user.id}`),
      ])
      setRewards(rewRes.data)
      setBalance(balRes.data.balance)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user, familyId])

  useEffect(() => { loadData() }, [loadData])

  const handleRedeem = async () => {
    if (!confirm) return
    setRedeeming(true)
    setErrorMsg('')
    try {
      await api.post('/rewards/redeem', {
        user_id: user.id,
        reward_id: confirm.id,
      })
      setSuccessMsg(`¡Canjeaste "${confirm.name}"! 🎉 Se descontaron ${confirm.cost} ⭐`)
      setConfirm(null)
      loadData()
    } catch (e) {
      setErrorMsg(e.response?.data?.detail || 'No tienes suficientes estrellas.')
      setConfirm(null)
    } finally {
      setRedeeming(false)
    }
  }

  return (
    <div className="min-h-screen bg-space-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-black text-2xl text-white">🎁 Recompensas</h1>
          <div className="badge-stars text-base px-4 py-2">⭐ {balance}</div>
        </div>

        {(successMsg || errorMsg) && (
          <div className={`animate-slide-up rounded-xl p-4 text-center font-semibold
            ${successMsg ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400'
                        : 'bg-red-600/20 border border-red-500/40 text-red-400'}`}>
            {successMsg || errorMsg}
            <button onClick={() => { setSuccessMsg(''); setErrorMsg('') }}
              className="ml-3 text-xs underline opacity-70">Cerrar</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-4xl animate-float">⭐</div>
        ) : rewards.length === 0 ? (
          <div className="card text-center text-slate-400 py-12">
            <div className="text-5xl mb-3">🎁</div>
            <p>Aún no hay recompensas disponibles.</p>
            <p className="text-sm mt-1">¡El admin las configurará pronto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {rewards.map((r) => {
              const canAfford = balance >= r.cost
              return (
                <div key={r.id}
                  className={`card flex items-center gap-4 transition-all
                    ${canAfford ? 'border-purple-600/30 hover:border-purple-500/60' : 'opacity-60'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-space-700 flex items-center justify-center text-2xl flex-shrink-0">
                    🎁
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-slate-100">{r.name}</p>
                    {r.description && (
                      <p className="text-slate-400 text-sm mt-0.5 line-clamp-1">{r.description}</p>
                    )}
                    <div className="badge-stars mt-1 text-xs">⭐ {r.cost}</div>
                  </div>
                  <button
                    onClick={() => { setConfirm(r); setSuccessMsg(''); setErrorMsg('') }}
                    disabled={!canAfford}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all
                      ${canAfford
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-glow active:scale-95'
                        : 'bg-space-700 text-slate-500 cursor-not-allowed'}`}
                  >
                    {canAfford ? 'Canjear' : 'Sin ⭐'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {confirm && (
        <Modal title="¿Canjear recompensa?" onClose={() => setConfirm(null)}>
          <div className="text-center space-y-4">
            <div className="text-5xl">🎁</div>
            <p className="text-slate-200 font-semibold text-lg">{confirm.name}</p>
            <p className="text-slate-400">
              Se descontarán <span className="text-gold-400 font-bold">⭐ {confirm.cost}</span> de tu saldo.
            </p>
            <p className="text-slate-500 text-sm">
              Saldo después: <span className="text-white font-bold">⭐ {balance - confirm.cost}</span>
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setConfirm(null)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={handleRedeem} disabled={redeeming} className="btn-primary flex-1">
                {redeeming ? '⏳ ...' : '🎉 ¡Canjear!'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
