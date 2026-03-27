import React from 'react'

const TypingIndicator = () => {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm soft-appear glow-breathe">
      <span className="h-2.5 w-2.5 rounded-full bg-sky-400 typing-dot" />
      <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 typing-dot" />
      <span className="h-2.5 w-2.5 rounded-full bg-violet-400 typing-dot" />
      <span className="ml-2 text-xs text-slate-500 font-medium">🤖 AI is drafting a reply...</span>
    </div>
  )
}

export default TypingIndicator
