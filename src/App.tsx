import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RotateCcw, Loader2, ArrowLeft } from 'lucide-react';

// Declare MathJax global
declare global {
  interface Window {
    MathJax: any;
  }
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  topic?: string;
}

interface QuestionsData {
  title: string;
  duration: number;
  questions: Question[];
}

interface Subject {
  id: string;
  name: string;
  questionsFile: string;
  icon: string;
  color: string;
}

const subjects: Subject[] = [
  {
    id: 'dcl_iq_gk1',
    name: 'DCL IQ GK-1',
    questionsFile: 'dcl_iq_gk1.json',
    icon: '',
    color: ''
  },
  {
    id: 'dcl_iq_gk2',
    name: 'DCL IQ GK-2',
    questionsFile: 'dcl_iq_gk2.json',
    icon: '',
    color: ''
  },
  {
    id: 'dcl_iq_math',
    name: 'DCL IQ Math',
    questionsFile: 'dcl_iq_math.json',
    icon: '',
    color: ''
  },
  {
    id: 'dcl_model_test',
    name: 'DCL Model Test',
    questionsFile: 'dcl_model_test.json',
    icon: '',
    color: ''
  },
  {
    id: 'kisa_set1',
    name: 'KISA Set-1',
    questionsFile: 'kisa_set1.json',
    icon: '',
    color: ''
  },
  {
    id: 'kisa_set2',
    name: 'KISA Set-2',
    questionsFile: 'kisa_set2.json',
    icon: '',
    color: ''
  },
  {
    id: 'kisa_set3',
    name: 'KISA Set-3',
    questionsFile: 'kisa_set3.json',
    icon: '',
    color: ''
  }
  ,
  {
    id: 'sample',
    name: 'Sample Test',
    questionsFile: 'sample.json',
    icon: '',
    color: ''
  }
];

