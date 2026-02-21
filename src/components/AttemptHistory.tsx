import { ArrowLeft } from 'lucide-react';
import { AttemptHistory } from '../types';

interface AttemptHistoryProps {
  attempts: AttemptHistory[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export default function AttemptHistoryPanel({ attempts, loading, error, onClose }: AttemptHistoryProps) {
  return (
    <div className="bg-fun flex items-center justify-center p-4">
      <div className="card-fun p-8 max-w-3xl w-full animate-pop-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onClose}
            className="text-candy-purple hover:text-purple-700 font-bold inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <span className="text-3xl">📊</span> My Quiz History
            </h2>
            <p className="text-sm text-gray-400 font-semibold">See how you've been doing!</p>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3 animate-bounce-slow">📚</div>
            <div className="w-10 h-10 border-4 border-purple-200 border-t-candy-purple rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 font-bold">Loading your history...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">😕</div>
            <p className="text-red-500 font-bold">{error}</p>
          </div>
        )}

        {!loading && !error && attempts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌟</div>
            <p className="font-bold text-gray-500 text-lg">No attempts yet!</p>
            <p className="text-gray-400 mt-1">Take a quiz to see your history here.</p>
          </div>
        )}

        {!loading && !error && attempts.length > 0 && (
          <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
            {attempts.map((attempt, i) => {
              const date = new Date(attempt.attemptedAt);
              const dateStr = date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const timeStr = date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={attempt.id ?? i}
                  className={`p-4 rounded-2xl border-2 transition-all animate-slide-up ${
                    attempt.passed
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                      : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
                  }`}
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0 ${
                        attempt.passed
                          ? 'bg-green-100 text-green-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {attempt.passed ? '🎉' : '💪'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 truncate">{attempt.subjectName}</p>
                        <p className="text-xs text-gray-400 font-medium">{dateStr} at {timeStr}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className={`text-lg font-black ${attempt.passed ? 'text-green-600' : 'text-orange-600'}`}>
                          {attempt.percentage.toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-400 font-bold">
                          {attempt.score}/{attempt.totalQuestions}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        attempt.passed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {attempt.passed ? 'PASSED' : 'RETRY'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 pt-4 border-t-2 border-purple-50">
          <button onClick={onClose} className="btn-secondary w-full">
            Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
}
