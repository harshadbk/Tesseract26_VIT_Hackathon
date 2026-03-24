# Quick Start Guide

## Installation

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Usage

### Chat Interface (Main Page)
1. **Select a User**: Click the menu icon to switch between demo users
2. **Send Text**: Type a message and press Send or hit Enter
3. **Voice Input**: Click the microphone button to record voice
   - Microphone must be allowed in browser
   - Recording indicator shows when active
   - Red pulsing circle indicates active recording

### Try These Interactions

1. **Order Status Check**
   - User: "Where is my order?"
   - Bot will ask for order ID

2. **Frustrated Customer**
   - User: "I'm very angry, my order is late!"
   - Emotion detection: ANGRY
   - System will auto-escalate to agent dashboard

3. **Refund Request**
   - User: "I want a refund"
   - Bot will provide options

4. **General Inquiry**
   - User: "When will my package arrive?"
   - Bot will assist

### Emotion Detection

The system detects customer emotions:
- 😠 Angry
- 😤 Frustrated
- 😊 Happy
- 😌 Calm
- 😕 Confused
- 😐 Neutral

Customers with "angry" or "frustrated" emotions trigger auto-escalation.

### Agent Dashboard

Click any escalated case in the chat to view the dashboard.

**Dashboard Features:**
1. **Statistics** (top bar):
   - Total Cases
   - Pending
   - Assigned
   - Resolved
   - Angry Customers
   - Frustrated Customers

2. **Filters**:
   - Filter by Status (Pending, Assigned, Resolved)
   - Filter by Emotion (Angry, Frustrated, Calm, Confused)

3. **Escalation Cards**:
   - **Pending Status**:
     - Shows "Assign to agent..." dropdown
     - Select agent name
     - Click "Assign to Selected Agent"
   
   - **Assigned Status**:
     - Shows assigned agent name
     - Textarea for resolution notes
     - Click "Mark as Resolved"
   
   - **Resolved Status**:
     - Shows resolution details
     - Case closed

## Demo Users

Three demo users are pre-configured:
- **John Doe** (USR001)
- **Sarah Smith** (USR002)
- **Mike Johnson** (USR003)

Switch users anytime using the menu button.

## Backend Integration

To connect to a real backend:

1. **Start Backend Server**:
   - Backend should run on `http://localhost:5000`
   - Or set `REACT_APP_API_URL` environment variable

2. **Backend API Endpoints Required**:
   ```
   POST   /api/detect-intent
   POST   /api/bot-response
   GET    /api/order/:orderId
   POST   /api/generate-summary
   POST   /api/conversations
   POST   /api/escalations
   GET    /api/escalations
   POST   /api/transcribe
   ```

3. **Create `.env` File**:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

## Browser Requirements

- **Microphone**: Grant permission for voice input
- **Modern Browser**: Chrome, Firefox, Safari, Edge
- **JavaScript**: Must be enabled

## Troubleshooting

### Microphone Not Working
1. Check browser permissions
2. Allow microphone access in browser settings
3. Test microphone in system settings

### Messages Not Sending
1. Check if backend API is running
2. Verify API_BASE_URL in `src/services/api.js`
3. Check browser console for errors

### Escalation Not Working
1. Ensure emotion keywords match (angry, frustrated, etc.)
2. Check conversation context is loaded
3. Verify bot response received

## KeyboardShortcuts

- **Enter**: Send text message
- **Ctrl+1**: Switch to User 1
- **Ctrl+2**: Switch to User 2
- **Ctrl+3**: Switch to User 3

## Screen Layout

```
┌─────────────────────────────────────────┐
│  SmartVoice Support | Menu Button      │
├─────────────────────────────────────────┤
│                                         │
│  Chat Messages Area                    │
│  - User messages (right)               │
│  - Bot messages (left)                 │
│  - Typing indicator                    │
│                                         │
├─────────────────────────────────────────┤
│ Detected Emotion: [emoji] [label]     │
├─────────────────────────────────────────┤
│ [Text Input] [Mic] [Send]              │
├─────────────────────────────────────────┤
│ Status Footer (Escalated / Ready)      │
└─────────────────────────────────────────┘
```

## Tips

1. **Test Escalation**: Type "I'm very angry" to trigger auto-escalation
2. **View Dashboard**: Click menu to navigate (will be added to UI)
3. **Multiple Conversations**: Switch users to start new conversations
4. **Monitor Emotions**: Watch emotion indicator change as you type
5. **Voice Premium**: Use voice input for hands-free interaction

## Performance

- Vite provides instant HMR (Hot Module Reload)
- Optimized for fast development
- Production build uses code splitting
- Tailwind CSS is optimized automatically

## Production Build

```bash
npm run build
```

This creates an optimized `dist/` folder ready for deployment.

---

**Questions? Check README.md for full documentation**
