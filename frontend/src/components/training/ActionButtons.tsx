import { Action, HandCombo } from "../../types";

interface Props {
  hand: HandCombo;
  hasSurrender: boolean;
  onAction: (action: Action) => void;
  disabled: boolean;
}

const ACTIONS: { key: Action; label: string; num: string; home: string }[] = [
  { key: "H", label: "Hit",       num: "4", home: "A" },
  { key: "S", label: "Stand",     num: "5", home: "S" },
  { key: "D", label: "Double",    num: "6", home: "D" },
  { key: "P", label: "Split",     num: "0", home: "F" },
  { key: "R", label: "Surrender", num: "",  home: "G" },
];

export default function ActionButtons({ hand, hasSurrender, onAction, disabled }: Props) {
  const showSplit = hand.hand_type === "pair";
  const showSurrender = hasSurrender;

  return (
    <div className="action-buttons">
      {ACTIONS.filter((a) => {
        if (a.key === "P" && !showSplit) return false;
        if (a.key === "R" && !showSurrender) return false;
        return true;
      }).map((a) => (
        <button
          key={a.key}
          className={`btn btn-action btn-action-${a.key.toLowerCase()}`}
          onClick={() => onAction(a.key)}
          disabled={disabled}
        >
          {a.label} {a.num && <kbd>{a.num}</kbd>}
        </button>
      ))}
    </div>
  );
}
