import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/client";
import useTraining from "../hooks/useTraining";
import ModeSelector from "../components/training/ModeSelector";
import HandDisplay from "../components/training/HandDisplay";
import ActionButtons from "../components/training/ActionButtons";
import FeedbackBanner from "../components/training/FeedbackBanner";
import ScoreTracker from "../components/training/ScoreTracker";
import StrategyGrid from "../components/cherrypick/StrategyGrid";
import { Ruleset, StrategyResponse, StrategyMap, TrainingMode, Action, HandCombo, ComboWeight } from "../types";

// Map keys to actions — numpad row, letter keys, home row
const NUM_MAP: Record<string, Action> = { "4": "H", "5": "S", "6": "D", "0": "P" };
const LETTER_MAP: Record<string, Action> = { H: "H", S: "S", D: "D", P: "P", R: "R" };
const HOME_MAP: Record<string, Action> = { a: "H", s: "S", d: "D", f: "P", g: "R" };

function keyToAction(key: string): Action | null {
  if (key in NUM_MAP) return NUM_MAP[key];
  const upper = key.toUpperCase();
  if (upper in LETTER_MAP) return LETTER_MAP[upper];
  if (key.toLowerCase() in HOME_MAP) return HOME_MAP[key.toLowerCase()];
  return null;
}

