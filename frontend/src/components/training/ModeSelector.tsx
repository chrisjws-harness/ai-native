import { TrainingMode } from "../../types";

interface Props {
  mode: TrainingMode;
  onChange: (mode: TrainingMode) => void;
  disabled: boolean;
}

export default function ModeSelector({ mode, onChange, disabled }: Props) {
  return (
    <div className="mode-selector">
      <button
        className={`btn btn-mode ${mode === "random" ? "btn-mode-active" : ""}`}
        onClick={() => onChange("random")}
        disabled={disabled}
      >
        Random
      </button>
      <button
        className={`btn btn-mode ${mode === "cherrypick" ? "btn-mode-active" : ""}`}
        onClick={() => onChange("cherrypick")}
        disabled={disabled}
      >
        Cherry Pick
      </button>
      <button
        className={`btn btn-mode ${mode === "adaptive" ? "btn-mode-active" : ""}`}
        onClick={() => onChange("adaptive")}
        disabled={disabled}
      >
        Adaptive
      </button>
    </div>
  );
}
