import React from 'react'

const colorMap = {
  blue: 'from-sky-500 to-cyan-500',
  red: 'from-rose-500 to-red-500',
  green: 'from-emerald-500 to-teal-500',
  orange: 'from-amber-500 to-orange-500',
  slate: 'from-slate-600 to-slate-500'
}

const StatsCard = ({ icon: Icon, label, value, color = 'slate' }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl bg-gradient-to-br p-3 text-white ${colorMap[color] || colorMap.slate}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

export default StatsCard