export default function TrainingPage() {
  const [rulesets, setRulesets] = useState<Ruleset[]>([]);
  const [selectedRulesetId, setSelectedRulesetId] = useState<number | null>(null);
  const [strategy, setStrategy] = useState<StrategyMap | null>(null);
  const [surrender, setSurrender] = useState("none");
  const [mode, setMode] = useState<TrainingMode>("random");
  const [loading, setLoading] = useState(true);
  const [timed, setTimed] = useState(false);

  // Adaptive state
  const [hotspotSlider, setHotspotSlider] = useState(50);
  const [adaptiveLoading, setAdaptiveLoading] = useState(false);
  const [adaptiveError, setAdaptiveError] = useState("");

  // Track the last action submitted (for same-key-to-advance)
  const lastActionRef = useRef<Action | null>(null);

  const training = useTraining(selectedRulesetId, strategy);

  useEffect(() => {
    api.get("/rulesets/").then((res) => {
      setRulesets(res.data);
      if (res.data.length > 0) {
        setSelectedRulesetId(res.data[0].id);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedRulesetId) return;
    api.get<StrategyResponse>(`/rulesets/${selectedRulesetId}/strategy`).then((res) => {
      setStrategy(res.data.strategy);
      setSurrender(res.data.ruleset.surrender);
    });
  }, [selectedRulesetId]);

  const handleAction = useCallback(
    (action: Action) => {
      if (training.lastResult) {
        // Only advance if Enter or same key as last answer
        if (action === lastActionRef.current) {
          training.nextHand();
          lastActionRef.current = null;
        }
      } else {
        lastActionRef.current = action;
        training.submitAnswer(action);
      }
    },
    [training]
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (!training.isDrilling) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (training.lastResult) {
        // Enter always advances
        if (e.key === "Enter") {
          e.preventDefault();
          training.nextHand();
          lastActionRef.current = null;
          return;
        }
        // Same key as last answer advances
        const action = keyToAction(e.key);
        if (action && action === lastActionRef.current) {
          e.preventDefault();
          training.nextHand();
          lastActionRef.current = null;
          return;
        }
        // Any other key: ignore
        return;
      }

      const action = keyToAction(e.key);
      if (action) {
        e.preventDefault();
        lastActionRef.current = action;
        training.submitAnswer(action);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [training]);

  const handleCherryPickStart = useCallback(
    (combos: HandCombo[]) => {
      training.startDrilling(combos, undefined, timed);
    },
    [training, timed]
  );

  const handleAdaptiveStart = useCallback(async () => {
    if (!selectedRulesetId) return;
    setAdaptiveLoading(true);
    setAdaptiveError("");
    try {
      const res = await api.get<{ weights: ComboWeight[]; total_attempts?: number; min_required?: number }>(
        `/stats/weights?ruleset_id=${selectedRulesetId}`
      );
      const { weights: hotspots, total_attempts, min_required } = res.data;
      if (min_required && total_attempts !== undefined && total_attempts < min_required) {
        setAdaptiveError(
          `Need at least ${min_required} hands to unlock adaptive mode. You have ${total_attempts} so far — keep drilling in Random mode!`
        );
        return;
      }
      if (hotspots.length === 0) {
        setAdaptiveError("Perfect accuracy so far — no weak spots to target. Keep it up!");
        return;
      }
      training.startDrilling(undefined, {
        hotspots,
        slider: hotspotSlider / 100,
      }, timed);
    } catch {
      setAdaptiveError("Failed to load adaptive data.");
    } finally {
      setAdaptiveLoading(false);
    }
  }, [selectedRulesetId, hotspotSlider, training, timed]);

  const sliderLabel = hotspotSlider === 0
    ? "Pure random"
    : hotspotSlider === 100
    ? "Only weak spots"
    : `${hotspotSlider}% of hands target weak spots`;

  if (loading) return <div className="loading">Loading rulesets...</div>;

  return (
    <div className="training-page">
      <div className="training-controls">
        <select
          value={selectedRulesetId ?? ""}
          onChange={(e) => {
            setSelectedRulesetId(Number(e.target.value));
            training.stopDrilling();
          }}
          disabled={training.isDrilling}
        >
          {rulesets.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <ModeSelector mode={mode} onChange={(m) => { setMode(m); training.stopDrilling(); setAdaptiveError(""); }} disabled={training.isDrilling} />
        <label className="timed-toggle" title="Show live timer and track response speed">
          <input
            type="checkbox"
            checked={timed}
            onChange={(e) => setTimed(e.target.checked)}
            disabled={training.isDrilling}
          />
          <span className="timed-label">Timed</span>
        </label>
      </div>

      {!training.isDrilling && mode === "random" && strategy && (
        <div className="start-section">
          <button className="btn btn-primary btn-large" onClick={() => training.startDrilling(undefined, undefined, timed)}>
            Start Random Drilling
          </button>
        </div>
      )}

      {!training.isDrilling && mode === "cherrypick" && strategy && (
        <StrategyGrid strategy={strategy} onStart={handleCherryPickStart} />
      )}

      {!training.isDrilling && mode === "adaptive" && strategy && (
        <div className="adaptive-setup">
          <h3>Adaptive Drilling</h3>
          <p className="adaptive-desc">
            Focuses on your weakest spots. Adjust the slider to control how aggressively it targets them.
          </p>
          <div className="slider-container">
            <input
              type="range"
              min={0}
              max={100}
              value={hotspotSlider}
              onChange={(e) => setHotspotSlider(Number(e.target.value))}
              className="hotspot-slider"
            />
            <div className="slider-labels">
              <span>0% Random</span>
              <span>50%</span>
              <span>100% Weak Spots</span>
            </div>
            <div className="slider-value">{sliderLabel}</div>
          </div>
          {adaptiveError && <div className="adaptive-msg">{adaptiveError}</div>}
          <button
            className="btn btn-primary btn-large"
            onClick={handleAdaptiveStart}
            disabled={adaptiveLoading}
          >
            {adaptiveLoading ? "Loading..." : "Start Adaptive Drilling"}
          </button>
        </div>
      )}

      {training.isDrilling && (
        <div className="drill-view">
          <div className="score-row">
            <ScoreTracker correct={training.score.correct} total={training.score.total} />
            {training.isAdaptive && (
              <span className="adaptive-badge">
                Adaptive {Math.round(training.adaptiveSlider * 100)}%
              </span>
            )}
            {timed && <span className="timed-badge">Timed</span>}
          </div>

          {training.dealt && training.currentHand && (
            <>
              <HandDisplay dealt={training.dealt} />
              <ActionButtons
                hand={training.currentHand}
                hasSurrender={surrender !== "none"}
                onAction={handleAction}
                disabled={!!training.lastResult}
              />
            </>
          )}

          {training.lastResult && (
            <div className="click-to-advance" onClick={() => { training.nextHand(); lastActionRef.current = null; }}>
              <FeedbackBanner result={training.lastResult} showTime={timed} />
              <div className="next-hint">Click, press <kbd>Enter</kbd>, or same key to continue</div>
            </div>
          )}

          <button className="btn btn-stop" onClick={training.stopDrilling}>
            Stop
          </button>
        </div>
      )}

      {training.isDrilling && (
        <div className="shortcut-legend">
          <div className="legend-title">Keyboard Shortcuts</div>
          <div className="legend-row">
            <span><kbd>4</kbd><kbd>A</kbd> Hit</span>
            <span><kbd>5</kbd><kbd>S</kbd> Stand</span>
            <span><kbd>6</kbd><kbd>D</kbd> Double</span>
            <span><kbd>0</kbd><kbd>F</kbd> Split</span>
            <span><kbd>G</kbd> Surrender</span>
          </div>
        </div>
      )}
    </div>
  );
}
