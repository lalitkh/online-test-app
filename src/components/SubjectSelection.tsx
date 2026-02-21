import { Subject } from '../types';
import { getTestVisibility } from '../hooks/useAdminSettings';
import { Settings } from 'lucide-react';

interface SubjectSelectionProps {
  subjects: Subject[];
  onSelect: (subject: Subject) => void;
  onAdminOpen: () => void;
  onHistoryOpen?: () => void;
}

const CARD_COLORS = [
  'from-purple-400 to-pink-400',
  'from-blue-400 to-cyan-400',
  'from-green-400 to-emerald-400',
  'from-orange-400 to-yellow-400',
  'from-pink-400 to-rose-400',
  'from-indigo-400 to-blue-400',
  'from-teal-400 to-green-400',
  'from-amber-400 to-orange-400',
];

const CARD_EMOJIS = ['📚', '🧠', '🔬', '🎯', '🌟', '📝', '💡', '🎓'];

export default function SubjectSelection({ subjects, onSelect, onAdminOpen, onHistoryOpen }: SubjectSelectionProps) {
  const visibleSubjects = subjects.filter((s) => getTestVisibility(s.id, s.isActive ?? true));

  return (
    <div className="bg-fun flex items-center justify-center p-4">
      <div className="card-fun p-8 max-w-3xl w-full animate-pop-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 animate-bounce-slow">🏆</div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-candy-purple via-candy-pink to-candy-orange bg-clip-text text-transparent">
            Quiz Champ!
          </h1>
          <p className="text-gray-500 mt-2 font-semibold">Pick a quiz and show what you know!</p>
        </div>

        {visibleSubjects.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">📭</div>
            <p className="font-bold text-gray-500 text-lg">No quizzes available right now.</p>
            <p className="text-gray-400 mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visibleSubjects.map((subject, i) => (
              <button
                key={subject.id}
                onClick={() => onSelect(subject)}
                className="group relative text-left p-5 rounded-2xl border-2 border-transparent bg-white
                           hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200
                           animate-slide-up"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${CARD_COLORS[i % CARD_COLORS.length]} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CARD_COLORS[i % CARD_COLORS.length]} flex items-center justify-center text-2xl shadow-md group-hover:animate-wiggle`}>
                    {CARD_EMOJIS[i % CARD_EMOJIS.length]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors truncate">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium">
                      {Math.floor(subject.duration / 60)} min
                    </p>
                  </div>
                  <div className="text-gray-300 group-hover:text-candy-purple group-hover:translate-x-1 transition-all text-xl font-bold">
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer buttons */}
        <div className="mt-8 pt-4 border-t-2 border-purple-50 flex items-center justify-between">
          {onHistoryOpen && (
            <button
              onClick={onHistoryOpen}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-600 transition-colors px-3 py-2 rounded-xl hover:bg-purple-50 font-semibold"
            >
              <span className="text-lg">📊</span>
              My History
            </button>
          )}
          {!onHistoryOpen && <span />}
          <button
            onClick={onAdminOpen}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-600 transition-colors px-3 py-2 rounded-xl hover:bg-purple-50"
            aria-label="Open admin panel"
          >
            <Settings className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}
