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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <button
          onClick={onBack}
          className="mb-4 text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Subjects
        </button>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{subjectName}</h1>
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Total Questions:</span> {questionsData.questions.length}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Duration:</span> {Math.floor(questionsData.duration / 60)} minutes
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Passing Score:</span> {passingScore}%
            </p>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
            <p className="font-semibold text-yellow-800 mb-2">Instructions:</p>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Choose the best answer for each question</li>
              <li>• You can navigate between questions anytime</li>
              <li>• Test will auto-submit when time runs out</li>
              <li>• Click Submit when you're done</li>
            </ul>
          </div>
          <button
            onClick={onStart}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
}
