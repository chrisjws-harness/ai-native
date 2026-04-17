import { useState, useCallback, useRef } from "react";
import api from "../api/client";
import { StrategyMap, HandCombo, CheckResult, Action } from "../types";
import { DealtHand, dealHand } from "../utils/cards";

// Map composite strategy actions to the primary action
const PRIMARY_ACTION: Record<string, Action> = {
  H: "H", S: "S", D: "D", Ds: "D", P: "P", Ph: "P", Rh: "R", Rs: "R", Rp: "R",
};

function getAllCombos(strategy: StrategyMap): HandCombo[] {
  const combos: HandCombo[] = [];
  for (const handType of Object.keys(strategy)) {
    for (const playerValue of Object.keys(strategy[handType])) {
      for (const dealerUpcard of Object.keys(strategy[handType][playerValue])) {
        combos.push({
          hand_type: handType as HandCombo["hand_type"],
          player_value: playerValue,
          dealer_upcard: dealerUpcard,
        });
      }
    }
  }
  return combos;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function useTraining(rulesetId: number | null, strategy: StrategyMap | null) {
  const [currentHand, setCurrentHand] = useState<HandCombo | null>(null);
  const [dealt, setDealt] = useState<DealtHand | null>(null);
  const [lastResult, setLastResult] = useState<CheckResult | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isDrilling, setIsDrilling] = useState(false);
  const selectedCombosRef = useRef<HandCombo[] | null>(null);

  const checkLocally = useCallback(
    (hand: HandCombo, userAction: Action): CheckResult => {
      if (!strategy) throw new Error("No strategy loaded");
      const raw = strategy[hand.hand_type]?.[hand.player_value]?.[hand.dealer_upcard];
      const correctPrimary = PRIMARY_ACTION[raw] || raw;
      return {
        correct: userAction === correctPrimary,
        correct_action: raw,
        correct_primary: correctPrimary,
        user_action: userAction,
      };
    },
    [strategy]
  );

  const dealNewHand = useCallback((pool: HandCombo[]) => {
    const hand = pickRandom(pool);
    setCurrentHand(hand);
    setDealt(dealHand(hand));
    setLastResult(null);
  }, []);

  const nextHand = useCallback(() => {
    if (!strategy) return;
    const pool = selectedCombosRef.current || getAllCombos(strategy);
    if (pool.length === 0) return;
    dealNewHand(pool);
  }, [strategy, dealNewHand]);

  const startDrilling = useCallback(
    (selectedCombos?: HandCombo[]) => {
      selectedCombosRef.current = selectedCombos || null;
      setScore({ correct: 0, total: 0 });
      setLastResult(null);
      setIsDrilling(true);
      if (!strategy) return;
      const pool = selectedCombos || getAllCombos(strategy);
      if (pool.length === 0) return;
      dealNewHand(pool);
    },
    [strategy, dealNewHand]
  );

  const stopDrilling = useCallback(() => {
    setIsDrilling(false);
    setCurrentHand(null);
    setDealt(null);
    setLastResult(null);
  }, []);

  const submitAnswer = useCallback(
    (userAction: Action) => {
      if (!currentHand || !rulesetId || !strategy) return;

      const result = checkLocally(currentHand, userAction);
      setLastResult(result);
      setScore((s) => ({
        correct: s.correct + (result.correct ? 1 : 0),
        total: s.total + 1,
      }));

      // Fire-and-forget log to server
      api.post("/training/check", {
        ruleset_id: rulesetId,
        hand_type: currentHand.hand_type,
        player_value: currentHand.player_value,
        dealer_upcard: currentHand.dealer_upcard,
        user_action: userAction,
      }).catch(() => {});
    },
    [currentHand, rulesetId, strategy, checkLocally]
  );

  return {
    currentHand,
    dealt,
    lastResult,
    score,
    isDrilling,
    startDrilling,
    stopDrilling,
    submitAnswer,
    nextHand,
  };
}
