interface Props {
  correct: number;
  total: number;
}

export default function ScoreTracker({ correct, total }: Props) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="score-tracker">
      <span className="score-fraction">
        {correct} / {total}
      </span>
      {total > 0 && <span className="score-pct">({pct}%)</span>}
    </div>
  );
}
