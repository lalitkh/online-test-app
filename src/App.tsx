import { useEffect, useCallback, useRef, lazy, Suspense, useState } from 'react';
import { subjects } from './data/subjects';
import { QuestionsData } from './types';
import { useTestReducer } from './hooks/useTestReducer';
import { useTimer } from './hooks/useTimer';
import { useMathJax } from './hooks/useMathJax';
import { saveTestState, loadTestState, clearTestState } from './hooks/useLocalStorage';
import SubjectSelection from './components/SubjectSelection';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import AdminPanel from './components/AdminPanel';

const TestWelcome = lazy(() => import('./components/TestWelcome'));
const TestPage = lazy(() => import('./components/TestPage'));
const TestResults = lazy(() => import('./components/TestResults'));

function SuspenseFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function OnlineTestApp() {
  const [adminOpen, setAdminOpen] = useState(false);
  // Incrementing this forces SubjectSelection to re-read visibility from localStorage
  const [visibilityVersion, setVisibilityVersion] = useState(0);

  const {
    state,
    selectSubject,
    loadSuccess,
    loadError,
    startTest,
    answer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    tick,
    submit,
    restart,
    backToHome,
    restore,
  } = useTestReducer();

  const {
    selectedSubject,
    questionsData,
    loading,
    error,
    testStarted,
    currentQuestion,
    answers,
    timeLeft,
    testSubmitted,
    score,
  } = state;

  // Keep answers in a ref so handleSubmit always reads the latest
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const questionsDataRef = useRef(questionsData);
  useEffect(() => {
    questionsDataRef.current = questionsData;
  }, [questionsData]);

  // Restore test state from localStorage on mount
  const hasRestoredRef = useRef(false);
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const saved = loadTestState();
    if (!saved || !saved.testStarted) return;

    const subject = subjects.find((s) => s.id === saved.subjectId);
    if (!subject) return;

    // Re-select the subject (triggers question loading)
    selectSubject(subject);
    // Store saved state to apply after questions load
    pendingRestoreRef.current = saved;
  }, [selectSubject]);

  const pendingRestoreRef = useRef<ReturnType<typeof loadTestState>>(null);

  // Apply pending restore after questions load
  useEffect(() => {
    if (!questionsData || !pendingRestoreRef.current) return;
    const saved = pendingRestoreRef.current;
    pendingRestoreRef.current = null;

    restore({
      testStarted: saved.testStarted,
      currentQuestion: saved.currentQuestion,
      answers: saved.answers,
      timeLeft: saved.timeLeft,
    });
  }, [questionsData, restore]);

  // Persist test state to localStorage when in-progress
  useEffect(() => {
    if (testStarted && !testSubmitted && selectedSubject) {
      saveTestState({
        subjectId: selectedSubject.id,
        questionsFile: selectedSubject.questionsFile,
        subjectName: selectedSubject.name,
        currentQuestion,
        answers,
        timeLeft,
        testStarted,
      });
    }
  }, [testStarted, testSubmitted, selectedSubject, currentQuestion, answers, timeLeft]);

  // Clear localStorage when test is submitted or user goes home
  useEffect(() => {
    if (testSubmitted || !selectedSubject) {
      clearTestState();
    }
  }, [testSubmitted, selectedSubject]);

  // MathJax typesetting on relevant state changes
  useMathJax([currentQuestion, testStarted, testSubmitted, questionsData]);

  // Load questions when subject is selected
  useEffect(() => {
    if (!selectedSubject) return;

    let cancelled = false;
    const loadQuestions = async () => {
      try {
        const response = await fetch(selectedSubject.questionsFile);
        if (!response.ok) throw new Error('Failed to load questions');
        const data: QuestionsData = await response.json();
        if (!cancelled) loadSuccess(data);
      } catch (err) {
        if (!cancelled) {
          loadError(
            err instanceof Error ? err.message : 'An error occurred while loading questions'
          );
        }
      }
    };

    loadQuestions();
    return () => { cancelled = true; };
  }, [selectedSubject, loadSuccess, loadError]);

  // Submit handler using refs to avoid stale closures
  const handleSubmit = useCallback(() => {
    const data = questionsDataRef.current;
    const currentAnswers = answersRef.current;
    if (!data) return;

    let correctCount = 0;
    data.questions.forEach((q) => {
      if (currentAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    submit(correctCount);
  }, [submit]);

  // Timer — uses refs internally, no stale closure issues
  useTimer({
    isRunning: testStarted && !testSubmitted,
    timeLeft,
    onTick: tick,
    onTimeUp: handleSubmit,
  });

  // Admin panel
  if (adminOpen) {
    return (
      <AdminPanel
        subjects={subjects}
        onClose={() => setAdminOpen(false)}
        onVisibilityChange={() => setVisibilityVersion((v) => v + 1)}
      />
    );
  }

  // Render the appropriate screen
  if (!selectedSubject) {
    return (
      <SubjectSelection
        key={visibilityVersion}
        subjects={subjects}
        onSelect={selectSubject}
        onAdminOpen={() => setAdminOpen(true)}
      />
    );
  }

  if (loading) {
    return <LoadingScreen subjectName={selectedSubject.name} />;
  }

  if (error) {
    return (
      <ErrorScreen
        error={error}
        questionsFile={selectedSubject.questionsFile}
        onBack={backToHome}
      />
    );
  }

  if (!questionsData) return null;

  if (!testStarted) {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <TestWelcome
          subjectName={selectedSubject.name}
          questionsData={questionsData}
          onStart={startTest}
          onBack={backToHome}
        />
      </Suspense>
    );
  }

  if (testSubmitted) {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <TestResults
          subjectName={selectedSubject.name}
          questionsData={questionsData}
          answers={answers}
          score={score}
          onRestart={restart}
          onBack={backToHome}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <TestPage
        subjectName={selectedSubject.name}
        questionsData={questionsData}
        currentQuestion={currentQuestion}
        answers={answers}
        timeLeft={timeLeft}
        onAnswer={answer}
        onNext={nextQuestion}
        onPrev={prevQuestion}
        onGoToQuestion={goToQuestion}
        onSubmit={handleSubmit}
        onBack={backToHome}
      />
    </Suspense>
  );
}
