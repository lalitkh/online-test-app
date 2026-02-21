import { ArrowLeft } from 'lucide-react';
import { QuestionsData } from '../types';

interface TestWelcomeProps {
  subjectName: string;
  questionsData: QuestionsData;
  onStart: () => void;
  onBack: () => void;
}

export default function TestWelcome({ subjectName, questionsData, onStart, onBack }: TestWelcomeProps) {
  const passingScore = questionsData.passingScore ?? 90;

  return (
    <div className="bg-fun flex items-center justify-center p-4">
      <div className="card-fun p-8 max-w-2xl w-full animate-pop-in">
        <button
          onClick={onBack}
          className="mb-4 text-candy-purple hover:text-purple-700 font-bold inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Quizzes
        </button>
        <div className="text-center">
          <div className="text-5xl mb-3 animate-float">🚀</div>
          <h1 className="text-3xl font-black text-gray-800 mb-1">{subjectName}</h1>
          <p className="text-gray-400 font-semibold mb-6">Get ready to ace this quiz!</p>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-100">
              <div className="text-3xl mb-1">📝</div>
              <p className="text-2xl font-black text-purple-600">{questionsData.questions.length}</p>
              <p className="text-xs font-bold text-purple-400">Questions</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-100">
              <div className="text-3xl mb-1">⏱️</div>
              <p className="text-2xl font-black text-blue-600">{Math.floor(questionsData.duration / 60)}</p>
              <p className="text-xs font-bold text-blue-400">Minutes</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-100">
              <div className="text-3xl mb-1">🎯</div>
              <p className="text-2xl font-black text-green-600">{passingScore}%</p>
              <p className="text-xs font-bold text-green-400">To Pass</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-5 mb-6 text-left">
            <p className="font-bold text-amber-700 mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span> How it works:
            </p>
            <ul className="text-amber-600 text-sm space-y-2 font-medium">
              <li className="flex items-start gap-2"><span>✅</span> Pick the best answer for each question</li>
              <li className="flex items-start gap-2"><span>🔄</span> Jump between questions anytime</li>
              <li className="flex items-start gap-2"><span>⏰</span> Quiz auto-submits when time runs out</li>
              <li className="flex items-start gap-2"><span>🏁</span> Hit Submit when you're done!</li>
            </ul>
          </div>

          <button
            onClick={onStart}
            className="btn-primary text-lg px-12 py-4"
          >
            🚀 Let's Go!
          </button>
        </div>
      </div>
    </div>
  );
}