export default function OnlineTestApp() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [questionsData, setQuestionsData] = useState<QuestionsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Typeset math whenever content changes
  const typesetMath = () => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err: any) => console.error('MathJax error:', err));
    }
  };

  // Trigger MathJax typesetting on state changes
  useEffect(() => {
    typesetMath();
  }, [currentQuestion, testStarted, testSubmitted, questionsData]);

  // Load questions when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      loadQuestions(selectedSubject.questionsFile);
    }
  }, [selectedSubject]);

  const loadQuestions = async (filePath: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('Failed to load questions');
      }
      const data: QuestionsData = await response.json();
      setQuestionsData(data);
      setTimeLeft(data.duration);
      setLoading(false);

      // Typeset math after questions load
      setTimeout(typesetMath, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading questions');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testStarted && !testSubmitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, testSubmitted, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: number, answerIndex: number): void => {
    setAnswers(prev => {
      const newAnswers = { ...prev };

      // If clicking the same option, deselect it (reset)
      if (newAnswers[questionId] === answerIndex) {
        delete newAnswers[questionId];
        return newAnswers;
      }

      // Otherwise, select the new option
      newAnswers[questionId] = answerIndex;

      // Auto-advance to next question after a short delay (only if answered)
      if (currentQuestion < questionsData!.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
        }, 300);
      }

      return newAnswers;
    });
  };

  const handleSubmit = (): void => {
    if (!questionsData) return;

    let correctCount = 0;
    questionsData.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setTestSubmitted(true);
    setTimeout(typesetMath, 100);
  };

  const handleBackToSubjects = (): void => {
    setSelectedSubject(null);
    setQuestionsData(null);
    setTestStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(0);
    setTestSubmitted(false);
    setScore(0);
    setError(null);
  };

  const handleRestart = (): void => {
    if (!questionsData) return;

    setTestStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(questionsData.duration);
    setTestSubmitted(false);
    setScore(0);
  };

  const handleStartTest = (): void => {
    setTestStarted(true);
    setTimeout(typesetMath, 100);
  };

  const goToQuestion = (index: number): void => {
    setCurrentQuestion(index);
    setTimeout(typesetMath, 100);
  };

  const handleSelectSubject = (subject: Subject): void => {
    setSelectedSubject(subject);
  };

  // Home page - Subject selection
  if (!selectedSubject) {
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
                onClick={() => handleSelectSubject(subject)}
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading {selectedSubject.name} questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Questions</h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Make sure {selectedSubject.questionsFile} exists in the public folder</p>
          <button
            onClick={handleBackToSubjects}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  if (!questionsData) return null;

  // Welcome screen
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <button
            onClick={handleBackToSubjects}
            className="mb-4 text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Subjects
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{selectedSubject.name}</h1>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Total Questions:</span> {questionsData.questions.length}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Duration:</span> {Math.floor(questionsData.duration / 60)} minutes
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Passing Score:</span> 90%
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
              onClick={handleStartTest}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results page
  if (testSubmitted) {
    const percentage = (score / questionsData.questions.length) * 100;
    const passed = percentage >= 90;

    // Get wrong question indices
    const wrongQuestions = questionsData.questions
      .map((q, idx) => ({ question: q, index: idx }))
      .filter(({ question }) => answers[question.id] !== question.correctAnswer);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {passed ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h2>
            <p className="text-gray-600 mb-2">
              {passed ? 'You passed the test!' : 'You need more practice.'}
            </p>
            <p className="text-sm text-gray-500 mb-6">{selectedSubject.name}</p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-indigo-600">{score}</p>
                  <p className="text-sm text-gray-600">Correct</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{questionsData.questions.length - score}</p>
                  <p className="text-sm text-gray-600">Incorrect</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{percentage.toFixed(0)}%</p>
                  <p className="text-sm text-gray-600">Score</p>
                </div>
              </div>
            </div>
            {/* Wrong Questions Quick Navigation */}
            {wrongQuestions.length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Incorrect Questions</h3>
                </div>
                <p className="text-sm text-red-700 mb-3">Click on question numbers to jump directly:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {wrongQuestions.map(({ index }) => (
                    <a
                      key={index}
                      href={`#question-${index}`}
                      className="w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold flex items-center justify-center border-2 border-red-300 transition-all"
                    >
                      {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

          <div className="space-y-6 mb-6 text-left max-h-96 overflow-y-auto">
            {questionsData.questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div key={q.id} id={`question-${idx}`} className={`border-2 rounded-xl p-5 scroll-mt-4 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      {q.topic && (
                        <span className="inline-block text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded mb-2">
                          {q.topic}
                        </span>
                      )}
                      <p className="text-lg font-semibold text-gray-800" dangerouslySetInnerHTML={{ __html: q.question }}></p>
                    </div>
                    <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  </div>

                  <div className="space-y-2 ml-11">
                    {q.options.map((option, optIdx) => {
                      const isUserAnswer = userAnswer === optIdx;
                      const isCorrectAnswer = q.correctAnswer === optIdx;

                      let optionClass = 'bg-white border-2 border-gray-200';

                      if (isCorrectAnswer) {
                        optionClass = 'bg-green-100 border-2 border-green-400';
                      } else if (isUserAnswer && !isCorrect) {
                        optionClass = 'bg-red-100 border-2 border-red-400';
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-lg ${optionClass}`}>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">{String.fromCharCode(65 + optIdx)}.</span>
                            <span className="text-gray-800" dangerouslySetInnerHTML={{ __html: option }}></span>
                            {isCorrectAnswer && (
                              <span className="ml-auto text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">
                                ✓ Correct Answer
                              </span>
                            )}
                            {isUserAnswer && !isCorrect && (
                              <span className="ml-auto text-xs font-semibold text-red-700 bg-red-200 px-2 py-1 rounded">
                                ✗ Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {userAnswer === undefined && (
                    <div className="ml-11 mt-3 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">⚠ You did not answer this question</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleBackToSubjects}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Subjects
            </button>
            <button
              onClick={handleRestart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Test
            </button>
          </div>
        </div>
      </div>
      </div >
    );
  }

  // Test page
  const question = questionsData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questionsData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 text-white p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <button
                  onClick={handleBackToSubjects}
                  className="text-white/80 hover:text-white font-medium inline-flex items-center gap-2 mb-2 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <h2 className="text-2xl font-bold">{selectedSubject.name}</h2>
              </div>
              <div className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold">
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className="w-full bg-indigo-400 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <p className="text-sm text-gray-500">Question {currentQuestion + 1} of {questionsData.questions.length}</p>
                {question.topic && (
                  <span className="text-xs font-semibold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                    {question.topic}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-800" dangerouslySetInnerHTML={{ __html: question.question }}></h3>
            </div>

            <div className="space-y-3 mb-8">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(question.id, idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${answers[question.id] === idx
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                >
                  <span className="font-medium text-gray-700">{String.fromCharCode(65 + idx)}.</span>{' '}
                  <span dangerouslySetInnerHTML={{ __html: option }}></span>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentQuestion === questionsData.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
                >
                  Submit Test
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(questionsData.questions.length - 1, prev + 1))}
                  className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Next
                </button>
              )}
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-3">Question Navigation:</p>
              <div className="flex flex-wrap gap-2">
                {questionsData.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${idx === currentQuestion
                      ? 'bg-indigo-600 text-white'
                      : answers[q.id] !== undefined
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-indigo-300'
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
