import { ArrowLeft } from 'lucide-react';

interface ErrorScreenProps {
  error: string;
  onBack: () => void;
}

export default function ErrorScreen({ error, onBack }: ErrorScreenProps) {
  return (
    <div className="bg-fun flex items-center justify-center p-4">
      <div className="card-fun p-10 max-w-md text-center animate-pop-in">
        <div className="text-6xl mb-4">😵</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-500 font-medium mb-6">{error}</p>
        <button
          onClick={onBack}
          className="btn-primary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>
    </div>
  );
}
