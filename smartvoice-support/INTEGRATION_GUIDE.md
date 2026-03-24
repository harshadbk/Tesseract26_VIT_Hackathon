# Environment & Integration Setup

## Environment Variables

### Frontend (.env file)

Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development

# OpenAI Configuration (if using frontend-side API calls)
REACT_APP_OPENAI_API_KEY=your_openai_key_here

# Analytics (optional)
REACT_APP_ANALYTICS_ID=your_analytics_id
```

### Development vs Production

**Development** (`.env.development`):
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

**Production** (`.env.production`):
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
```

## Backend API Contract

### 1. Detect Intent Endpoint
```typescript
POST /api/detect-intent
Content-Type: application/json

Request:
{
  "message": "Where is my order?"
}

Response:
{
  "intent": "order_status",
  "confidence": 0.95,
  "category": "order_tracking"
}
```

### 2. Bot Response Endpoint
```typescript
POST /api/bot-response
Content-Type: application/json

Request:
{
  "message": "My order is late",
  "conversationHistory": [
    {
      "sender": "user",
      "text": "Hello",
      "emotion": "calm"
    }
  ],
  "emotion": "frustrated"
}

Response:
{
  "response": "I understand your frustration. Let me check your order status...",
  "shouldEscalate": true,
  "intent": "complaint",
  "nextAction": "get_order_details"
}
```

### 3. Order Details Endpoint
```typescript
GET /api/order/:orderId

Response:
{
  "orderId": "ORD123456",
  "status": "in_transit",
  "expectedDelivery": "2026-03-26",
  "items": [
    {
      "name": "Product Name",
      "quantity": 1,
      "price": 99.99
    }
  ],
  "tracking": "TRACK123456"
}
```

### 4. Generate Summary Endpoint
```typescript
POST /api/generate-summary
Content-Type: application/json

Request:
{
  "conversation": [
    {
      "sender": "user",
      "text": "My order is late"
    },
    {
      "sender": "bot",
      "text": "Let me check..."
    }
  ]
}

Response:
{
  "summary": "Customer reports delayed order. Order ORD123 expected 3/26.",
  "keyPoints": [
    "Order delay",
    "Frustrated customer",
    "Needs status update"
  ],
  "sentiment": "frustrated",
  "recommendation": "Offer expedited shipping or discount"
}
```

### 5. Create Escalation Endpoint
```typescript
POST /api/escalations
Content-Type: application/json

Request:
{
  "conversationId": 1234,
  "userId": "USR001",
  "userName": "John Doe",
  "emotion": "frustrated",
  "summary": "Customer reports delayed order",
  "messages": [...]
}

Response:
{
  "id": 5678,
  "conversationId": 1234,
  "status": "pending",
  "createdAt": "2026-03-24T10:30:00Z"
}
```

### 6. Get Escalations Endpoint
```typescript
GET /api/escalations?status=pending&emotion=angry

Response:
[
  {
    "id": 5678,
    "conversationId": 1234,
    "userId": "USR001",
    "userName": "John Doe",
    "emotion": "frustrated",
    "summary": "Customer reports delayed order",
    "status": "pending",
    "createdAt": "2026-03-24T10:30:00Z"
  }
]
```

### 7. Assign Escalation Endpoint
```typescript
PATCH /api/escalations/:escalationId/assign
Content-Type: application/json

Request:
{
  "agentName": "John Smith",
  "agentId": "AGT001"
}

Response:
{
  "id": 5678,
  "status": "assigned",
  "assignedAgent": "John Smith"
}
```

### 8. Resolve Escalation Endpoint
```typescript
PATCH /api/escalations/:escalationId/resolve
Content-Type: application/json

Request:
{
  "resolution": "Provided 50% refund and free shipping",
  "status": "resolved"
}

Response:
{
  "id": 5678,
  "status": "resolved",
  "resolution": "Provided 50% refund and free shipping",
  "resolvedAt": "2026-03-24T11:45:00Z"
}
```

### 9. Transcribe Audio Endpoint
```typescript
POST /api/transcribe
Content-Type: multipart/form-data

Form Data:
{
  "audio": <AudioBlob>
}

Response:
{
  "text": "Where is my order?",
  "confidence": 0.98,
  "language": "en"
}
```

## Backend Implementation Guide

### Node.js/Express Example

