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
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return
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
  if (onEnd) utterance.onend = onEnd
  window.speechSynthesis.speak(utterance)
}
