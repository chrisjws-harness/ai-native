import { useState, useMemo, useCallback } from "react";
import GridSection from "./GridSection";
import GridControls from "./GridControls";
import { StrategyMap, HandCombo } from "../../types";

const DEALER_CARDS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"];
const HARD_VALUES = ["5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"];
const SOFT_VALUES = ["A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"];
const PAIR_VALUES = ["22", "33", "44", "55", "66", "77", "88", "99", "TT", "AA"];

function comboKey(handType: string, pv: string, dc: string): string {
  return `${handType}:${pv}:${dc}`;
}

function getAllKeys(strategy: StrategyMap): string[] {
  const keys: string[] = [];
  for (const handType of Object.keys(strategy)) {
    for (const pv of Object.keys(strategy[handType])) {
      for (const dc of Object.keys(strategy[handType][pv])) {
        keys.push(comboKey(handType, pv, dc));
      }
    }
  }
  return keys;
}

interface Props {
  strategy: StrategyMap;
  onStart: (combos: HandCombo[]) => void;
}

export default function StrategyGrid({ strategy, onStart }: Props) {
  const allKeys = useMemo(() => getAllKeys(strategy), [strategy]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(allKeys));

  const toggleCombo = useCallback((combo: HandCombo) => {
    const key = comboKey(combo.hand_type, combo.player_value, combo.dealer_upcard);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const selectAll = () => setSelected(new Set(allKeys));
  const deselectAll = () => setSelected(new Set());

  const handleStart = () => {
    const combos: HandCombo[] = [];
    for (const key of selected) {
      const [handType, pv, dc] = key.split(":");
      combos.push({ hand_type: handType as HandCombo["hand_type"], player_value: pv, dealer_upcard: dc });
    }
    onStart(combos);
  };

  return (
    <div className="strategy-grid">
      <GridControls
        selectedCount={selected.size}
        totalCount={allKeys.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onStart={handleStart}
      />
      <GridSection
        title="Hard Totals"
        handType="hard"
        playerValues={HARD_VALUES}
        dealerCards={DEALER_CARDS}
        strategy={strategy.hard || {}}
        selected={selected}
        onToggle={toggleCombo}
      />
      <GridSection
        title="Soft Totals"
        handType="soft"
        playerValues={SOFT_VALUES}
        dealerCards={DEALER_CARDS}
        strategy={strategy.soft || {}}
        selected={selected}
        onToggle={toggleCombo}
      />
      <GridSection
        title="Pairs"
        handType="pair"
        playerValues={PAIR_VALUES}
        dealerCards={DEALER_CARDS}
        strategy={strategy.pair || {}}
        selected={selected}
        onToggle={toggleCombo}
      />
    </div>
  );
}
