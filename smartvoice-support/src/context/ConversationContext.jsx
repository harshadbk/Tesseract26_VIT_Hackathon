import React, { createContext, useContext, useState, useCallback } from 'react'

const ConversationCtx = createContext()

export const useConversation = () => {
  const context = useContext(ConversationCtx)
  if (!context) {
    throw new Error('useConversation must be used within ConversationContext')
  }
  return context
}

export default function ConversationContext({ children }) {
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [escalations, setEscalations] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Add a new message to current conversation
  const addMessage = useCallback((message, sender = 'user') => {
    setCurrentConversation(prev => {
      if (!prev) return null
      return {
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now(),
            text: message,
            sender,
            timestamp: new Date(),
            emotion: sender === 'bot' ? 'neutral' : detectEmotion(message)
          }
        ]
      }
    })
  }, [])

  // Detect emotion from text (basic keyword-based)
  const detectEmotion = (text) => {
    const lowerText = text.toLowerCase()
    
    if (/angry|furious|rage|hate|extremely frustrated|very upset/.test(lowerText)) {
      return 'angry'
    }
    if (/frustrated|annoyed|upset|disappointed|unhappy/.test(lowerText)) {
      return 'frustrated'
    }
    if (/happy|great|awesome|excellent|satisfied|thanks|thank you/.test(lowerText)) {
      return 'happy'
    }
    if (/confused|confused|unsure|don't understand/.test(lowerText)) {
      return 'confused'
    }
    
    return 'calm'
  }

  // Create a new conversation
  const startConversation = useCallback((userId, userName) => {
    const newConversation = {
      id: Date.now(),
      userId,
      userName,
      messages: [],
      emotion: 'calm',
      isEscalated: false,
      summary: '',
      createdAt: new Date(),
      orderId: null
    }
    setCurrentConversation(newConversation)
    setConversations(prev => [...prev, newConversation])
    return newConversation
  }, [])

  // Set emotion for current conversation
  const setEmotion = useCallback((emotion) => {
    setCurrentConversation(prev => ({
      ...prev,
      emotion
    }))
  }, [])

  // Update conversation summary
  const updateSummary = useCallback((summary) => {
    setCurrentConversation(prev => ({
      ...prev,
      summary
    }))
  }, [])

  // Escalate conversation
  const escalateConversation = useCallback((summary) => {
    if (!currentConversation) return
    
    const escalation = {
      id: Date.now(),
      conversationId: currentConversation.id,
      userId: currentConversation.userId,
      userName: currentConversation.userName,
      emotion: currentConversation.emotion,
      summary,
      messages: currentConversation.messages,
      status: 'pending',
      assignedAgent: null,
      createdAt: new Date()
    }
    
    setEscalations(prev => [...prev, escalation])
    setCurrentConversation(prev => ({
      ...prev,
      isEscalated: true
    }))
    return escalation
  }, [currentConversation])

  // Assign escalation to agent
  const assignEscalation = useCallback((escalationId, agentName) => {
    setEscalations(prev =>
      prev.map(esc =>
        esc.id === escalationId
          ? { ...esc, assignedAgent: agentName, status: 'assigned' }
          : esc
      )
    )
  }, [])

  // Resolve escalation
  const resolveEscalation = useCallback((escalationId, resolution) => {
    setEscalations(prev =>
      prev.map(esc =>
        esc.id === escalationId
          ? { ...esc, status: 'resolved', resolution }
          : esc
      )
    )
  }, [])

  const value = {
    conversations,
    currentConversation,
    escalations,
    isLoading,
    setIsLoading,
    addMessage,
    startConversation,
    setEmotion,
    updateSummary,
    escalateConversation,
    assignEscalation,
    resolveEscalation,
    detectEmotion
  }

  return (
    <ConversationCtx.Provider value={value}>
      {children}
    </ConversationCtx.Provider>
  )
}
