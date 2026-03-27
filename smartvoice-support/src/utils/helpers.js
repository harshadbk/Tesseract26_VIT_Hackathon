export const EMOTION_META = {
  angry: { label: 'Angry', toneClass: 'text-rose-700', chipClass: 'bg-rose-100 text-rose-700 border-rose-200' },
  frustrated: { label: 'Frustrated', toneClass: 'text-orange-700', chipClass: 'bg-orange-100 text-orange-700 border-orange-200' },
  calm: { label: 'Calm', toneClass: 'text-emerald-700', chipClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  confused: { label: 'Confused', toneClass: 'text-amber-700', chipClass: 'bg-amber-100 text-amber-700 border-amber-200' },
  happy: { label: 'Happy', toneClass: 'text-sky-700', chipClass: 'bg-sky-100 text-sky-700 border-sky-200' },
  neutral: { label: 'Neutral', toneClass: 'text-slate-700', chipClass: 'bg-slate-100 text-slate-700 border-slate-200' }
}

export const RISK_META = {
  critical: { label: 'Critical', chipClass: 'bg-rose-100 text-rose-700 border-rose-200' },
  high: { label: 'High', chipClass: 'bg-orange-100 text-orange-700 border-orange-200' },
  medium: { label: 'Medium', chipClass: 'bg-amber-100 text-amber-700 border-amber-200' },
  low: { label: 'Low', chipClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
}

export const getEmotionMeta = (emotion = 'neutral') => EMOTION_META[emotion] || EMOTION_META.neutral

export const getRiskMeta = (riskLevel = 'low') => RISK_META[riskLevel] || RISK_META.low

export const formatTime = (date) => {
  if (!date) return ''
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ''
  return value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDateTime = (date) => {
  if (!date) return ''
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ''
  return value.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDate = (date) => {
  if (!date) return ''
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ''
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export const supportsSpeechRecognition = () => {
  if (typeof window === 'undefined') return false
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export const createSpeechRecognition = (onResult, onError, onEnd) => {
  if (!supportsSpeechRecognition()) return null
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()
  recognition.lang = 'en-US'
  recognition.interimResults = true
  recognition.continuous = true
  recognition.maxAlternatives = 1

  recognition.onresult = (event) => {
    const text = Array.from(event.results)
      .map((result) => result[0]?.transcript || '')
      .join(' ')
      .trim()
    if (text) onResult(text, event.results[event.results.length - 1]?.isFinal)
  }

  recognition.onerror = (event) => {
    if (onError) onError(event.error)
  }

  recognition.onend = () => {
    if (onEnd) onEnd()
  }

  return recognition
}

export const speakText = (text, emotion = 'calm', onEnd = null) => {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) {
    if (onEnd) onEnd()
    return
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel()
  
  const utterance = new SpeechSynthesisUtterance(text)
  const mood = (emotion || 'calm').toLowerCase()
  
  if (mood === 'angry') {
    utterance.rate = 1.04
    utterance.pitch = 0.88
  } else if (mood === 'frustrated') {
    utterance.rate = 1
    utterance.pitch = 0.93
  } else if (mood === 'happy') {
    utterance.rate = 1.06
    utterance.pitch = 1.12
  } else {
    utterance.rate = 0.96
    utterance.pitch = 1
  }
  
  utterance.volume = 0.9
  
  if (onEnd) {
    utterance.onend = onEnd
    utterance.onerror = onEnd // Also trigger onEnd on error so we don't get stuck in isSpeaking=true
  }
  
  window.speechSynthesis.speak(utterance)
}

export const detectEmotion = (text = '') => {
  const lowerText = text.toLowerCase()
  if (/angry|anry|furious|hate|ridiculous|worst/.test(lowerText)) return 'angry'
  if (/frustrated|frustated|frastated|upset|annoyed|disappointed|again|asap|urgent|right now|immediately|hurry|do\s+(it|this)\s+fast|fast please|quickly|faster|\bquick\b/.test(lowerText)) return 'frustrated'
  if (/confused|unclear|not sure|dont understand|don't understand/.test(lowerText)) return 'confused'
  if (/thanks|thank you|great|awesome|perfect/.test(lowerText)) return 'happy'
  return 'calm'
}

export const buildRiskLevel = (emotion, messageCount) => {
  if (emotion === 'angry') return 'critical'
  if (emotion === 'frustrated') return 'high'
  if (messageCount >= 5) return 'medium'
  return 'low'
}

export const smoothEmotion = (llmEmotion = 'calm', localEmotion = 'calm') => {
  const normalizedLlm = String(llmEmotion || 'calm').toLowerCase()
  const normalizedLocal = String(localEmotion || 'calm').toLowerCase()
  const rank = { calm: 0, confused: 0, happy: 0, neutral: 0, frustrated: 1, angry: 2 }
  const llmRank = rank[normalizedLlm] ?? 0
  const localRank = rank[normalizedLocal] ?? 0
  return localRank >= llmRank ? normalizedLocal : normalizedLlm
}

export const makeMessage = (text, sender, emotion = 'calm') => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  text,
  sender,
  emotion,
  timestamp: new Date().toISOString()
})

export const createConversationRecord = (userId, userName) => ({
  id: `conv-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  userId,
  userName,
  messages: [],
  emotion: 'calm',
  isEscalated: false,
  summary: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

export const withConversationUpdates = (conversations, updatedConversation) => {
  const idx = conversations.findIndex((item) => item.id === updatedConversation.id)
  if (idx === -1) return [updatedConversation, ...conversations]
  const next = [...conversations]
  next[idx] = updatedConversation
  return next
}
