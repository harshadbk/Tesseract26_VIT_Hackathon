# Component Documentation

## ChatPage Component

**File**: `src/pages/ChatPage.jsx`

Main customer-facing chat interface.

### Props
- None (uses Context API)

### State
- `isInitialized`: Boolean - Conversation initialization flag
- `showMenu`: Boolean - Toggle user menu visibility
- `selectedUser`: Object - Currently selected demo user

### Features
- Initialize conversation with demo user
- Display chat messages
- Handle message input (text & voice)
- Auto-scroll to latest message
- User menu for switching accounts
- Emotion detection display
- Escalation status indicator

### Key Methods
- `handleUserSelect()`: Switch to different demo user
- `handleSendMessage()`: Process and send user message
- Auto-escalation on angry/frustrated emotion

---

## AgentDashboard Component

**File**: `src/pages/AgentDashboard.jsx`

Human agent management interface.

### Props
- None (uses Context API)

### State
- `statusFilter`: String - Filter escalations by status
- `emotionFilter`: String - Filter escalations by emotion

### Features
- Dashboard statistics display
- Escalation case management
- Multi-filter system
- Agent assignment
- Resolution tracking
- Active filter badges

### Key Sections
1. **Stats Grid**: Shows 6 key metrics
2. **Filter Panel**: Status and emotion filters
3. **Cases Grid**: Responsive escalation cards

---

## ChatInput Component

**File**: `src/components/ChatInput.jsx`

Voice and text input handler.

### Props
- `onSendMessage`: Function - Callback when message sent
- `emotion`: String - Current detected emotion
- `isLoading`: Boolean - Show loading state

### Features
- Text input field
- Voice recording button
- Mic permission handling
- Recording indicator
- Audio transcription
- Emotion display
- Real-time feedback

### Audio Flow
```
Click Mic → Start Recording → User speaks → Stop → Transcribe → Send
```

---

## ChatMessage Component

**File**: `src/components/ChatMessage.jsx`

Individual message display.

### Props
- `message`: Object with:
  - `id`: Unique message ID
  - `text`: Message content
  - `sender`: 'user' or 'bot'
  - `timestamp`: Date object
  - `emotion`: String (optional)

### Features
- Differentiate user vs bot messages
- Display timestamp
- Show emotion for bot messages
- Fade-in animation
- Responsive width (max 70%)

---

## EscalationCard Component

**File**: `src/components/EscalationCard.jsx`

Case escalation management card.

### Props
- `escalation`: Escalation object
- `onAssign`: Function - Handle agent assignment
- `onResolve`: Function - Handle case resolution

### State
- `selectedAgent`: String - Selected agent name
- `resolution`: String - Resolution notes

### Status-based Actions
1. **Pending**:
   - Agent selection dropdown
   - Assign button
   
2. **Assigned**:
   - Display assigned agent
   - Resolution textarea
   - Mark resolved button
   
3. **Resolved**:
   - Show resolution notes
   - Read-only display

---

## TypingIndicator Component

**File**: `src/components/TypingIndicator.jsx`

Animated typing indicator.

### Features
- Three animated dots
- Smooth 1.4s animation
- Staggered dot timing
- Lightweight, no props

```
⚫ ⚫ ⚫  (animated)
```

---

## StatsCard Component

**File**: `src/components/StatsCard.jsx`

Dashboard statistics card.

### Props
- `icon`: Lucide React icon component
- `label`: String - Stat label
- `value`: Number/String - Stat value
- `color`: String - Color variant (blue, red, green, purple)

### Features
- Colored background
- Icon display
- Value highlighting
- Consistent styling

---

## ConversationContext

**File**: `src/context/ConversationContext.jsx`

Global state management for conversations.

### Provided Values
```javascript
{
  conversations,           // All conversations
  currentConversation,     // Active conversation
  escalations,             // All escalations
  isLoading,              // Loading state
  addMessage(),           // Add message to conversation
  startConversation(),    // Start new conversation
  setEmotion(),          // Update emotion
  updateSummary(),       // Update conversation summary
  escalateConversation(), // Escalate to human agent
  assignEscalation(),    // Assign escalation
  resolveEscalation(),   // Mark escalation resolved
  detectEmotion()        // Detect emotion from text
}
```

