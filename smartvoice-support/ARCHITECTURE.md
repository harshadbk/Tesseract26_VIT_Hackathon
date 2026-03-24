# System Architecture

## Overview

SmartVoice Support Agent is a full-stack **voice-enabled customer support system** designed for e-commerce platforms. This frontend is built with React + Vite and communicates with a backend API.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   USER BROWSER                       │
│  ┌──────────────────────────────────────────────┐   │
│  │         React Frontend (Vite)                │   │
│  ├──────────────────────────────────────────────┤   │
│  │  Pages:                                      │   │
│  │  - ChatPage (Customer Interface)             │   │
│  │  - AgentDashboard (Agent Portal)             │   │
│  ├──────────────────────────────────────────────┤   │
│  │  Components:                                 │   │
│  │  - ChatInput (Voice + Text)                  │   │
│  │  - ChatMessage (Display)                     │   │
│  │  - EscalationCard (Case Management)          │   │
│  │  - StatsCard, ConversationPreview            │   │
│  ├──────────────────────────────────────────────┤   │
│  │  State Management:                           │   │
│  │  - ConversationContext (React Context API)   │   │
│  └──────────────────────────────────────────────┘   │
│                      ▼                              │
│  Browser APIs Used:                                 │
│  - MediaRecorder (Voice Input)                      │
│  - SpeechSynthesis (Text-to-Speech)                 │
│  - localStorage (Data Persistence)                  │
└──────────────────────────────────────────────────────┘
                      ▼
        ┌──────────────────────────────┐
        │     HTTP / REST API          │
        │  (Axios HTTP Client)         │
        └──────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────────────┐
│              BACKEND API (Python/Node.js)            │
│  ┌──────────────────────────────────────────────┐   │
│  │  Endpoints:                                  │   │
│  │  - detect-intent (Identify user issue)       │   │
│  │  - bot-response (Generate AI response)       │   │
│  │  - generate-summary (Create case summary)    │   │
│  │  - escalations (Manage escalations)          │   │
│  │  - transcribe (Speech-to-Text conversion)    │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  AI Services:                                │   │
│  │  - OpenAI GPT (Intent, Response, Summary)    │   │
│  │  - Whisper API (Audio Transcription)         │   │
│  │  - Emotion Detection (Keyword + AI)          │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Database Integration:                       │   │
│  │  - Supabase / PostgreSQL                     │   │
│  │  - Save conversations                        │   │
│  │  - Track escalations                         │   │
│  │  - Store order data                          │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Customer Interaction Flow

```
User Input (Text/Voice)
    ▼
ChatPage Component
    ▼
Emotion Detection (Keyword-based)
    ▼
Update UI with detected emotion
    ▼
Send message to Backend API
    ▼
Backend processes with AI (GPT)
    ▼
Check escalation criteria:
  - User emotion (angry/frustrated)
  - Issue complexity
  - Message count
    ▼
If escalate:
  - Generate summary (GPT)
  - Save to escalations table
  - Trigger escalation flow
    ▼
Display bot response
    ▼
Update conversation context
```

### 2. Escalation Flow

```
Escalation Triggered
    ▼
Generate AI Summary:
  - User issue
  - Attempted solutions
  - Customer emotion
  - Recommendation
    ▼
Create Escalation Record:
  - Save to database
  - Mark conversation as escalated
  - Update UI
    ▼
Agent Dashboard Updated
    ▼
Human Agent Views Case:
  - Full conversation history
  - AI summary
  - Customer emotion
  - Recommended actions
    ▼
Agent Takes Action:
  - Assign to self or colleague
  - Add resolution notes
  - Mark as resolved
```

## Component Hierarchy

```
App (Router)
├── ChatPage
│   ├── Header
│   │   └── User Menu
│   ├── Messages Container
│   │   ├── ChatMessage (Multiple)
│   │   └── TypingIndicator
│   └── ChatInput
│       ├── Emotion Display
│       ├── Text Input
│       ├── Voice Input Button
│       └── Send Button
│
└── AgentDashboard
    ├── Header (Stats Summary)
    ├── Filters
    │   ├── Status Filter
    │   └── Emotion Filter
    └── Escalations Container
        └── EscalationCard (Multiple)
            ├── User Info
            ├── Summary
            ├── Message Count
            ├── Emotion Badge
            └── Action Buttons
```

