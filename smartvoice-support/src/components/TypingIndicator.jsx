import React from 'react'

const TypingIndicator = () => {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="h-2 w-2 rounded-full bg-slate-400 typing-dot" />
      <span className="h-2 w-2 rounded-full bg-slate-400 typing-dot" />
      <span className="h-2 w-2 rounded-full bg-slate-400 typing-dot" />
      <span className="ml-2 text-xs text-slate-500">AI is drafting a reply...</span>
    </div>
  )
}

export default TypingIndicator
