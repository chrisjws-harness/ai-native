import { HandCombo } from "../types";

/**
 * Pick a random item from an array using weights.
 * weights[i] corresponds to combos[i].
 */
export function weightedPick(combos: HandCombo[], weights: number[]): HandCombo {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < combos.length; i++) {
    r -= weights[i];
    if (r <= 0) return combos[i];
  }
  return combos[combos.length - 1];
}
