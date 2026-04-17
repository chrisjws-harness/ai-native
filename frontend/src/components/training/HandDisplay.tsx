import { DealtHand } from "../../utils/cards";
import { CardFace, CardBack } from "./CardView";

interface Props {
  dealt: DealtHand;
}

export default function HandDisplay({ dealt }: Props) {
  return (
    <div className="hand-display">
      <div className="hand-section">
        <div className="hand-label">Your Hand</div>
        <div className="card-row">
          {dealt.playerCards.map((c, i) => (
            <CardFace key={i} card={c} />
          ))}
        </div>
      </div>
      <div className="hand-vs">vs</div>
      <div className="hand-section">
        <div className="hand-label">Dealer Shows</div>
        <div className="card-row">
          <CardFace card={dealt.dealerCard} />
          <CardBack />
        </div>
      </div>
    </div>
  );
}