### Hook Usage
```javascript
const { currentConversation, addMessage } = useConversation()
```

---

## Data Models

### Message Object
```javascript
{
  id: number,              // Unique ID (timestamp)
  text: string,            // Message content
  sender: 'user' | 'bot',  // Message source
  timestamp: Date,         // When sent
  emotion: string          // Detected emotion
}
```

### Conversation Object
```javascript
{
  id: number,              // Unique ID
  userId: string,          // User identifier
  userName: string,        // Display name
  messages: Message[],     // All messages
  emotion: string,         // Current emotion
  isEscalated: boolean,    // Escalation status
  summary: string,         // AI-generated summary
  createdAt: Date,         // Creation time
  orderId: string          // Associated order (if any)
}
```

### Escalation Object
```javascript
{
  id: number,              // Unique ID
  conversationId: number,  // Reference to conversation
  userId: string,          // Customer ID
  userName: string,        // Customer name
  emotion: string,         // Detected emotion
  summary: string,         // Issue summary
  messages: Message[],     // Full conversation
  status: string,          // pending/assigned/resolved
  assignedAgent: string,   // Agent name (if assigned)
  createdAt: Date,         // When escalated
  resolution: string       // Resolution notes (if resolved)
}
```

---

## Color & Styling Variables

### Tailwind Config Colors
- `primary`: #6366f1 (Indigo)
- `secondary`: #10b981 (Emerald)
- `danger`: #ef4444 (Red)
- `warning`: #f59e0b (Amber)

### Emotion Colors
- Angry: `text-red-600`
- Frustrated: `text-orange-500`
- Happy: `text-green-500`
- Calm: `text-blue-500`
- Confused: `text-purple-500`

---

## API Service Methods

**File**: `src/services/api.js`

### Available Functions

1. **detectIntent(message)**
   - Detect user intent from message
   - Returns: `{ intent, confidence }`

2. **getBotResponse(message, history, emotion)**
   - Get AI bot response
   - Returns: `{ response, shouldEscalate }`

3. **getOrderDetails(orderId)**
   - Fetch order information
   - Returns: Order object or null

4. **generateSummary(conversation)**
   - Create AI summary
   - Returns: `{ summary }`

5. **saveConversation(conversation)**
   - Persist conversation to DB
   - Returns: Saved conversation

6. **createEscalation(data)**
   - Create escalation record
   - Returns: Escalation object

7. **getEscalations()**
   - Fetch all escalations
   - Returns: Array of escalations

8. **transcribeAudio(audioBlob)**
   - Convert speech to text
   - Returns: `{ text }`

---

## Helper Functions

**File**: `src/utils/helpers.js`

- `speakText()`: Text-to-speech
- `stopSpeech()`: Cancel speech
- `getEmotionEmoji()`: Emoji for emotion
- `getEmotionColor()`: Tailwind color class
- `getEmotionBg()`: Background color
- `formatTime()`: Time formatting
- `formatDate()`: Date formatting
- `startRecording()`: Microphone recording
- `stopRecording()`: Stop recording

---

## Event Flow Diagrams

### Message Sending
```
User Types Message
    ↓
Clicks Send or Presses Enter
    ↓
handleSendMessage() called
    ↓
addMessage(message, 'user')
    ↓
Detect emotion from text
    ↓
Call getBotResponse() API
    ↓
Show TypingIndicator
    ↓
Receive bot response
    ↓
addMessage(botResponse, 'bot')
    ↓
Check escalation criteria
    ↓
If escalate: escalateConversation()
```

### Voice Input
```
User Clicks Mic Button
    ↓
startRecording() - Get microphone
    ↓
User Speaks
    ↓
User Clicks Send (or auto on silence)
    ↓
stopRecording() - Stop capture
    ↓
transcribeAudio() - Convert speech
    ↓
Received transcribed text
    ↓
handleSendMessage() with text
    ↓
(Same as text message flow)
```

---

**Last Updated**: March 2026
