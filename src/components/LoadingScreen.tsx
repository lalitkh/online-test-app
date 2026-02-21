import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  subjectName: string;
}

export default function LoadingScreen({ subjectName }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-700 font-medium">Loading {subjectName} questions...</p>
      </div>
    </div>
  );
}
