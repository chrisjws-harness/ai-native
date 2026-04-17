interface Props {
  action: string;
  selected: boolean;
  onToggle: () => void;
}

const ACTION_COLORS: Record<string, string> = {
  H: "cell-hit",
  S: "cell-stand",
  D: "cell-double",
  Ds: "cell-double",
  P: "cell-split",
  Ph: "cell-split",
  Rh: "cell-surrender",
  Rs: "cell-surrender",
  Rp: "cell-surrender",
};

export default function GridCell({ action, selected, onToggle }: Props) {
  const colorClass = ACTION_COLORS[action] || "";

  return (
    <td
      className={`grid-cell ${colorClass} ${selected ? "cell-selected" : "cell-deselected"}`}
      onClick={onToggle}
      title={action}
    >
      {action}
    </td>
  );
}
