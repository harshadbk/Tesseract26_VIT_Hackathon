import React from "react";
import {
  BrowserRouter as Router,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";
import ConversationContext from "./context/ConversationContext";
import ChatPage from "./pages/ChatPage";
import AgentDashboard from "./pages/AgentDashboard";

function App() {
  return (
    <ConversationContext>
      <Router>
        <div className="flex h-screen flex-col overflow-hidden bg-app">
          <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-lg enter-1">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-2.5 md:px-5">
              <div className="slide-in-left">
                <p className="font-display title-gradient text-lg font-bold">
                  SmartVoice Support Agent
                </p>
                <p className="text-xs text-slate-500">
                  AI and human handoff for customer support
                </p>
              </div>
              <nav className="flex items-center gap-2 slide-in-right">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `nav-link-animated btn-press rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md"
                    }`
                  }
                >
                  💬 Chat
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `nav-link-animated btn-press rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md"
                    }`
                  }
                >
                  📊 Dashboard
                </NavLink>
              </nav>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/dashboard" element={<AgentDashboard />} />
            </Routes>
          </main>

          <footer className="footer-breathe border-t border-slate-200/50 bg-white/70 backdrop-blur-lg px-4 py-2.5 text-center text-sm text-slate-500">
            <div className="max-w-6xl mx-auto">
              © 2026{" "}
              <span className="font-semibold text-slate-700">
                Smart Voice Support
              </span>
              <span className="mx-2 text-slate-300">•</span>
              All rights reserved
            </div>
          </footer>
        </div>
      </Router>
    </ConversationContext>
  );
}

export default App;
