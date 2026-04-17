interface Props {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onStart: () => void;
}

export default function GridControls({ selectedCount, totalCount, onSelectAll, onDeselectAll, onStart }: Props) {
  return (
    <div className="grid-controls">
      <button className="btn" onClick={onSelectAll}>Select All</button>
      <button className="btn" onClick={onDeselectAll}>Deselect All</button>
      <span className="grid-count">{selectedCount} / {totalCount} selected</span>
      <button
        className="btn btn-primary"
        onClick={onStart}
        disabled={selectedCount === 0}
      >
        Start Drilling
      </button>
    </div>
  );
}