## State Management Architecture

### ConversationContext Structure

```javascript
{
  // Current conversation being handled
  currentConversation: {
    id: number,
    userId: string,
    userName: string,
    messages: [
      {
        id: number,
        text: string,
        sender: 'user' | 'bot',
        timestamp: Date,
        emotion: string
      }
    ],
    emotion: string,           // Current detected emotion
    isEscalated: boolean,
    summary: string,
    createdAt: Date,
    orderId: string
  },
  
  // All conversations history
  conversations: Array<Conversation>,
  
  // Escalated cases
  escalations: [
    {
      id: number,
      conversationId: number,
      userId: string,
      userName: string,
      emotion: string,
      summary: string,
      messages: Array,
      status: 'pending' | 'assigned' | 'resolved',
      assignedAgent: string | null,
      createdAt: Date,
      resolution: string
    }
  ],
  
  isLoading: boolean
}
```

## API Integration

### Request/Response Flow

```
Frontend (React)
    │
    ├─► axios.post('/api/detect-intent', { message })
    │   └─ Returns: { intent, confidence, category }
    │
    ├─► axios.post('/api/bot-response', 
    │       { message, conversationHistory, emotion })
    │   └─ Returns: { response, shouldEscalate, intent }
    │
    ├─► axios.post('/api/generate-summary', 
    │       { conversation })
    │   └─ Returns: { summary, keyPoints, recommendation }
    │
    ├─► axios.post('/api/escalations', escalationData)
    │   └─ Returns: { id, status, createdAt }
    │
    └─► axios.post('/api/transcribe', audioBlob)
        └─ Returns: { text, confidence }
```

## Emotion Detection Pipeline

```
User Text Input
    ▼
Keyword Matching (Frontend):
  - Angry: "angry|furious|rage|hate"
  - Frustrated: "frustrated|annoyed|upset"
  - Happy: "happy|great|awesome|satisfied"
  - Confused: "confused|unsure|don't understand"
  - Calm: (else)
    ▼
Update UI Emotion Badge
    ▼
Check Escalation Trigger:
  - If emotion === 'angry' || 'frustrated'
    → Escalate
    ▼
Optional AI Enhancement (Backend):
  - Send to NLP model
  - Sentiment analysis
  - Confidence score
```

## Key Technologies & Libraries

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 18.2.0 | Component-based UI |
| **Build Tool** | Vite 5.0.0 | Fast dev server, optimized builds |
| **Routing** | React Router 6.20.0 | Client-side routing |
| **Styling** | Tailwind CSS 3.3.0 | Utility-first CSS |
| **HTTP Client** | Axios 1.6.0 | API communication |
| **Icons** | Lucide React 0.263.0 | SVG icons |
| **Voice Input** | Web Audio API | Microphone recording |
| **Text-to-Speech** | Web Speech API | Bot audio responses |

## Performance Optimizations

1. **Code Splitting**: Vite automatically chunks code
2. **Lazy Loading**: Routes loaded on-demand
3. **Component Memoization**: Prevent unnecessary re-renders
4. **CSS Optimization**: Tailwind purges unused styles
5. **Asset Compression**: Images/fonts optimized

## Security Considerations

1. **CORS**: Backend should handle CORS properly
2. **Data Validation**: Frontend validates input before sending
3. **API Keys**: Keep OpenAI keys on backend only
4. **Session Management**: Use tokens for API authentication
5. **XSS Protection**: React escapes content by default

## Scalability

- **State**: Use Redux or Zustand for larger apps
- **Backend**: Implement caching, rate limiting
- **Database**: Index emotion, status fields
- **Real-time**: Add WebSocket for live updates
- **Analytics**: Track metrics and user behavior

## Future Enhancements

1. **Real-time Communication**: WebSocket for instant updates
2. **Advanced Analytics**: Conversation metrics & reporting
3. **Multi-language**: i18n support for global expansion
4. **AI Model**: Custom-trained emotion detection
5. **Video Support**: Add video chat for agents
6. **Mobile App**: React Native version
7. **Voice Bot**: TTS with natural language

---

**Architecture designed for scalability, maintainability, and user experience.**
