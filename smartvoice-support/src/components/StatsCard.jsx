import React from 'react'

const colorMap = {
  blue: 'border-sky-200 bg-sky-50/90 text-sky-700',
  red: 'border-rose-200 bg-rose-50/90 text-rose-700',
  green: 'border-emerald-200 bg-emerald-50/90 text-emerald-700',
  orange: 'border-amber-200 bg-amber-50/90 text-amber-700',
  slate: 'border-slate-200 bg-slate-50/90 text-slate-700'
}


const StatsCard = ({ label, value, color = 'slate' }) => {
  const accent = colorMap[color] || colorMap.slate

  return (
    <div className="card-lift panel-surface vivid-surface tone-sky rounded-xl p-3 glow-breathe">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-display text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-0.5 font-display text-xl font-extrabold text-slate-900 number-pop">{value}</p>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold status-pulse ${accent}`}>Live</span>
      </div>
    </div>
  )
}

export default StatsCard
