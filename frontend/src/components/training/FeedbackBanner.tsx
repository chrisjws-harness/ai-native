import { CheckResult } from "../../types";

const ACTION_NAMES: Record<string, string> = {
  H: "Hit", S: "Stand", D: "Double", Ds: "Double (stand if can't)",
  P: "Split", Ph: "Split (hit if no DAS)", Rh: "Surrender (hit if can't)",
  Rs: "Surrender (stand if can't)", Rp: "Surrender (split if can't)",
};

export default function FeedbackBanner({ result }: { result: CheckResult }) {
  const actionName = ACTION_NAMES[result.correct_action] || result.correct_action;

  return (
    <div className={`feedback-banner ${result.correct ? "feedback-correct" : "feedback-incorrect"}`}>
      {result.correct ? (
        <span>Correct!</span>
      ) : (
        <span>
          Incorrect — correct play: <strong>{actionName}</strong>
        </span>
      )}
    </div>
  );
}
