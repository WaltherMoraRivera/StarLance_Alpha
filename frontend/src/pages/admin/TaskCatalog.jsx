import { useState, useEffect, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import Modal from '../../components/Modal'
import api from '../../services/api'

const EMPTY_FORM = { name: '', description: '', stars: 2, icon: '⭐', is_active: true }

export default function AdminTaskCatalog() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | task object
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const loadData = useCallback(async () => {
    try {
      const { data } = await api.get('/catalog/')
      setTasks(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setModal('create')
  }

  const openEdit = (task) => {
    setForm({ name: task.name, description: task.description || '', stars: task.stars, icon: task.icon, is_active: task.is_active })
    setModal(task)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        await api.post('/catalog/', form)
      } else {
        await api.patch(`/catalog/${modal.id}`, form)
      }
      setModal(null)
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (taskId) => {
    if (!confirm('¿Eliminar esta tarea del catálogo?')) return
    setDeleting(taskId)
    try {
      await api.delete(`/catalog/${taskId}`)
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
          <h1 className="font-display font-black text-2xl text-white">📋 Catálogo de Tareas</h1>
          <button onClick={openCreate} className="btn-primary py-2 px-4 text-sm">
            + Nueva tarea
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-4xl animate-float">⭐</div>
        ) : (
          <div className="space-y-3">
            {tasks.map((t) => (
              <div key={t.id}
                className={`card flex items-center gap-4 transition-all
                  ${!t.is_active ? 'opacity-50' : ''}`}>
                <span className="text-2xl flex-shrink-0">{t.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{t.name}</span>
                    {!t.is_active && (
                      <span className="text-xs text-slate-500 bg-space-700 px-2 py-0.5 rounded-full">inactiva</span>
                    )}
                  </div>
                  {t.description && (
                    <p className="text-slate-500 text-xs mt-0.5 truncate">{t.description}</p>
                  )}
                  <div className="badge-stars mt-1 text-xs">⭐ {t.stars}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(t)} className="btn-ghost text-sm py-1.5 px-3">
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                    className="btn-danger text-sm py-1.5 px-3 disabled:opacity-50"
                  >
                    {deleting === t.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modal && (
        <Modal
          title={modal === 'create' ? '➕ Nueva tarea' : '✏️ Editar tarea'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex gap-3">
              <div className="w-20">
                <label className="text-xs text-slate-400 block mb-1">Icono</label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="input text-center text-xl"
                  maxLength={2}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 block mb-1">Nombre *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="Ej: Lavar los platos"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Descripción</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Estrellas ⭐</label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.stars}
                onChange={(e) => setForm({ ...form, stars: parseInt(e.target.value) || 1 })}
                className="input"
                required
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                  ${form.is_active ? 'bg-purple-600 border-purple-600' : 'border-slate-500 bg-transparent'}`}
              >
                {form.is_active && <span className="text-white text-xs">✓</span>}
              </div>
              <span className="text-slate-300 text-sm">Tarea activa (visible para los niños)</span>
            </label>

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
