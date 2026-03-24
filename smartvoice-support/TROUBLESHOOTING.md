# Troubleshooting & FAQ

## Common Issues & Solutions

### 1. Microphone Not Working

**Problem**: Voice input button doesn't work or no audio is recorded

**Solutions**:
1. Check browser permissions:
   - Chrome: Settings → Privacy → Site Settings → Microphone
   - Firefox: Preferences → Privacy → Microphone
   - Safari: Settings → Websites → Microphone

2. Grant permission when prompted:
   - Click "Allow" in permission dialog
   - Refresh page if previously denied

3. Test microphone:
   ```bash
   # Open browser console and test
   navigator.mediaDevices.getUserMedia({ audio: true })
     .then(() => console.log('Microphone working'))
     .catch(err => console.error('Error:', err))
   ```

4. Check device:
   - Ensure microphone is connected
   - Test in system sound settings
   - Try different USB port

### 2. API Connection Errors

**Problem**: "Cannot fetch from API" or 404 errors

**Solutions**:
1. Verify backend is running:
   ```bash
   curl http://localhost:5000/health
   ```

2. Check API URL in `src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000'  // Correct
   ```

3. Ensure CORS is enabled on backend:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:3000'
   }))
   ```

4. Check browser console for actual error URL

5. Try different API URL:
   - Localhost: `http://localhost:5000`
   - Local network: `http://192.168.x.x:5000`
   - Deployed: `https://api.yourdomain.com`

### 3. Messages Not Displaying

**Problem**: Sent messages don't appear in chat

**Solutions**:
1. Check if conversation is initialized:
   ```javascript
   // Open console and check
   console.log('Conversation:', currentConversation)
   ```

2. Verify message is being added:
   - Check `addMessage()` function called
   - Verify message object structure
   - Check Context Provider wraps app

3. Check for JavaScript errors:
   - Open browser DevTools (F12)
   - Check Console tab
   - Look for red error messages

4. Clear browser cache:
   ```bash
   # Ctrl+Shift+Delete (Windows/Linux)
   # Cmd+Shift+Delete (Mac)
   ```

5. Force page reload: `Ctrl+F5`

### 4. Emotion Detection Not Working

**Problem**: Emotion always shows "calm"

**Solutions**:
1. Use keywords that trigger emotion:
   - Angry: "angry", "furious", "rage"
   - Frustrated: "frustrated", "upset", "annoyed"
   - Happy: "happy", "great", "awesome"

2. Check emotion detection logic:
   ```javascript
   // In ConversationContext.jsx
   const emotion = detectEmotion(message)
   console.log('Detected emotion:', emotion)
   ```

3. Update keyword list in helpers:
   ```javascript
   // src/utils/helpers.js
   if (/your|keywords|here/.test(lowerText)) {
     return 'emotion'
   }
   ```

### 5. Escalation Not Triggering

**Problem**: Angry customers not being escalated

