import { useEffect, useCallback } from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { QuestionsData } from '../types';
import { formatTime } from '../hooks/useTimer';
import { sanitizeHtml } from '../utils/sanitize';

interface TestPageProps {
  subjectName: string;
  questionsData: QuestionsData;
  currentQuestion: number;
  answers: Record<number, number>;
  timeLeft: number;
  onAnswer: (questionId: number, answerIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onGoToQuestion: (index: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function TestPage({
  subjectName,
  questionsData,
  currentQuestion,
  answers,
  timeLeft,
  onAnswer,
  onNext,
  onPrev,
  onGoToQuestion,
  onSubmit,
  onBack,
}: TestPageProps) {
  const question = questionsData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questionsData.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const totalCount = questionsData.questions.length;

  // Warn before navigating away during test
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Keyboard navigation: A/B/C/D for answers, arrow keys for prev/next
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!question) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        const idx = key.charCodeAt(0) - 65;
        if (idx < question.options.length) {
          onAnswer(question.id, idx);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        onPrev();
      }
    },
    [question, onAnswer, onNext, onPrev]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSubmitClick = () => {
    const unanswered = totalCount - answeredCount;
    if (unanswered > 0) {
      const confirmed = window.confirm(
        `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Are you sure you want to submit?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm('Are you sure you want to submit the test?');
      if (!confirmed) return;
    }
    onSubmit();
  };

  if (!question) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 text-white p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <button
                  onClick={onBack}
                  className="text-white/80 hover:text-white font-medium inline-flex items-center gap-2 mb-2 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <h2 className="text-2xl font-bold">{subjectName}</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-indigo-200">
                  {answeredCount}/{totalCount} answered
                </div>
                <div className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold">
                  <Clock className="w-5 h-5" />
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
            <div className="w-full bg-indigo-400 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <p className="text-sm text-gray-500">Question {currentQuestion + 1} of {totalCount}</p>
                {question.topic && (
                  <span className="text-xs font-semibold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                    {question.topic}
                  </span>
                )}
              </div>
              <h3
                className="text-xl font-semibold text-gray-800"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.question) }}
              />
            </div>

            <div className="space-y-3 mb-8">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => onAnswer(question.id, idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[question.id] === idx
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium text-gray-700">{String.fromCharCode(65 + idx)}.</span>{' '}
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(option) }} />
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6">
              <button
                onClick={onPrev}
                disabled={currentQuestion === 0}
                className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentQuestion === totalCount - 1 ? (
                <button
                  onClick={handleSubmitClick}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
                >
                  Submit Test
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Next
                </button>
              )}
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-3">Question Navigation:</p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {questionsData.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => onGoToQuestion(idx)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      idx === currentQuestion
                        ? 'bg-indigo-600 text-white'
                        : answers[q.id] !== undefined
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
