import GridCell from "./GridCell";
import { HandCombo } from "../../types";

interface Props {
  title: string;
  handType: string;
  playerValues: string[];
  dealerCards: string[];
  strategy: Record<string, Record<string, string>>;
  selected: Set<string>;
  onToggle: (combo: HandCombo) => void;
}

function comboKey(handType: string, pv: string, dc: string): string {
  return `${handType}:${pv}:${dc}`;
}

export default function GridSection({
  title,
  handType,
  playerValues,
  dealerCards,
  strategy,
  selected,
  onToggle,
}: Props) {
  return (
    <div className="grid-section">
      <h3>{title}</h3>
      <table className="strategy-table">
        <thead>
          <tr>
            <th></th>
            {dealerCards.map((dc) => (
              <th key={dc}>{dc}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {playerValues.map((pv) => (
            <tr key={pv}>
              <th>{pv}</th>
              {dealerCards.map((dc) => {
                const action = strategy[pv]?.[dc] || "";
                const key = comboKey(handType, pv, dc);
                return (
                  <GridCell
                    key={dc}
                    action={action}
                    selected={selected.has(key)}
                    onToggle={() =>
                      onToggle({
                        hand_type: handType as HandCombo["hand_type"],
                        player_value: pv,
                        dealer_upcard: dc,
                      })
                    }
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
