import { SavedAnswer } from "@/lib/test-results";

interface AnswerReviewProps {
  answers: SavedAnswer[];
}

function getQuestionStatus(answer: SavedAnswer): "correct" | "wrong" | "unanswered" {
  if (answer.selectedAnswerIndex === null) return "unanswered";
  if (answer.selectedAnswerIndex === answer.correctAnswerIndex) return "correct";
  return "wrong";
}

const statusConfig = {
  correct: {
    label: "Správně",
    badge: "bg-green-600/20 text-green-400",
    icon: "✓",
    ring: "ring-green-500/50",
  },
  wrong: {
    label: "Špatně",
    badge: "bg-red-600/20 text-red-400",
    icon: "✗",
    ring: "ring-red-500/50",
  },
  unanswered: {
    label: "Nezodpovězeno",
    badge: "bg-amber-600/20 text-amber-400",
    icon: "?",
    ring: "ring-amber-500/50",
  },
};

export default function AnswerReview({ answers }: AnswerReviewProps) {
  const wrongCount = answers.filter((a) => getQuestionStatus(a) === "wrong").length;
  const unansweredCount = answers.filter((a) => getQuestionStatus(a) === "unanswered").length;

  return (
    <div className="space-y-4">
      {(wrongCount > 0 || unansweredCount > 0) && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-green-600/20 px-3 py-1 text-green-400">
            {answers.length - wrongCount - unansweredCount} správně
          </span>
          {wrongCount > 0 && (
            <span className="rounded-full bg-red-600/20 px-3 py-1 text-red-400">
              {wrongCount} špatně
            </span>
          )}
          {unansweredCount > 0 && (
            <span className="rounded-full bg-amber-600/20 px-3 py-1 text-amber-400">
              {unansweredCount} nezodpovězeno
            </span>
          )}
        </div>
      )}

      {answers.map((answer, index) => {
        const status = getQuestionStatus(answer);
        const config = statusConfig[status];

        return (
          <div
            key={answer.questionId}
            className={`rounded-2xl bg-slate-800 p-4 ring-1 sm:p-5 ${config.ring}`}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-400">
                Otázka {index + 1}
              </p>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}
              >
                {config.icon} {config.label}
              </span>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-white sm:text-base">
              {answer.questionText}
            </p>

            <div className="space-y-2">
              {answer.options.map((option, optionIndex) => {
                const isCorrect = optionIndex === answer.correctAnswerIndex;
                const isSelected = optionIndex === answer.selectedAnswerIndex;

                let optionClass =
                  "border-slate-600 bg-slate-900/50 text-slate-300";

                if (isCorrect) {
                  optionClass = "border-green-500 bg-green-600/20 text-green-100";
                } else if (isSelected) {
                  optionClass = "border-red-500 bg-red-600/20 text-red-100";
                }

                return (
                  <div
                    key={optionIndex}
                    className={`flex items-start gap-3 rounded-xl border-2 p-3 text-sm ${optionClass}`}
                  >
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="leading-relaxed">{option}</span>
                    {isCorrect && (
                      <span className="ml-auto shrink-0 text-xs font-semibold text-green-400">
                        správná
                      </span>
                    )}
                    {isSelected && !isCorrect && (
                      <span className="ml-auto shrink-0 text-xs font-semibold text-red-400">
                        vaše
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