```javascript
// Express setup
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Detect Intent
app.post('/api/detect-intent', async (req, res) => {
  const { message } = req.body;
  
  // Use OpenAI API to detect intent
  const intent = await detectIntentWithGPT(message);
  
  res.json({
    intent: intent.type,
    confidence: intent.confidence,
    category: intent.category
  });
});

// Bot Response
app.post('/api/bot-response', async (req, res) => {
  const { message, conversationHistory, emotion } = req.body;
  
  // Generate response using GPT
  const response = await generateBotResponse(message, emotion);
  
  // Check if should escalate
  const shouldEscalate = checkEscalationCriteria(
    emotion,
    conversationHistory.length
  );
  
  res.json({
    response,
    shouldEscalate,
    intent: response.intent
  });
});

// Transcribe Audio
app.post('/api/transcribe', async (req, res) => {
  const buffer = req.file.buffer;
  
  // Use Whisper API
  const text = await transcribeWithWhisper(buffer);
  
  res.json({
    text,
    confidence: 0.95
  });
});
```

### Python/FastAPI Example

```python
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import openai

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/detect-intent")
async def detect_intent(message: str):
    intent = await get_intent_from_gpt(message)
    return {
        "intent": intent["type"],
        "confidence": intent["confidence"],
        "category": intent["category"]
    }

@app.post("/api/bot-response")
async def bot_response(message: str, emotion: str, history: list):
    response = await generate_response_with_gpt(message, emotion)
    should_escalate = check_escalation(emotion, len(history))
    
    return {
        "response": response,
        "shouldEscalate": should_escalate,
        "intent": response.get("intent")
    }

@app.post("/api/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    content = await audio.read()
    text = await transcribe_with_whisper(content)
    
    return {
        "text": text,
        "confidence": 0.95
    }
```

## Database Schema

### PostgreSQL/Supabase Setup

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  emotion VARCHAR(50),
  summary TEXT,
  is_escalated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id),
  sender VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  emotion VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Escalations table
CREATE TABLE escalations (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  emotion VARCHAR(50),
  summary TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  assigned_agent VARCHAR(255),
  resolution TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Orders table (for reference)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  product_name VARCHAR(255),
  status VARCHAR(50),
  delivery_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Supabase Integration

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Get API URL and Key

### 2. Initialize Supabase Client (Optional - for React)

```javascript
// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Fetch conversations
export async function getConversations(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
  
  return data
}

// Save conversation
export async function saveConversation(conversation) {
  const { data, error } = await supabase
    .from('conversations')
    .insert([conversation])
  
  return data
}
```

### 3. Environment Variables for Supabase

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=your_supabase_key
```

## Testing the Integration

### Using cURL

```bash
# Detect Intent
curl -X POST http://localhost:5000/api/detect-intent \
  -H "Content-Type: application/json" \
  -d '{"message":"Where is my order?"}'

# Get Bot Response
curl -X POST http://localhost:5000/api/bot-response \
  -H "Content-Type: application/json" \
  -d '{
    "message":"My order is late",
    "conversationHistory":[],
    "emotion":"frustrated"
  }'

# Transcribe Audio
curl -X POST http://localhost:5000/api/transcribe \
  -F "audio=@voice.wav"
```

### Using Postman

1. Create new collection
2. Add requests for each endpoint
3. Set localhost:5000 as base URL
4. Test with sample data
5. Verify responses match contracts

## Deployment Checklist

- [ ] Backend API deployed (Heroku, AWS, DigitalOcean)
- [ ] Database configured (Supabase, AWS RDS)
- [ ] OpenAI API key configured
- [ ] Whisper API access verified
- [ ] CORS configured correctly
- [ ] Environment variables set on server
- [ ] SSL certificate installed
- [ ] Database backups configured
- [ ] Monitoring/logging enabled
- [ ] Rate limiting configured

## Security Best Practices

1. **API Keys**: Store in environment variables, not in code
2. **CORS**: Restrict to trusted origins
3. **Rate Limiting**: Implement per IP/user limits
4. **Input Validation**: Validate all incoming data
5. **Error Handling**: Don't expose sensitive details
6. **Logging**: Log to secure location
7. **SSL/TLS**: Use HTTPS only
8. **Database**: Use parameterized queries

---

**For Backend Implementation**: See backend repository documentation
