import { useState, useEffect, useCallback } from "react";
import api from "../api/client";
import useTraining from "../hooks/useTraining";
import ModeSelector from "../components/training/ModeSelector";
import HandDisplay from "../components/training/HandDisplay";
import ActionButtons from "../components/training/ActionButtons";
import FeedbackBanner from "../components/training/FeedbackBanner";
import ScoreTracker from "../components/training/ScoreTracker";
import StrategyGrid from "../components/cherrypick/StrategyGrid";
import { Ruleset, StrategyResponse, StrategyMap, TrainingMode, Action, HandCombo } from "../types";

export default function TrainingPage() {
  const [rulesets, setRulesets] = useState<Ruleset[]>([]);
  const [selectedRulesetId, setSelectedRulesetId] = useState<number | null>(null);
  const [strategy, setStrategy] = useState<StrategyMap | null>(null);
  const [surrender, setSurrender] = useState("none");
  const [mode, setMode] = useState<TrainingMode>("random");
  const [loading, setLoading] = useState(true);

  const training = useTraining(selectedRulesetId, strategy);

  // Fetch rulesets on mount
  useEffect(() => {
    api.get("/rulesets/").then((res) => {
      setRulesets(res.data);
      if (res.data.length > 0) {
        setSelectedRulesetId(res.data[0].id);
      }
      setLoading(false);
    });
  }, []);

  // Fetch strategy when ruleset changes
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
        training.nextHand();
      } else {
        training.submitAnswer(action);
      }
    },
    [training]
  );

  // Keyboard shortcuts: letter keys, numpad, and home row
  useEffect(() => {
    if (!training.isDrilling) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Advance to next hand
      if (training.lastResult) {
        const advanceKeys = [" ", "Enter", "1", "2", "3", "4", "5", "a", "s", "d", "f", "g"];
        if (advanceKeys.includes(e.key) || advanceKeys.includes(e.key.toLowerCase())) {
          e.preventDefault();
          training.nextHand();
          return;
        }
      }

      let action: Action | null = null;

      // Letter keys: H S D P R
      const letterMap: Record<string, Action> = { H: "H", S: "S", D: "D", P: "P", R: "R" };
      const upper = e.key.toUpperCase();
      if (upper in letterMap) {
        action = letterMap[upper];
      }

      // Numpad / number row: 1=Hit, 2=Stand, 3=Double, 4=Split, 5=Surrender
      const numMap: Record<string, Action> = { "1": "H", "2": "S", "3": "D", "4": "P", "5": "R" };
      if (e.key in numMap) {
        action = numMap[e.key];
      }

      // Left hand home row: A=Hit, S=Stand, D=Double, F=Split, G=Surrender
      const homeMap: Record<string, Action> = { a: "H", s: "S", d: "D", f: "P", g: "R" };
      if (e.key.toLowerCase() in homeMap) {
        action = homeMap[e.key.toLowerCase()];
      }

      if (action) {
        e.preventDefault();
        training.submitAnswer(action);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [training]);

  const handleCherryPickStart = useCallback(
    (combos: HandCombo[]) => {
      training.startDrilling(combos);
    },
    [training]
  );

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
        <ModeSelector mode={mode} onChange={(m) => { setMode(m); training.stopDrilling(); }} disabled={training.isDrilling} />
      </div>

      {!training.isDrilling && mode === "random" && strategy && (
        <div className="start-section">
          <button className="btn btn-primary btn-large" onClick={() => training.startDrilling()}>
            Start Random Drilling
          </button>
        </div>
      )}

      {!training.isDrilling && mode === "cherrypick" && strategy && (
        <StrategyGrid strategy={strategy} onStart={handleCherryPickStart} />
      )}

      {training.isDrilling && (
        <div className="drill-view">
          <ScoreTracker correct={training.score.correct} total={training.score.total} />

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
            <>
              <FeedbackBanner result={training.lastResult} />
              <div className="next-hint">Press <kbd>Space</kbd>, <kbd>Enter</kbd>, or any action key for next hand</div>
            </>
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
            <span><kbd>1</kbd><kbd>A</kbd> Hit</span>
            <span><kbd>2</kbd><kbd>S</kbd> Stand</span>
            <span><kbd>3</kbd><kbd>D</kbd> Double</span>
            <span><kbd>4</kbd><kbd>F</kbd> Split</span>
            <span><kbd>5</kbd><kbd>G</kbd> Surrender</span>
          </div>
        </div>
      )}
    </div>
  );
}
