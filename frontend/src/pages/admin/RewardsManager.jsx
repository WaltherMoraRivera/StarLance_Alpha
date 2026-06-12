import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import Modal from '../../components/Modal'
import api from '../../services/api'

const EMPTY_FORM = { name: '', description: '', cost: 10 }

export default function AdminRewardsManager() {
  const { familyId } = useAuth()
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const loadData = useCallback(async () => {
    if (!familyId) return
    try {
      const { data } = await api.get(`/rewards/?family_id=${familyId}`)
      setRewards(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [familyId])

  useEffect(() => { loadData() }, [loadData])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setModal('create')
  }

  const openEdit = (r) => {
    setForm({ name: r.name, description: r.description || '', cost: r.cost })
    setModal(r)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        await api.post('/rewards/', { ...form, family_id: familyId })
      } else {
        await api.patch(`/rewards/${modal.id}`, form)
      }
      setModal(null)
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta recompensa?')) return
    setDeleting(id)
    try {
      await api.delete(`/rewards/${id}`)
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen bg-space-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-black text-2xl text-white">🎁 Gestionar Premios</h1>
          <button onClick={openCreate} className="btn-primary py-2 px-4 text-sm">
            + Nuevo premio
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-4xl animate-float">⭐</div>
        ) : rewards.length === 0 ? (
          <div className="card text-center text-slate-400 py-12">
            <div className="text-5xl mb-3">🎁</div>
            <p>No hay premios creados.</p>
            <p className="text-sm mt-1">¡Crea el primer premio para motivar a tus hermanos!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map((r) => (
              <div key={r.id} className="card flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-xl flex-shrink-0">
                  🎁
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200">{r.name}</p>
                  {r.description && (
                    <p className="text-slate-500 text-xs mt-0.5 truncate">{r.description}</p>
                  )}
                  <div className="badge-stars mt-1 text-xs">⭐ {r.cost}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(r)} className="btn-ghost text-sm py-1.5 px-3">
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={deleting === r.id}
                    className="btn-danger text-sm py-1.5 px-3 disabled:opacity-50"
                  >
                    {deleting === r.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modal && (
        <Modal
          title={modal === 'create' ? '➕ Nuevo premio' : '✏️ Editar premio'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nombre del premio *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="Ej: Noche de película"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Descripción</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input"
                placeholder="Opcional — detalla qué incluye"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Costo en estrellas ⭐</label>
              <input
                type="number"
                min={1}
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: parseInt(e.target.value) || 1 })}
                className="input"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? '⏳ Guardando...' : '💾 Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
