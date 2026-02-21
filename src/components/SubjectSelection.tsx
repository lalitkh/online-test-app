import { Subject } from '../types';

interface SubjectSelectionProps {
  subjects: Subject[];
  onSelect: (subject: Subject) => void;
}

export default function SubjectSelection({ subjects, onSelect }: SubjectSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Online Test</h1>
        </div>

        <div className="space-y-3">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => onSelect(subject)}
              className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600">
                    {subject.name}
                  </h3>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
