import { RotateCcw, ArrowLeft } from 'lucide-react';
import { QuestionsData } from '../types';
import { sanitizeHtml } from '../utils/sanitize';

interface TestResultsProps {
  subjectName: string;
  questionsData: QuestionsData;
  answers: Record<number, number>;
  score: number;
  onRestart: () => void;
  onBack: () => void;
}

export default function TestResults({
  subjectName,
  questionsData,
  answers,
  score,
  onRestart,
  onBack,
}: TestResultsProps) {
  const totalQuestions = questionsData.questions.length;
  const percentage = (score / totalQuestions) * 100;
  const passingScore = questionsData.passingScore ?? 90;
  const passed = percentage >= passingScore;

  const unansweredCount = questionsData.questions.filter(
    (q) => answers[q.id] === undefined
  ).length;
  const incorrectCount = totalQuestions - score - unansweredCount;

  const wrongQuestions = questionsData.questions
    .map((q, idx) => ({ question: q, index: idx }))
    .filter(({ question }) => answers[question.id] !== question.correctAnswer);

  return (
    <div className="bg-fun flex items-center justify-center p-4">
      <div className="card-fun p-8 max-w-4xl w-full animate-pop-in">
        <div className="text-center">
          {/* Result emoji & message */}
          <div className="text-6xl mb-3 animate-confetti">
            {passed ? '🎉' : '💪'}
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-1">
            {passed ? 'Amazing Job!' : 'Keep Going!'}
          </h2>
          <p className="text-gray-500 font-semibold mb-1">
            {passed ? 'You crushed this quiz!' : "Practice makes perfect — you'll get it next time!"}
          </p>
          <p className="text-sm text-gray-400 font-bold mb-6">{subjectName}</p>

          {/* Score circle + stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
            {/* Big score circle */}
            <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 shadow-lg ${
              passed
                ? 'border-candy-green bg-gradient-to-br from-green-50 to-emerald-50'
                : 'border-candy-orange bg-gradient-to-br from-orange-50 to-amber-50'
            }`}>
              <span className={`text-4xl font-black ${passed ? 'text-green-600' : 'text-orange-600'}`}>
                {percentage.toFixed(0)}%
              </span>
              <span className={`text-xs font-bold ${passed ? 'text-green-400' : 'text-orange-400'}`}>
                {passed ? 'PASSED' : 'TRY AGAIN'}
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-100 text-center">
                <p className="text-2xl font-black text-green-600">{score}</p>
                <p className="text-xs font-bold text-green-400">Correct</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 border-2 border-red-100 text-center">
                <p className="text-2xl font-black text-red-500">{incorrectCount}</p>
                <p className="text-xs font-bold text-red-400">Wrong</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border-2 border-amber-100 text-center">
                <p className="text-2xl font-black text-amber-500">{unansweredCount}</p>
                <p className="text-xs font-bold text-amber-400">Skipped</p>
              </div>
            </div>
          </div>

          {/* Wrong question shortcuts */}
          {wrongQuestions.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
              <p className="font-bold text-red-600 mb-3 flex items-center justify-center gap-2">
                <span>🔍</span> Review these questions:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {wrongQuestions.map(({ index }) => (
                  <a
                    key={index}
                    href={`#question-${index}`}
                    className="w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 font-black flex items-center justify-center border-2 border-red-200 transition-all hover:scale-110"
                  >
                    {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Detailed review */}
          <div className="space-y-4 mb-6 text-left max-h-[28rem] overflow-y-auto pr-1">
            {questionsData.questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              const isUnanswered = userAnswer === undefined;

              let borderClass = 'bg-green-50/50 border-green-200';
              let emoji = '✅';
              let badgeClass = 'bg-green-100 text-green-700';
              let badgeText = 'Correct';
              let numberBg = 'bg-gradient-to-br from-green-400 to-emerald-500';

              if (isUnanswered) {
                borderClass = 'bg-amber-50/50 border-amber-200';
                emoji = '⏭️';
                badgeClass = 'bg-amber-100 text-amber-700';
                badgeText = 'Skipped';
                numberBg = 'bg-gradient-to-br from-amber-400 to-yellow-500';
              } else if (!isCorrect) {
                borderClass = 'bg-red-50/50 border-red-200';
                emoji = '❌';
                badgeClass = 'bg-red-100 text-red-700';
                badgeText = 'Wrong';
                numberBg = 'bg-gradient-to-br from-red-400 to-pink-500';
              }

              return (
                <div
                  key={q.id}
                  id={`question-${idx}`}
                  className={`border-2 rounded-2xl p-5 scroll-mt-4 ${borderClass}`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md ${numberBg}`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      {q.topic && (
                        <span className="inline-block text-xs font-bold px-2 py-1 bg-blue-100 text-blue-600 rounded-lg mb-2">
                          {q.topic}
                        </span>
                      )}
                      <p
                        className="text-base font-bold text-gray-800"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(q.question) }}
                      />
                    </div>
                    <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${badgeClass}`}>
                      {emoji} {badgeText}
                    </div>
                  </div>

                  <div className="space-y-2 ml-11">
                    {q.options.map((option, optIdx) => {
                      const isUserAnswer = userAnswer === optIdx;
                      const isCorrectAnswer = q.correctAnswer === optIdx;

                      let optionClass = 'bg-white border-2 border-gray-100';
                      if (isCorrectAnswer) {
                        optionClass = 'bg-green-100 border-2 border-green-300';
                      } else if (isUserAnswer && !isCorrect) {
                        optionClass = 'bg-red-100 border-2 border-red-300';
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-xl ${optionClass}`}>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-gray-500 text-sm">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span
                              className="text-gray-700 font-medium"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(option) }}
                            />
                            {isCorrectAnswer && (
                              <span className="ml-auto text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded-lg whitespace-nowrap">
                                ✓ Correct
                              </span>
                            )}
                            {isUserAnswer && !isCorrect && (
                              <span className="ml-auto text-xs font-bold text-red-700 bg-red-200 px-2 py-1 rounded-lg whitespace-nowrap">
                                ✗ Your pick
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {isUnanswered && (
                    <div className="ml-11 mt-3 p-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
                      <p className="text-sm font-bold text-amber-600">
                        ⏭️ You skipped this one
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onBack}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              All Quizzes
            </button>
            <button
              onClick={onRestart}
              className="btn-primary inline-flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
