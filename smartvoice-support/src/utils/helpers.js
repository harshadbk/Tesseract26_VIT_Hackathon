// Text-to-Speech utility using Web Speech API
export const speakText = (text, onEnd = null) => {
  // Cancel any ongoing speech
  speechSynthesis.cancel()
  
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1
  utterance.pitch = 1
  utterance.volume = 1
  
  if (onEnd) {
    utterance.onend = onEnd
  }
  
  speechSynthesis.speak(utterance)
}

// Stop speech synthesis
export const stopSpeech = () => {
  speechSynthesis.cancel()
}

// Get emotion emoji
export const getEmotionEmoji = (emotion) => {
  const emotionMap = {
    angry: '😠',
    frustrated: '😤',
    happy: '😊',
    calm: '😌',
    confused: '😕',
    neutral: '😐'
  }
  return emotionMap[emotion] || '😐'
}

// Get emotion color
export const getEmotionColor = (emotion) => {
  const colorMap = {
    angry: 'text-red-600',
    frustrated: 'text-orange-500',
    happy: 'text-green-500',
    calm: 'text-blue-500',
    confused: 'text-purple-500',
    neutral: 'text-gray-500'
  }
  return colorMap[emotion] || 'text-gray-500'
}

// Get emotion background
export const getEmotionBg = (emotion) => {
  const bgMap = {
    angry: 'bg-red-50',
    frustrated: 'bg-orange-50',
    happy: 'bg-green-50',
    calm: 'bg-blue-50',
    confused: 'bg-purple-50',
    neutral: 'bg-gray-50'
  }
  return bgMap[emotion] || 'bg-gray-50'
}

// Format timestamp
export const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format date
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Start recording audio
export const startRecording = async (onDataAvailable) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    
    const chunks = []
    
    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data)
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/wav' })
      onDataAvailable(blob)
      stream.getTracks().forEach(track => track.stop())
    }
    
    mediaRecorder.start()
    return mediaRecorder
  } catch (error) {
    console.error('Error accessing microphone:', error)
    return null
  }
}

// Stop recording
export const stopRecording = (mediaRecorder) => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
}
