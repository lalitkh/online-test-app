import { XCircle, ArrowLeft } from 'lucide-react';

interface ErrorScreenProps {
  error: string;
  questionsFile: string;
  onBack: () => void;
}

export default function ErrorScreen({ error, questionsFile, onBack }: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Questions</h2>
        <p className="text-gray-600 mb-2">{error}</p>
        <p className="text-sm text-gray-500 mb-6">Make sure {questionsFile} exists in the public folder</p>
        <button
          onClick={onBack}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Subjects
        </button>
      </div>
    </div>
  );
}
