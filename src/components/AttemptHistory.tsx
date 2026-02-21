import { useState } from 'react';
import { ArrowLeft, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { AttemptHistory } from '../types';
import { SubjectStats } from '../hooks/useAttemptHistory';

interface AttemptHistoryProps {
  loading: boolean;
  error: string | null;
  subjectStats: SubjectStats[];
  globalStats: { totalAttempts: number; totalSubjects: number; avgPercentage: number; passRate: number } | null;
  onDeleteAttempt: (id: string) => void;
  onDeleteSubjectAttempts: (subjectId: string) => void;
  onClose: () => void;
}

export default function AttemptHistoryPanel({
  loading,
  error,
  subjectStats,
  globalStats,
  onDeleteAttempt,
  onDeleteSubjectAttempts,
  onClose,
}: AttemptHistoryProps) {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState<string | null>(null);

  function toggleSubject(id: string) {
    setExpandedSubject((prev) => (prev === id ? null : id));
    setConfirmDelete(null);
    setConfirmDeleteAll(null);
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="bg-fun flex items-center justify-center p-4">
      <div className="card-fun p-6 sm:p-8 max-w-3xl w-full animate-pop-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onClose}
            className="text-candy-purple hover:text-purple-700 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <span className="text-3xl">📊</span> Dashboard
            </h2>
            <p className="text-sm text-gray-400 font-semibold">Your quiz performance at a glance</p>
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

        {!loading && !error && !globalStats && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌟</div>
            <p className="font-bold text-gray-500 text-lg">No attempts yet!</p>
            <p className="text-gray-400 mt-1">Take a quiz to see your stats here.</p>
          </div>
        )}

        {!loading && !error && globalStats && (
          <div className="space-y-5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
            {/* Global stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-100 text-center">
                <p className="text-2xl font-black text-candy-purple">{globalStats.totalAttempts}</p>
                <p className="text-xs font-bold text-purple-400">Total Attempts</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-100 text-center">
                <p className="text-2xl font-black text-blue-600">{globalStats.totalSubjects}</p>
                <p className="text-xs font-bold text-blue-400">Subjects</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border-2 border-amber-100 text-center">
                <p className="text-2xl font-black text-amber-600">{globalStats.avgPercentage.toFixed(0)}%</p>
                <p className="text-xs font-bold text-amber-400">Avg Score</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-100 text-center">
                <p className="text-2xl font-black text-green-600">{globalStats.passRate.toFixed(0)}%</p>
                <p className="text-xs font-bold text-green-400">Pass Rate</p>
              </div>
            </div>

            {/* Per-subject accordion */}
            <div className="space-y-3">
              {subjectStats.map((stat) => {
                const isOpen = expandedSubject === stat.subjectId;
                return (
                  <div key={stat.subjectId} className="border-2 border-purple-100 rounded-2xl overflow-hidden">
                    {/* Subject header */}
                    <button
                      onClick={() => toggleSubject(stat.subjectId)}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 hover:from-purple-50 hover:to-pink-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-xl">{stat.passCount > stat.failCount ? '🎯' : '📝'}</div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 truncate">{stat.subjectName}</p>
                          <p className="text-xs text-gray-400 font-medium">
                            {stat.totalAttempts} attempt{stat.totalAttempts !== 1 ? 's' : ''} · {stat.passCount} passed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Mini stats */}
                        <div className="hidden sm:flex items-center gap-2 text-xs font-bold">
                          <span className="px-2 py-1 rounded-lg bg-red-50 text-red-500">Min {stat.minPercentage.toFixed(0)}%</span>
                          <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-600">Avg {stat.avgPercentage.toFixed(0)}%</span>
                          <span className="px-2 py-1 rounded-lg bg-green-50 text-green-600">Max {stat.maxPercentage.toFixed(0)}%</span>
                        </div>
                        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isOpen && (
                      <div className="border-t-2 border-purple-50">
                        {/* Stats row (visible on mobile too) */}
                        <div className="grid grid-cols-3 gap-2 p-4 bg-white/50">
                          <div className="text-center">
                            <p className="text-lg font-black text-red-500">{stat.minPercentage.toFixed(0)}%</p>
                            <p className="text-[10px] font-bold text-gray-400">MIN</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-black text-amber-600">{stat.avgPercentage.toFixed(0)}%</p>
                            <p className="text-[10px] font-bold text-gray-400">AVG</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-black text-green-600">{stat.maxPercentage.toFixed(0)}%</p>
                            <p className="text-[10px] font-bold text-gray-400">MAX</p>
                          </div>
                        </div>

                        {/* Clear all button */}
                        <div className="px-4 pb-2 flex justify-end">
                          {confirmDeleteAll === stat.subjectId ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-red-500">Delete all history for this subject?</span>
                              <button
                                onClick={() => { onDeleteSubjectAttempts(stat.subjectId); setConfirmDeleteAll(null); setExpandedSubject(null); }}
                                className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition-colors"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmDeleteAll(null)}
                                className="text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteAll(stat.subjectId)}
                              className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" /> Clear All
                            </button>
                          )}
                        </div>

                        {/* Attempt list */}
                        <div className="px-4 pb-4 space-y-2">
                          {stat.attempts.map((attempt, i) => (
                            <div
                              key={attempt.id ?? i}
                              className={`flex items-center justify-between p-3 rounded-xl border-2 ${
                                attempt.passed
                                  ? 'bg-green-50/50 border-green-100'
                                  : 'bg-orange-50/50 border-orange-100'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-sm">{attempt.passed ? '✅' : '❌'}</span>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-700">
                                    {attempt.score}/{attempt.totalQuestions}
                                    <span className={`ml-2 ${attempt.passed ? 'text-green-600' : 'text-orange-600'}`}>
                                      ({attempt.percentage.toFixed(0)}%)
                                    </span>
                                  </p>
                                  <p className="text-[11px] text-gray-400 font-medium">
                                    {formatDate(attempt.attemptedAt)} at {formatTime(attempt.attemptedAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  attempt.passed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {attempt.passed ? 'PASS' : 'FAIL'}
                                </span>
                                {confirmDelete === attempt.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => { if (attempt.id) onDeleteAttempt(attempt.id); setConfirmDelete(null); }}
                                      className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded transition-colors"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setConfirmDelete(null)}
                                      className="text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded transition-colors"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmDelete(attempt.id ?? null)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                                    title="Delete this attempt"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
