import React, { useEffect } from 'react'

const TypingIndicator = () => {
  return (
    <div className="flex gap-1 p-4">
      <div className="h-2 w-2 rounded-full bg-gray-400 typing-dot"></div>
      <div className="h-2 w-2 rounded-full bg-gray-400 typing-dot"></div>
      <div className="h-2 w-2 rounded-full bg-gray-400 typing-dot"></div>
    </div>
  )
}

export default TypingIndicator
