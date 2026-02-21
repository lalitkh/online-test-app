import { useEffect, useCallback } from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { QuestionsData } from '../types';
import { formatTime } from '../hooks/useTimer';
import { sanitizeHtml } from '../utils/sanitize';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = [
  { selected: 'border-candy-purple bg-purple-50 ring-2 ring-candy-purple/30', hover: 'hover:border-purple-300 hover:bg-purple-50/50' },
  { selected: 'border-candy-blue bg-blue-50 ring-2 ring-candy-blue/30', hover: 'hover:border-blue-300 hover:bg-blue-50/50' },
  { selected: 'border-candy-green bg-green-50 ring-2 ring-candy-green/30', hover: 'hover:border-green-300 hover:bg-green-50/50' },
  { selected: 'border-candy-orange bg-orange-50 ring-2 ring-candy-orange/30', hover: 'hover:border-orange-300 hover:bg-orange-50/50' },
];

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
  const isTimeLow = timeLeft < 60;

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
    <div className="bg-fun p-4">
      <div className="max-w-4xl mx-auto">
        <div className="card-fun animate-pop-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-candy-purple via-purple-500 to-candy-pink text-white p-5 rounded-t-3xl">
            <div className="flex justify-between items-center mb-3">
              <div>
                <button
                  onClick={onBack}
                  className="text-white/80 hover:text-white font-bold inline-flex items-center gap-2 mb-1 text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <h2 className="text-xl font-black">{subjectName}</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-bold text-white/80 bg-white/10 px-3 py-1.5 rounded-xl">
                  {answeredCount}/{totalCount} done
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-lg ${
                  isTimeLow
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-white text-purple-600'
                }`}>
                  <Clock className="w-5 h-5" />
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-candy-yellow to-candy-green h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Question */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-gradient-to-r from-candy-purple to-candy-pink text-white text-xs font-black px-3 py-1.5 rounded-full">
                  Q{currentQuestion + 1} of {totalCount}
                </span>
                {question.topic && (
                  <span className="text-xs font-bold px-3 py-1.5 bg-blue-100 text-blue-600 rounded-full">
                    {question.topic}
                  </span>
                )}
              </div>
              <h3
                className="text-xl font-bold text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.question) }}
              />
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {question.options.map((option, idx) => {
                const isSelected = answers[question.id] === idx;
                const colors = OPTION_COLORS[idx % OPTION_COLORS.length];
                return (
                  <button
                    key={idx}
                    onClick={() => onAnswer(question.id, idx)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected
                        ? `${colors.selected} scale-[1.01]`
                        : `border-gray-200 ${colors.hover}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                        isSelected ? 'bg-white text-purple-600 shadow-md' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {OPTION_LETTERS[idx]}
                      </span>
                      <span className="font-semibold text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizeHtml(option) }} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={onPrev}
                disabled={currentQuestion === 0}
                className="px-5 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>

              {currentQuestion === totalCount - 1 ? (
                <button
                  onClick={handleSubmitClick}
                  className="btn-success"
                >
                  🏁 Submit Quiz
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="btn-primary"
                >
                  Next →
                </button>
              )}
            </div>

            {/* Question navigation grid */}
            <div className="border-t-2 border-purple-50 pt-5">
              <p className="text-sm text-gray-500 mb-3 font-bold">Jump to question:</p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {questionsData.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => onGoToQuestion(idx)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      idx === currentQuestion
                        ? 'bg-gradient-to-br from-candy-purple to-candy-pink text-white shadow-md scale-110'
                        : answers[q.id] !== undefined
                          ? 'bg-green-100 text-green-600 border-2 border-green-200 hover:scale-105'
                          : 'bg-gray-100 text-gray-500 border-2 border-gray-200 hover:border-purple-300 hover:scale-105'
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
