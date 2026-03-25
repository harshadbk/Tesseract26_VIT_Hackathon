import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const ENABLE_BACKEND = import.meta.env.VITE_ENABLE_BACKEND !== 'false'
const BACKEND_RETRY_MS = Number(import.meta.env.VITE_BACKEND_RETRY_MS || 8000)
let backendDownUntil = 0

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

const shouldUseBackend = () => ENABLE_BACKEND && Date.now() >= backendDownUntil

const handleBackendFailure = (error) => {
  const errorCode = error?.code
  const statusCode = error?.response?.status
  const networkFailure = errorCode === 'ERR_NETWORK' || errorCode === 'ECONNREFUSED'
  if (networkFailure || !statusCode) {
    backendDownUntil = Date.now() + BACKEND_RETRY_MS
  }
}

const detectEmotionFallback = (message = '') => {
  const lowerText = message.toLowerCase()
  if (/angry|anry|furious|ridiculous|worst|hate/.test(lowerText)) return 'angry'
  if (/frustrated|frustated|frastated|upset|annoyed|disappointed|again|asap|urgent|right now|immediately|hurry|do\s+(it|this)\s+fast|fast please|quickly|faster|\bquick\b/.test(lowerText)) return 'frustrated'
  if (/confused|not sure|unclear|dont understand|don't understand/.test(lowerText)) return 'confused'
  if (/thanks|thank you|great|awesome|perfect/.test(lowerText)) return 'happy'
  return 'calm'
}

const detectIntentFallback = (message = '') => {
  const lowerText = message.toLowerCase()
  if (/late|delay|where|status|tracking|order/.test(lowerText)) return 'order_not_delivered'
  if (/refund|money|charged|chargeback|return/.test(lowerText)) return 'refund_delay'
  if (/wrong|broken|damaged|defect|product issue/.test(lowerText)) return 'wrong_product'
  return 'payment_issue'
}

export const chatWithAgent = async (message, userId) => {
  const normalizedMessage = String(message || '').toLowerCase()
  const userAskedHandoff = /human|agent|escalat|manager|supervisor/.test(normalizedMessage)
  if (!shouldUseBackend()) {
    const emotion = detectEmotionFallback(message)
    const intent = detectIntentFallback(message)
    const escalate = emotion === 'angry' || (emotion === 'frustrated' && userAskedHandoff)
    return {
      intent,
      emotion,
      response: escalate
        ? 'I understand your frustration. I am escalating this to a human support agent now.'
        : 'Thanks for sharing. I am checking your request and can guide the next steps.',
      escalate,
      summary: `User issue: ${intent.replaceAll('_', ' ')}. Emotion: ${emotion}.`
    }
  }

  try {
    const response = await api.post('/chat', {
      message,
      user_id: userId
    })

    return {
      intent: response.data?.intent || 'payment_issue',
      emotion: response.data?.emotion || 'calm',
      response: response.data?.response || 'I am here to help. Could you please share more details?',
      escalate: Boolean(response.data?.escalate),
      summary: response.data?.summary || 'Case shared with support team.'
    }
  } catch (error) {
    handleBackendFailure(error)
    const emotion = detectEmotionFallback(message)
    const intent = detectIntentFallback(message)
    const escalate = emotion === 'angry' || (emotion === 'frustrated' && userAskedHandoff)
    return {
      intent,
      emotion,
      response: escalate
        ? 'I can see this is urgent. I am escalating this to a human support agent now.'
        : 'I am unable to reach the server right now. Please retry in a moment.',
      escalate,
      summary: `Fallback escalation for ${intent.replaceAll('_', ' ')} with emotion ${emotion}.`
    }
  }
}

export const createEscalation = async (escalationData) => {
  return {
    ...escalationData,
    id: escalationData.id || Date.now(),
    status: escalationData.status || 'pending'
  }
}

export const updateEscalation = async (escalationId, updates) => {
  return {
    id: escalationId,
    ...updates
  }
}
