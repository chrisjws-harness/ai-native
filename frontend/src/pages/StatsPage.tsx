import { useState, useEffect } from "react";
import api from "../api/client";
import { Ruleset } from "../types";

interface MissedCombo {
  ruleset_id: number;
  hand_type: string;
  player_value: string;
  dealer_upcard: string;
  correct_action: string;
  total: number;
  missed: number;
  accuracy: number;
  avg_ms: number | null;
}

interface StatsData {
  summary: {
    total_attempts: number;
    total_correct: number;
    overall_accuracy: number;
    unique_combos_missed: number;
    avg_response_ms: number | null;
  };
  most_missed: MissedCombo[];
}

type TimedFilter = "all" | "timed" | "untimed";

const ACTION_NAMES: Record<string, string> = {
  H: "Hit", S: "Stand", D: "Double", Ds: "Double (stand)",
  P: "Split", Ph: "Split (hit)", Rh: "Surrender (hit)",
  Rs: "Surrender (stand)", Rp: "Surrender (split)",
};

const HAND_TYPE_LABELS: Record<string, string> = {
  hard: "Hard", soft: "Soft", pair: "Pair",
};

function playerDisplay(handType: string, value: string): string {
  if (handType === "soft") return `A+${value.slice(1)}`;
  if (handType === "pair") {
    const card = value[0] === "T" ? "10" : value[0];
    return `${card},${card}`;
  }
  return value;
}

function accuracyColor(pct: number): string {
  if (pct >= 80) return "var(--green)";
  if (pct >= 50) return "var(--yellow)";
  return "var(--red)";
}

function formatMs(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function StatsPage() {
  const [rulesets, setRulesets] = useState<Ruleset[]>([]);
  const [selectedRulesetId, setSelectedRulesetId] = useState<number | null>(null);
  const [timedFilter, setTimedFilter] = useState<TimedFilter>("all");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/rulesets/").then((res) => {
      setRulesets(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setStats(null);
    const params = new URLSearchParams();
    if (selectedRulesetId) params.set("ruleset_id", String(selectedRulesetId));
    if (timedFilter === "timed") params.set("timed", "true");
    else if (timedFilter === "untimed") params.set("timed", "false");
    const qs = params.toString();
    api.get<StatsData>(`/stats/missed${qs ? `?${qs}` : ""}`).then((res) => setStats(res.data));
  }, [selectedRulesetId, timedFilter]);

  const rulesetName = (id: number) => rulesets.find((r) => r.id === id)?.name ?? `Ruleset ${id}`;

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="stats-page">
      <h2>Performance Stats</h2>

      <div className="stats-controls">
        <select
          value={selectedRulesetId ?? ""}
          onChange={(e) => setSelectedRulesetId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">All Rulesets</option>
          {rulesets.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <select
          value={timedFilter}
          onChange={(e) => setTimedFilter(e.target.value as TimedFilter)}
        >
          <option value="all">All Hands</option>
          <option value="timed">Timed Only</option>
          <option value="untimed">Untimed Only</option>
        </select>
      </div>

      {stats && (
        <>
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-value">{stats.summary.total_attempts}</div>
              <div className="stat-label">Total Attempts</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: accuracyColor(stats.summary.overall_accuracy) }}>
                {stats.summary.overall_accuracy}%
              </div>
              <div className="stat-label">Overall Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.summary.total_correct}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: stats.summary.unique_combos_missed > 0 ? "var(--red)" : "var(--green)" }}>
                {stats.summary.unique_combos_missed}
              </div>
              <div className="stat-label">Combos Missed</div>
            </div>
            {stats.summary.avg_response_ms != null && (
              <div className="stat-card">
                <div className="stat-value">{formatMs(stats.summary.avg_response_ms)}</div>
                <div className="stat-label">Avg Response</div>
              </div>
            )}
          </div>

          {stats.most_missed.length === 0 ? (
            <div className="stats-empty">
              {stats.summary.total_attempts === 0
                ? "No training data yet. Start drilling to see your stats!"
                : "Perfect score! No missed combinations."}
            </div>
          ) : (
            <div className="missed-table-wrap">
              <table className="missed-table">
                <thead>
                  <tr>
                    <th>Hand</th>
                    <th>vs Dealer</th>
                    <th>Correct Play</th>
                    <th>Missed</th>
                    <th>Total</th>
                    <th>Accuracy</th>
                    <th>Avg Time</th>
                    {!selectedRulesetId && <th>Ruleset</th>}
                  </tr>
                </thead>
                <tbody>
                  {stats.most_missed.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <span className="hand-type-badge">{HAND_TYPE_LABELS[c.hand_type]}</span>
                        {playerDisplay(c.hand_type, c.player_value)}
                      </td>
                      <td>{c.dealer_upcard === "A" ? "Ace" : c.dealer_upcard}</td>
                      <td className="action-cell">{ACTION_NAMES[c.correct_action] || c.correct_action}</td>
                      <td className="missed-count">{c.missed}</td>
                      <td>{c.total}</td>
                      <td style={{ color: accuracyColor(c.accuracy) }}>{c.accuracy}%</td>
                      <td className="time-cell">{formatMs(c.avg_ms)}</td>
                      {!selectedRulesetId && <td className="ruleset-cell">{rulesetName(c.ruleset_id)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
