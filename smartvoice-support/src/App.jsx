import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ConversationContext from './context/ConversationContext'
import ChatPage from './pages/ChatPage'
import AgentDashboard from './pages/AgentDashboard'

function App() {
  return (
    <ConversationContext>
      <Router>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/dashboard" element={<AgentDashboard />} />
        </Routes>
      </Router>
    </ConversationContext>
  )
}

export default App