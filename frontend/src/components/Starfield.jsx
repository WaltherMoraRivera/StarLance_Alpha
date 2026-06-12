import { useMemo } from 'react'

export default function Starfield() {
  const stars = useMemo(() => (
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2.5 + 0.5,
      dur: `${Math.random() * 3 + 1.5}s`,
      delay: `${Math.random() * 3}s`,
      opacity: Math.random() * 0.6 + 0.2,
    }))
  ), [])

  return (
    <div className="starfield">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star-dot"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            '--dur': s.dur,
            '--delay': s.delay,
          }}
        />
      ))}
    </div>
  )
}
