import { useEffect } from 'react'

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-space-800 border border-purple-600/30 rounded-2xl shadow-glow w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-purple-600/20">
          <h2 className="font-display font-bold text-lg text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none transition-colors">
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
