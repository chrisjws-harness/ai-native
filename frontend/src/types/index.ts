export interface User {
  id: number;
  username: string;
}

export interface Ruleset {
  id: number;
  name: string;
  deck_count: number;
  dealer_hits_s17: boolean;
  das_allowed: boolean;
  surrender: string;
  description: string;
}

export type HandType = "hard" | "soft" | "pair";
export type Action = "H" | "S" | "D" | "P" | "R";

// strategy[hand_type][player_value][dealer_upcard] = correct_action
export type StrategyMap = Record<string, Record<string, Record<string, string>>>;

export interface StrategyResponse {
  ruleset: { id: number; name: string; surrender: string };
  strategy: StrategyMap;
}

export interface HandCombo {
  hand_type: HandType;
  player_value: string;
  dealer_upcard: string;
}

export interface CheckResult {
  correct: boolean;
  correct_action: string;
  correct_primary: string;
  user_action: string;
}

export type TrainingMode = "random" | "cherrypick";