**Solutions**:
1. Verify emotion detection works first (see #4)

2. Check escalation conditions in `ChatPage.jsx`:
   ```javascript
   if (response.shouldEscalate || emotion === 'angry' || emotion === 'frustrated') {
     escalateConversation(summary)
   }
   ```

3. Ensure backend returns `shouldEscalate: true`

4. Check Context escalateConversation is called:
   ```javascript
   console.log('Escalating conversation...')
   escalateConversation(summary)
   ```

5. Navigate to dashboard to see escalation

### 6. Audio Transcription Failing

**Problem**: Voice input doesn't convert to text

**Solutions**:
1. Verify Whisper API is accessible:
   - Check backend has Whisper API key
   - Test transcription endpoint manually

2. Check audio format:
   - Should be WAV format
   - Sample rate: 16kHz
   - Mono audio

3. Check file size:
   - Whisper limit: 25MB
   - Longer audio = larger file

4. Test with curl:
   ```bash
   curl -X POST http://localhost:5000/api/transcribe \
     -F "audio=@test.wav"
   ```

### 7. Performance Issues / Slow App

**Problem**: App is slow or laggy

**Solutions**:
1. Check browser performance:
   - Open DevTools → Performance tab
   - Record and analyze
   - Look for long tasks

2. Check for memory leaks:
   - DevTools → Memory tab
   - Take heap snapshot
   - Look for retained objects

3. Disable unnecessary features:
   - Turn off analytics
   - Disable auto-save
   - Reduce animation complexity

4. Optimize images:
   - Use WebP format
   - Compress SVGs
   - Lazy load images

5. Clear browser cache:
   - Ctrl+Shift+Delete
   - Force reload: Ctrl+F5

### 8. Mobile Browser Issues

**Problem**: App doesn't work well on mobile

**Solutions**:
1. Force responsive layout:
   ```css
   /* In src/index.css */
   @media (max-width: 480px) {
     /* Mobile-specific styles */
   }
   ```

2. Fix touch events:
   ```javascript
   // Use onTouchEnd instead of onClick for buttons
   <button onTouchEnd={handleClick} onClick={handleClick}>
   ```

3. Mobile keyboard hiding:
   ```javascript
   // Force scroll into view
   inputRef.current?.scrollIntoView({ behavior: 'smooth' })
   ```

4. Disable zoom on double-tap:
   ```html
   <meta name="viewport" content="viewport-fit=cover, user-scalable=no">
   ```

### 9. Messages Disappear on Refresh

**Problem**: Chat history lost when page reloads

**Solutions**:
1. Add localStorage persistence:
   ```javascript
   // Save to localStorage
   useEffect(() => {
     localStorage.setItem('conversation', JSON.stringify(currentConversation))
   }, [currentConversation])
   ```

2. Load from localStorage:
   ```javascript
   // In useEffect
   const saved = localStorage.getItem('conversation')
   if (saved) {
     setCurrentConversation(JSON.parse(saved))
   }
   ```

3. Use Supabase to persist:
   ```javascript
   await supabase.from('conversations').insert([conversation])
   ```

### 10. Styling Issues

**Problem**: Tailwind CSS not applying

**Solutions**:
1. Rebuild Tailwind:
   ```bash
   npm run build
   ```

2. Clear cache:
   ```bash
   rm -rf node_modules/.vite
   npm install
   ```

3. Update template paths in `tailwind.config.js`:
   ```javascript
   content: [
     "./src/**/*.{js,jsx}",
     "./index.html"
   ]
   ```

4. Check import in main file:
   ```javascript
   import './index.css'  // Must be imported
   ```

5. Restart dev server:
   ```bash
   npm run dev
   ```

---

## FAQ (Frequently Asked Questions)

### Q: How do I add more demo users?

**A**: Edit `src/pages/ChatPage.jsx`:

```javascript
const demoUsers = [
  { id: 'USR001', name: 'John Doe' },
  { id: 'USR002', name: 'Sarah Smith' },
  { id: 'USR003', name: 'Mike Johnson' },
  // Add more here
  { id: 'USR004', name: 'New User' }
]
```

### Q: How do I change the primary color?

**A**: Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#YOUR_HEX_COLOR',  // Change here
    }
  }
}
```

Then restart dev server.

### Q: Can I deploy this to production?

**A**: Yes, build and deploy:

```bash
# Build
npm run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - GitHub Pages
# - Your server
```

### Q: How do I add authentication?

**A**: Add login wrapper:

```javascript
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />
  }
  
  return <ChatPage />
}
```

### Q: Can I add another page?

**A**: Yes, add in `App.jsx`:

```javascript
<Routes>
  <Route path="/" element={<ChatPage />} />
  <Route path="/dashboard" element={<AgentDashboard />} />
  <Route path="/new-page" element={<NewPage />} />  {/* Add here */}
</Routes>
```

### Q: How do I change the bot's personality?

**A**: Modify the system prompt in backend and customize responses:

```javascript
// In ChatPage.jsx handleSendMessage
const systemPrompt = `You are a friendly customer support agent. Be empathetic and helpful.`
// Send to backend
```

### Q: How do I add database persistence?

**A**: Integrate Supabase or add to backend:

```javascript
// Save on message add
const saveMessage = async (message) => {
  await supabase.from('messages').insert([message])
}
```

### Q: Can I use this with a mobile app?

**A**: Yes, use React Native:

```bash
npx create-expo-app smartvoice-mobile
# Share components and hooks
```

### Q: How do I debug issues?

**A**: Use these tools:

1. **Browser DevTools**: F12
   - Console: See errors
   - Network: Check API calls
   - Performance: Find bottlenecks
   - Application: Check localStorage

2. **React DevTools Extension**: Chrome extension
   - Inspect components
   - Check props and state
   - Track re-renders

3. **Terminal Logs**:
   ```bash
   npm run dev  # See console output
   ```

4. **Add Logging**:
   ```javascript
   console.log('Debug info:', variable)
   console.error('Error:', error)
   ```

### Q: How do I test on my phone?

**A**: Use local network:

1. Get your PC IP:
   ```bash
   # Windows
   ipconfig | find "IPv4"
   
   # Mac/Linux
   ifconfig | grep "inet "
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```

3. On phone, go to: `http://YOUR_IP:3000`

### Q: How do I improve emotion detection?

**A**: Add AI-based detection:

```javascript
// Use backend NLP
const emotion = await detectEmotionWithAI(message)

// Or integrate Hugging Face models
import { pipeline } from '@huggingface/transformers'
const classifier = await pipeline('sentiment-analysis')
```

### Q: How do I add real-time updates?

**A**: Use WebSocket or Supabase real-time:

```javascript
// Supabase real-time
supabase
  .from('escalations')
  .on('*', payload => {
    console.log('Update:', payload)
    // Update state
  })
  .subscribe()
```

---

## Getting Help

### Resources
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind Docs](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [Axios Docs](https://axios-http.com)

### Need more help?
- Check ARCHITECTURE.md for system design
- Review COMPONENTS.md for component details
- See INTEGRATION_GUIDE.md for backend setup
- Check GitHub Issues in project repo

---

**Last Updated**: March 2026
