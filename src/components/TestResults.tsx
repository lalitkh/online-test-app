import { CheckCircle, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {passed ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <XCircle className="w-12 h-12 text-red-600" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>
          <p className="text-gray-600 mb-2">
            {passed ? 'You passed the test!' : 'You need more practice.'}
          </p>
          <p className="text-sm text-gray-500 mb-6">{subjectName}</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-indigo-600">{score}</p>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{incorrectCount}</p>
                <p className="text-sm text-gray-600">Incorrect</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{unansweredCount}</p>
                <p className="text-sm text-gray-600">Unanswered</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{percentage.toFixed(0)}%</p>
                <p className="text-sm text-gray-600">Score</p>
              </div>
            </div>
          </div>

          {wrongQuestions.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Incorrect Questions</h3>
              </div>
              <p className="text-sm text-red-700 mb-3">Click on question numbers to jump directly:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {wrongQuestions.map(({ index }) => (
                  <a
                    key={index}
                    href={`#question-${index}`}
                    className="w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold flex items-center justify-center border-2 border-red-300 transition-all"
                  >
                    {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6 mb-6 text-left max-h-96 overflow-y-auto">
            {questionsData.questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              const isUnanswered = userAnswer === undefined;

              let borderClass = 'bg-green-50 border-green-300';
              if (isUnanswered) {
                borderClass = 'bg-yellow-50 border-yellow-300';
              } else if (!isCorrect) {
                borderClass = 'bg-red-50 border-red-300';
              }

              let badgeClass = 'bg-green-200 text-green-800';
              let badgeText = 'Correct';
              if (isUnanswered) {
                badgeClass = 'bg-yellow-200 text-yellow-800';
                badgeText = 'Unanswered';
              } else if (!isCorrect) {
                badgeClass = 'bg-red-200 text-red-800';
                badgeText = 'Incorrect';
              }

              let numberBg = 'bg-green-500';
              if (isUnanswered) {
                numberBg = 'bg-yellow-500';
              } else if (!isCorrect) {
                numberBg = 'bg-red-500';
              }

              return (
                <div
                  key={q.id}
                  id={`question-${idx}`}
                  className={`border-2 rounded-xl p-5 scroll-mt-4 ${borderClass}`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${numberBg}`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      {q.topic && (
                        <span className="inline-block text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded mb-2">
                          {q.topic}
                        </span>
                      )}
                      <p
                        className="text-lg font-semibold text-gray-800"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(q.question) }}
                      />
                    </div>
                    <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                      {badgeText}
                    </div>
                  </div>

                  <div className="space-y-2 ml-11">
                    {q.options.map((option, optIdx) => {
                      const isUserAnswer = userAnswer === optIdx;
                      const isCorrectAnswer = q.correctAnswer === optIdx;

                      let optionClass = 'bg-white border-2 border-gray-200';
                      if (isCorrectAnswer) {
                        optionClass = 'bg-green-100 border-2 border-green-400';
                      } else if (isUserAnswer && !isCorrect) {
                        optionClass = 'bg-red-100 border-2 border-red-400';
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-lg ${optionClass}`}>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span
                              className="text-gray-800"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(option) }}
                            />
                            {isCorrectAnswer && (
                              <span className="ml-auto text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">
                                ✓ Correct Answer
                              </span>
                            )}
                            {isUserAnswer && !isCorrect && (
                              <span className="ml-auto text-xs font-semibold text-red-700 bg-red-200 px-2 py-1 rounded">
                                ✗ Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {isUnanswered && (
                    <div className="ml-11 mt-3 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">
                        ⚠ You did not answer this question
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
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Subjects
            </button>
            <button
              onClick={onRestart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
