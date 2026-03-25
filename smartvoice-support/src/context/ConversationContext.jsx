import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  chatWithAgent,
  createEscalation,
  updateEscalation
} from '../services/api'
import { speakText } from '../utils/helpers'

const ConversationCtx = createContext()

const DEFAULT_USERS = [
  { id: 'USR001', name: 'John Doe' },
  { id: 'USR002', name: 'Sarah Smith' },
  { id: 'USR003', name: 'Mike Johnson' }
]

const EMPTY_INSIGHTS = {
  intent: 'general_inquiry',
  confidence: 0,
  emotion: 'calm',
  riskLevel: 'low',
  actionsTaken: ['Waiting for user input'],
  shouldEscalate: false
}

const detectEmotion = (text = '') => {
  const lowerText = text.toLowerCase()
  if (/angry|anry|furious|hate|ridiculous|worst/.test(lowerText)) return 'angry'
  if (/frustrated|frustated|frastated|upset|annoyed|disappointed|again|asap|urgent|right now|immediately|hurry|do\s+(it|this)\s+fast|fast please|quickly|faster|\bquick\b/.test(lowerText)) return 'frustrated'
  if (/confused|unclear|not sure|dont understand|don't understand/.test(lowerText)) return 'confused'
  if (/thanks|thank you|great|awesome|perfect/.test(lowerText)) return 'happy'
  return 'calm'
}

const buildRiskLevel = (emotion, messageCount) => {
  if (emotion === 'angry') return 'critical'
  if (emotion === 'frustrated') return 'high'
  if (messageCount >= 5) return 'medium'
  return 'low'
}

const smoothEmotion = (llmEmotion = 'calm', localEmotion = 'calm') => {
  const normalizedLlm = String(llmEmotion || 'calm').toLowerCase()
  const normalizedLocal = String(localEmotion || 'calm').toLowerCase()
  const rank = { calm: 0, confused: 0, happy: 0, neutral: 0, frustrated: 1, angry: 2 }
  const llmRank = rank[normalizedLlm] ?? 0
  const localRank = rank[normalizedLocal] ?? 0
  return localRank >= llmRank ? normalizedLocal : normalizedLlm
}

const makeMessage = (text, sender, emotion = 'calm') => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  text,
  sender,
  emotion,
  timestamp: new Date().toISOString()
})

