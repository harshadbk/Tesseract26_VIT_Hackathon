import React, { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EscalationCard from "../components/EscalationCard";
import StatsCard from "../components/StatsCard";
import { useConversation } from "../context/ConversationContext";
import "./AgentDashboard.css";

const AgentDashboard = () => {
  const navigate = useNavigate();

  const { escalations, assignEscalation, resolveEscalation } =
    useConversation();

  const [statusFilter, setStatusFilter] = useState("all");
  const [emotionFilter, setEmotionFilter] = useState("all");

  // 🔍 Filter logic
  const filteredEscalations = useMemo(() => {
    return escalations.filter((item) => {
      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchEmotion =
        emotionFilter === "all" || item.emotion === emotionFilter;
      return matchStatus && matchEmotion;
    });
  }, [escalations, statusFilter, emotionFilter]);

  // 📂 Active & Resolved
  const activeCases = useMemo(() => {
    return filteredEscalations.filter(
      (item) => item.status === "pending" || item.status === "assigned",
    );
  }, [filteredEscalations]);

  const resolvedCases = useMemo(() => {
    return filteredEscalations.filter((item) => item.status === "resolved");
  }, [filteredEscalations]);

  // 📊 Stats
  const stats = useMemo(() => {
    return {
      total: escalations.length,
      pending: escalations.filter((e) => e.status === "pending").length,
      assigned: escalations.filter((e) => e.status === "assigned").length,
      resolved: escalations.filter((e) => e.status === "resolved").length,
      highEmotion: escalations.filter(
        (e) => e.emotion === "angry" || e.emotion === "frustrated",
      ).length,
    };
  }, [escalations]);

  return (
    <div className="agent-dashboard-page">
      <div className="agent-dashboard-shell">
        {/* 🔹 HEADER */}
        <header className="agent-dashboard-header">
          <div className="agent-dashboard-header-row">
            <div className="agent-dashboard-title-group">
              <button
                className="agent-dashboard-back-btn"
                onClick={() => navigate("/")}
              >
                ← Back
              </button>

              <div>
                <h1 className="agent-dashboard-title">Human Agent Dashboard</h1>
                <p className="agent-dashboard-subtitle">
                  Manage escalated customer issues efficiently
                </p>
              </div>
            </div>

            <div className="agent-dashboard-total-card">
              <p className="label">Escalated Cases</p>
              <h2>{stats.total}</h2>
            </div>
          </div>
        </header>

        {/* 🔹 STATS */}
        <section className="agent-dashboard-stats-grid">
          <StatsCard label="Total" value={stats.total} />
          <StatsCard label="Pending" value={stats.pending} />
          <StatsCard label="Assigned" value={stats.assigned} />
          <StatsCard label="Resolved" value={stats.resolved} />
          <StatsCard label="High Emotion" value={stats.highEmotion} />
        </section>

        {/* 🔹 FILTERS */}
        <section className="agent-dashboard-filters">
          <h3>Filters</h3>

          <div className="agent-dashboard-filter-grid">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="agent-dashboard-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={emotionFilter}
              onChange={(e) => setEmotionFilter(e.target.value)}
              className="agent-dashboard-select"
            >
              <option value="all">All Emotions</option>
              <option value="angry">Angry</option>
              <option value="frustrated">Frustrated</option>
              <option value="calm">Calm</option>
              <option value="confused">Confused</option>
              <option value="happy">Happy</option>
            </select>
          </div>
        </section>

        {/* 🔹 CASES */}
        <section className="agent-dashboard-cases-grid">
          {/* 🟡 OPEN CASES */}
          <div className="agent-dashboard-cases-column">
            <div className="agent-dashboard-cases-head">
              <h3>Open Cases</h3>
              <span className="badge warning">{activeCases.length}</span>
            </div>

            {activeCases.length === 0 ? (
              <div className="agent-dashboard-empty-state">No active cases</div>
            ) : (
              <div className="agent-dashboard-cases-list">
                {activeCases.map((item) => (
                  <EscalationCard
                    key={item.id}
                    escalation={item}
                    onAssign={assignEscalation}
                    onResolve={resolveEscalation}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 🟢 RESOLVED CASES */}
          <div className="agent-dashboard-cases-column">
            <div className="agent-dashboard-cases-head">
              <h3>Resolved Cases</h3>
              <span className="badge success">{resolvedCases.length}</span>
            </div>

            {resolvedCases.length === 0 ? (
              <div className="agent-dashboard-empty-state">
                No resolved cases
              </div>
            ) : (
              <div className="agent-dashboard-cases-list">
                {resolvedCases.map((item) => (
                  <EscalationCard
                    key={item.id}
                    escalation={item}
                    onAssign={assignEscalation}
                    onResolve={resolveEscalation}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AgentDashboard;
