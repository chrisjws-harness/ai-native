import { DealtHand } from "../../utils/cards";
import { CardFace, CardBack } from "./CardView";

interface Props {
  dealt: DealtHand;
}

export default function HandDisplay({ dealt }: Props) {
  return (
    <div className="felt-table">
      <div className="table-edge table-edge-top" />
      <div className="felt-surface">
        {/* Dealer at top */}
        <div className="table-position dealer-position">
          <div className="position-label">DEALER</div>
          <div className="card-row">
            <CardFace card={dealt.dealerCard} />
            <CardBack />
          </div>
        </div>

        <div className="table-divider">
          <div className="divider-line" />
          <span className="divider-text">INSURANCE PAYS 2 TO 1</span>
          <div className="divider-line" />
        </div>

        {/* Player at bottom */}
        <div className="table-position player-position">
          <div className="card-row">
            {dealt.playerCards.map((c, i) => (
              <CardFace key={i} card={c} />
            ))}
          </div>
          <div className="position-label">YOUR HAND</div>
        </div>
      </div>
      <div className="table-edge table-edge-bottom" />
    </div>
  );
}
