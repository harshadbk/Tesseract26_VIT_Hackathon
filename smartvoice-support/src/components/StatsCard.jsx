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
    <div className="card-lift panel-surface vivid-surface tone-sky rounded-2xl p-4 soft-appear">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-slate-900">{value}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${accent}`}>Live</span>
      </div>
    </div>
  )
}

export default StatsCard
