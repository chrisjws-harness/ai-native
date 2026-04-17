import { HandCombo } from "../types";

export interface Card {
  rank: string;   // "A","2"..."10","J","Q","K"
  suit: "♠" | "♥" | "♦" | "♣";
  value: number;  // 1-10
}

const SUITS: Card["suit"][] = ["♠", "♥", "♦", "♣"];
const FACE_CARDS = ["J", "Q", "K"];

function randomSuit(): Card["suit"] {
  return SUITS[Math.floor(Math.random() * 4)];
}

function cardFromValue(v: number): Card {
  if (v === 1) return { rank: "A", suit: randomSuit(), value: 1 };
  if (v >= 2 && v <= 9) return { rank: String(v), suit: randomSuit(), value: v };
  // value 10: randomly pick 10, J, Q, K
  const faces = ["10", ...FACE_CARDS];
  return { rank: faces[Math.floor(Math.random() * 4)], suit: randomSuit(), value: 10 };
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Generate player cards that produce the given hand.
 */
function generatePlayerCards(hand: HandCombo): Card[] {
  if (hand.hand_type === "pair") {
    const rank = hand.player_value[0];
    if (rank === "A") {
      return [
        { rank: "A", suit: randomSuit(), value: 11 },
        { rank: "A", suit: randomSuit(), value: 11 },
      ];
    }
    if (rank === "T") {
      // Random 10-value cards
      return [cardFromValue(10), cardFromValue(10)];
    }
    const v = parseInt(rank);
    return [cardFromValue(v), cardFromValue(v)];
  }

  if (hand.hand_type === "soft") {
    // Ace + other card
    const otherVal = parseInt(hand.player_value.slice(1));
    return [
      { rank: "A", suit: randomSuit(), value: 11 },
      cardFromValue(otherVal),
    ];
  }

  // Hard total: pick 2 cards (or 3 if needed) that sum to the total, no aces as 11
  const total = parseInt(hand.player_value);

  if (total <= 20) {
    // Two cards, values 2-10 each
    const maxFirst = Math.min(10, total - 2);
    const minFirst = Math.max(2, total - 10);
    const first = randInt(minFirst, maxFirst);
    const second = total - first;
    return [cardFromValue(first), cardFromValue(second)];
  }

  // Hard 21: need 3 cards (can't make 21 with two cards 2-10)
  const a = randInt(2, 7);
  const b = randInt(Math.max(2, 11 - a), Math.min(10, 21 - a - 2));
  const c = 21 - a - b;
  return [cardFromValue(a), cardFromValue(b), cardFromValue(c)];
}

/**
 * Generate a dealer upcard.
 */
function generateDealerCard(upcard: string): Card {
  if (upcard === "A") return { rank: "A", suit: randomSuit(), value: 11 };
  const v = parseInt(upcard);
  return cardFromValue(v);
}

export interface DealtHand {
  playerCards: Card[];
  dealerCard: Card;
}

export function dealHand(hand: HandCombo): DealtHand {
  return {
    playerCards: generatePlayerCards(hand),
    dealerCard: generateDealerCard(hand.dealer_upcard),
  };
}
