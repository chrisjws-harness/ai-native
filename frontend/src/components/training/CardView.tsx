import { Card } from "../../utils/cards";

function isRed(suit: string): boolean {
  return suit === "♥" || suit === "♦";
}

export function CardFace({ card }: { card: Card }) {
  const red = isRed(card.suit);
  return (
    <div className={`card-face ${red ? "card-red" : "card-black"}`}>
      <div className="card-corner card-top-left">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit">{card.suit}</span>
      </div>
      <div className="card-center">{card.suit}</div>
      <div className="card-corner card-bottom-right">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit">{card.suit}</span>
      </div>
    </div>
  );
}

export function CardBack() {
  return <div className="card-face card-back" />;
}
