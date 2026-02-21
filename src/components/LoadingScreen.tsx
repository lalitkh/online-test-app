interface LoadingScreenProps {
  subjectName: string;
}

export default function LoadingScreen({ subjectName }: LoadingScreenProps) {
  return (
    <div className="bg-fun flex items-center justify-center p-4">
      <div className="card-fun p-10 text-center animate-pop-in max-w-sm w-full">
        <div className="text-5xl mb-4 animate-bounce-slow">🧠</div>
        <div className="w-14 h-14 border-4 border-purple-200 border-t-candy-purple rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700 font-bold text-lg">Loading {subjectName}...</p>
        <p className="text-gray-400 font-medium text-sm mt-1">Getting your quiz ready!</p>
      </div>
    </div>
  );
}