const createConversationRecord = (userId, userName) => ({
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

export const useConversation = () => {
  const context = useContext(ConversationCtx)
  if (!context) {
    throw new Error('useConversation must be used within ConversationContext')
  }
  return context
}

const withConversationUpdates = (conversations, updatedConversation) => {
  const idx = conversations.findIndex((item) => item.id === updatedConversation.id)
  if (idx === -1) return [updatedConversation, ...conversations]
  const next = [...conversations]
  next[idx] = updatedConversation
  return next
}

export default function ConversationContext({ children }) {
  const [users] = useState(DEFAULT_USERS)
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [escalations, setEscalations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState(EMPTY_INSIGHTS)

  const currentConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === currentConversationId) || null,
    [conversations, currentConversationId]
  )

  const startConversation = useCallback((userId, userName) => {
    setConversations((prev) => {
      const existing = prev.find((item) => item.userId === userId && !item.isArchived)
      if (existing) {
        setCurrentConversationId(existing.id)
        return prev
      }

      const createdConversation = createConversationRecord(userId, userName)

      setCurrentConversationId(createdConversation.id)
      return [createdConversation, ...prev]
    })
  }, [])

  const addMessage = useCallback((message, sender = 'user') => {
    setConversations((prev) => {
      const activeConversation = prev.find((item) => item.id === currentConversationId)
      if (!activeConversation) return prev

      const emotion = sender === 'user' ? detectEmotion(message) : 'calm'
      const nextMessage = makeMessage(message, sender, emotion)
      const updatedConversation = {
        ...activeConversation,
        messages: [...activeConversation.messages, nextMessage],
        emotion: sender === 'user' ? emotion : activeConversation.emotion,
        updatedAt: new Date().toISOString()
      }

      return withConversationUpdates(prev, updatedConversation)
    })
  }, [currentConversationId])

  const escalateConversation = useCallback(async (summaryText, sourceConversation = null) => {
    const conversation = sourceConversation || currentConversation
    if (!conversation || conversation.isEscalated) return null

    const escalationPayload = {
      conversationId: conversation.id,
      userId: conversation.userId,
      userName: conversation.userName,
      emotion: conversation.emotion,
      summary: summaryText,
      messages: conversation.messages,
      status: 'pending',
      assignedAgent: null,
      createdAt: new Date().toISOString()
    }

    const persistedEscalation = await createEscalation(escalationPayload)

    const normalizedEscalation = {
      ...escalationPayload,
      ...persistedEscalation,
      id: persistedEscalation.id || escalationPayload.createdAt
    }

    setEscalations((prev) => [normalizedEscalation, ...prev])
    setConversations((prev) => {
      const target = prev.find((item) => item.id === conversation.id)
      if (!target) return prev
      const updatedConversation = {
        ...target,
        isEscalated: true,
        summary: summaryText,
        updatedAt: new Date().toISOString()
      }
      return withConversationUpdates(prev, updatedConversation)
    })

    return normalizedEscalation
  }, [currentConversation])

  const sendUserMessage = useCallback(async (message) => {
    if (!message?.trim() || !currentConversation) return

    const userEmotion = detectEmotion(message)
    const userMessage = makeMessage(message, 'user', userEmotion)
    const historyWithUser = [...currentConversation.messages, userMessage]

    const updatedBeforeReply = {
      ...currentConversation,
      messages: historyWithUser,
      emotion: userEmotion,
      updatedAt: new Date().toISOString()
    }

    setConversations((prev) => withConversationUpdates(prev, updatedBeforeReply))
    setIsLoading(true)

    try {
      const responseData = await chatWithAgent(message, currentConversation.userId)
      const resolvedEmotion = smoothEmotion(responseData.emotion, userEmotion)
      const shouldEscalate = Boolean(responseData.escalate)

      const botReply = responseData.response || 'I want to help, but I need a little more detail to proceed.'
      const botMessage = makeMessage(botReply, 'bot', 'neutral')
      const completeHistory = [...historyWithUser, botMessage]

      const refreshedConversation = {
        ...updatedBeforeReply,
        messages: completeHistory,
        emotion: resolvedEmotion,
        updatedAt: new Date().toISOString()
      }

      setConversations((prev) => withConversationUpdates(prev, refreshedConversation))

      setAiInsights({
        intent: responseData.intent || 'general_inquiry',
        confidence: Number(responseData.confidence || 0.84),
        emotion: resolvedEmotion,
        riskLevel: buildRiskLevel(resolvedEmotion, completeHistory.length),
        actionsTaken: ['User context passed', 'Groq response generated', shouldEscalate ? 'Escalation triggered' : 'Issue in progress'],
        shouldEscalate
      })

      if (shouldEscalate && !refreshedConversation.isEscalated) {
        const summary = responseData.summary || `User has an unresolved issue after multiple attempts. Emotion: ${userEmotion}.`
        await escalateConversation(summary, refreshedConversation)
      }

      speakText(botReply, resolvedEmotion)
    } catch (error) {
      const botMessage = makeMessage(
        'I am facing a temporary issue right now. Please retry, and I will continue from our context.',
        'bot',
        'calm'
      )
      const fallbackConversation = {
        ...updatedBeforeReply,
        messages: [...historyWithUser, botMessage],
        updatedAt: new Date().toISOString()
      }

      setConversations((prev) => withConversationUpdates(prev, fallbackConversation))
      setAiInsights({
        ...EMPTY_INSIGHTS,
        emotion: userEmotion,
        riskLevel: buildRiskLevel(userEmotion, fallbackConversation.messages.length),
        actionsTaken: ['Fallback response triggered']
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentConversation, escalateConversation])

  const assignEscalation = useCallback(async (escalationId, agentName) => {
    await updateEscalation(escalationId, {
      assignedAgent: agentName,
      status: 'assigned'
    })

    setEscalations((prev) =>
      prev.map((item) =>
        item.id === escalationId
          ? { ...item, assignedAgent: agentName, status: 'assigned', updatedAt: new Date().toISOString() }
          : item
      )
    )
  }, [])

  const resolveEscalation = useCallback(async (escalationId, resolution) => {
    const escalation = escalations.find((item) => item.id === escalationId)
    const resolvedAt = new Date().toISOString()
    const userFacingReply = `Human agent update: ${resolution}`

    await updateEscalation(escalationId, {
      status: 'resolved',
      resolution
    })

    setEscalations((prev) =>
      prev.map((item) =>
        item.id === escalationId
          ? { ...item, status: 'resolved', resolution, updatedAt: resolvedAt }
          : item
      )
    )

    if (!escalation) return

    setConversations((prev) => {
      const targetConversation = prev.find(
        (item) => item.id === escalation.conversationId || item.userId === escalation.userId
      )
      if (!targetConversation) return prev

      const botUpdateMessage = makeMessage(userFacingReply, 'bot', 'calm')
      const updatedConversation = {
        ...targetConversation,
        messages: [...targetConversation.messages, botUpdateMessage],
        emotion: 'calm',
        isEscalated: false,
        summary: resolution,
        updatedAt: resolvedAt
      }

      return withConversationUpdates(prev, updatedConversation)
    })

    if (
      currentConversation &&
      (currentConversation.id === escalation.conversationId || currentConversation.userId === escalation.userId)
    ) {
      setAiInsights((prev) => ({
        ...prev,
        emotion: 'calm',
        actionsTaken: ['Human agent resolved case', 'Resolution shared with user'],
        shouldEscalate: false
      }))
      speakText(userFacingReply, 'calm')
    }
  }, [currentConversation, escalations])

  const setEmotion = useCallback((emotion) => {
    if (!currentConversation) return

    setConversations((prev) => {
      const updatedConversation = {
        ...currentConversation,
        emotion,
        updatedAt: new Date().toISOString()
      }
      return withConversationUpdates(prev, updatedConversation)
    })
  }, [currentConversation])

  const updateSummary = useCallback((summary) => {
    if (!currentConversation) return

    setConversations((prev) => {
      const updatedConversation = {
        ...currentConversation,
        summary,
        updatedAt: new Date().toISOString()
      }
      return withConversationUpdates(prev, updatedConversation)
    })
  }, [currentConversation])

  useEffect(() => {
    startConversation(users[0].id, users[0].name)
  }, [startConversation, users])

  const value = {
    users,
    conversations,
    currentConversation,
    escalations,
    isLoading,
    aiInsights,
    startConversation,
    addMessage,
    sendUserMessage,
    detectEmotion,
    setEmotion,
    updateSummary,
    escalateConversation,
    assignEscalation,
    resolveEscalation
  }

  return <ConversationCtx.Provider value={value}>{children}</ConversationCtx.Provider>
}
