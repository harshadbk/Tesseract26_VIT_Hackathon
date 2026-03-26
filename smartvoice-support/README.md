# SmartVoice Support Agent - Frontend

A voice-enabled AI customer support system built with React and Vite.js.

## Project Structure

```
smartvoice-support/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable React components
│   │   ├── ChatInput.jsx      # Voice & text input component
│   │   ├── ChatMessage.jsx    # Message display component
│   │   ├── TypingIndicator.jsx # Typing indicator animation
│   │   ├── EscalationCard.jsx # Escalation management card
│   │   ├── StatsCard.jsx      # Dashboard stats card
│   │   └── ConversationPreview.jsx # Conversation preview
│   ├── context/
│   │   └── ConversationContext.jsx # Global state management
│   ├── pages/
│   │   ├── ChatPage.jsx       # Main chat interface
│   │   └── AgentDashboard.jsx # Agent management dashboard
│   ├── services/
│   │   └── api.js            # API integration
│   ├── utils/
│   │   └── helpers.js        # Utility functions
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # React DOM entry point
│   └── index.css             # Global styles
├── index.html                # HTML entry point
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── package.json              # Dependencies
```

## Features

### 1. Customer Chat Interface
- **Voice Input**: Record audio using microphone with real-time transcription
- **Text Input**: Type messages directly
- **Real-time Responses**: AI-powered responses with typing indicator
- **Emotion Detection**: Analyzes customer sentiment (angry, frustrated, calm, etc.)
- **Conversation History**: Full chat history with timestamps

### 2. Emotion Detection
- Real-time emotion analysis based on keywords
- Visual emotion indicators (emoji + label)
- Color-coded emotion display
- Automatic escalation for angry/frustrated customers

### 3. Agent Dashboard
- **Overview Stats**: Total cases, pending, assigned, resolved
- **Escalation Management**: View and manage escalated cases
- **User Management**: Switch between test users
- **Status Filtering**: Filter by case status (pending, assigned, resolved)
- **Emotion Filtering**: Filter by customer emotion
- **Agent Assignment**: Assign cases to human agents
- **Resolution Tracking**: Add resolution notes when resolving cases

### 4. Responsive Design
- Mobile-first approach using Tailwind CSS
- Works on mobile, tablet, and desktop
- Smooth animations and transitions
- Modern gradient design

## Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Install Dependencies
```bash
cd smartvoice-support
npm install
```

### Development Server
```bash
npm run dev
```
The app will start on `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Tech Stack

- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.0
- **Routing**: React Router DOM 6.20.0
- **HTTP Client**: Axios 1.6.0
- **UI Icons**: Lucide React 0.263.0
- **Styling**: Tailwind CSS 3.3.0
- **CSS Tools**: PostCSS + Autoprefixer

## Key Components

### ChatPage
Main chat interface where customers interact with the AI support agent.

**Features:**
- User selection from demo users
- Real-time message display
- Voice recording indicator
- Emotion detection
- Automatic escalation detection

### AgentDashboard
Dashboard for managing escalated support cases.

**Features:**
- Dashboard statistics
- Escalation case cards
- Status and emotion filtering
- Agent assignment
- Resolution management

### ChatInput
Handles both text and voice input.

**Features:**
- Text input field
- Microphone button with recording animation
- Send button
- Emotion indicator
- Recording status display

### EscalationCard
Displays individual escalation cases with management options.

**Features:**
- User information display
- Emotion emoji and status badge
- Issue summary
- Message count
- Status-based actions:
  - Pending: Agent assignment dropdown
  - Assigned: Resolution text area
  - Resolved: Resolution display

## API Integration

The frontend is designed to work with a backend API. Adjust the `API_BASE_URL` in `src/services/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'
```

### Expected API Endpoints

1. **POST /api/detect-intent** - Detect user intent from message
2. **POST /api/bot-response** - Get AI bot response
3. **GET /api/order/:orderId** - Fetch order details
4. **POST /api/generate-summary** - Generate conversation summary
5. **POST /api/conversations** - Save conversation
6. **POST /api/escalations** - Create escalation
7. **GET /api/escalations** - Get all escalations
8. **POST /api/transcribe** - Audio transcription

## State Management

Uses React Context API for global state management:

```javascript
const {
  conversations,
  currentConversation,
  escalations,
  isLoading,
  addMessage,
  startConversation,
  setEmotion,
  escalateConversation,
  detectEmotion
} = useConversation()
```

## Styling

Tailwind CSS is used for all styling. Key color classes:
- `bg-primary`: Main brand color (#6366f1)
- `bg-secondary`: Accent color (#10b981)
- `bg-danger`: Error color (#ef4444)
- `bg-warning`: Warning color (#f59e0b)

## Animations

Custom animations defined in `src/index.css`:
- `voice-pulse`: Voice button animation
- `message-fade-in`: Message appearance
- `typing`: Typing indicator dots

## Demo Users

Three demo users are available for testing:
- John Doe (USR001)
- Sarah Smith (USR002)
- Mike Johnson (USR003)

## Environment Variables

Create a `.env` file (optional):
```
REACT_APP_API_URL=http://localhost:5000
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- Emotion detection is keyword-based (can be enhanced with AI)
- Auto-escalation triggers for "angry" or "frustrated" emotions
- Mock responses are used when backend is unavailable
- Voice input requires browser microphone permissions

## Future Enhancements

- [ ] Real WebSocket for real-time updates
- [ ] Advanced sentiment analysis with ML
- [ ] Audio playback for bot responses
- [ ] Conversation analytics
- [ ] User authentication
- [ ] Dark mode support
- [ ] Conversation export/download
- [ ] Multiple language support

---

**Built with ❤️ using React + Vite**
