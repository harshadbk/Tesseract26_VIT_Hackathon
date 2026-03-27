import React, { useMemo, useState } from "react";
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

  const filteredEscalations = useMemo(() => {
    return escalations.filter((item) => {
      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchEmotion =
        emotionFilter === "all" || item.emotion === emotionFilter;
      return matchStatus && matchEmotion;
    });
  }, [escalations, statusFilter, emotionFilter]);

  const activeCases = useMemo(() => {
    return filteredEscalations.filter(
      (item) => item.status === "pending" || item.status === "assigned",
    );
  }, [filteredEscalations]);

  const resolvedCases = useMemo(() => {
    return filteredEscalations.filter((item) => item.status === "resolved");
  }, [filteredEscalations]);

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

  const statItems = [
    { label: "Total", value: stats.total, color: "slate" },
    { label: "Pending", value: stats.pending, color: "orange" },
    { label: "Assigned", value: stats.assigned, color: "blue" },
    { label: "Resolved", value: stats.resolved, color: "green" },
    { label: "High Emotion", value: stats.highEmotion, color: "red" },
  ];

  return (
    <div className="agent-dashboard-page">
      <div className="agent-dashboard-shell">
        {/* HEADER */}
        <header className="agent-dashboard-header enter-1">
          <div className="agent-dashboard-header-row">
            <div className="agent-dashboard-title-group">
              <button
                className="agent-dashboard-back-btn btn-press"
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

            <div className="agent-dashboard-total-card scale-in">
              <p className="label">Escalated Cases</p>
              <h2 className="number-pop">{stats.total}</h2>
            </div>
          </div>
        </header>

        {/* STATS */}
        <section className="agent-dashboard-stats-grid enter-2">
          {statItems.map((item, idx) => (
            <div key={item.label} style={{ animationDelay: `${0.08 + idx * 0.06}s` }} className="enter-3">
              <StatsCard label={item.label} value={item.value} color={item.color} />
            </div>
          ))}
        </section>

        {/* FILTERS */}
        <section className="agent-dashboard-filters enter-3">
          <h3>Filters</h3>

          <div className="agent-dashboard-filter-grid">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="agent-dashboard-select btn-press"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={emotionFilter}
              onChange={(e) => setEmotionFilter(e.target.value)}
              className="agent-dashboard-select btn-press"
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

        {/* CASES */}
        <section className="agent-dashboard-cases-grid enter-4">
          {/* OPEN CASES */}
          <div className="agent-dashboard-cases-column">
            <div className="agent-dashboard-cases-head">
              <h3>Open Cases</h3>
              <span className="badge warning status-pulse">{activeCases.length}</span>
            </div>

            {activeCases.length === 0 ? (
              <div className="agent-dashboard-empty-state">
                <div>
                  <p className="text-lg mb-1">📋</p>
                  <p>No active cases</p>
                </div>
              </div>
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

          {/* RESOLVED CASES */}
          <div className="agent-dashboard-cases-column">
            <div className="agent-dashboard-cases-head">
              <h3>Resolved Cases</h3>
              <span className="badge success status-pulse">{resolvedCases.length}</span>
            </div>

            {resolvedCases.length === 0 ? (
              <div className="agent-dashboard-empty-state">
                <div>
                  <p className="text-lg mb-1">✅</p>
                  <p>No resolved cases</p>
                </div>
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
