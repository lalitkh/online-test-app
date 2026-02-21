import { useEffect, useCallback, useRef, lazy, Suspense, useState } from 'react';
import { QuestionsData, QuestionRow } from './types';
import { useTestReducer } from './hooks/useTestReducer';
import { useTimer } from './hooks/useTimer';
import { useMathJax } from './hooks/useMathJax';
import { saveTestState, loadTestState, clearTestState } from './hooks/useLocalStorage';
import { useSubjects } from './hooks/useSubjects';
import { useAttemptHistory } from './hooks/useAttemptHistory';
import { supabase } from './lib/supabase';
import SubjectSelection from './components/SubjectSelection';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import AdminPanel from './components/AdminPanel';
import AttemptHistoryPanel from './components/AttemptHistory';

const TestWelcome = lazy(() => import('./components/TestWelcome'));
const TestPage = lazy(() => import('./components/TestPage'));
const TestResults = lazy(() => import('./components/TestResults'));

function SuspenseFallback() {
  return (
    <div className="bg-fun flex items-center justify-center p-4">
      <div className="card-fun p-10 text-center max-w-sm w-full">
        <div className="text-5xl mb-4 animate-bounce-slow">🏆</div>
        <div className="w-12 h-12 border-4 border-purple-200 border-t-candy-purple rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700 font-bold">Loading...</p>
      </div>
    </div>
  );
}

export default function OnlineTestApp() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  // Incrementing this forces SubjectSelection to re-read visibility from localStorage
  const [visibilityVersion, setVisibilityVersion] = useState(0);

  const { subjects, loading: subjectsLoading, error: subjectsError, refetch: refetchSubjects } = useSubjects();
  const {
    loading: historyLoading,
    error: historyError,
    saveAttempt,
    deleteAttempt,
    deleteSubjectAttempts,
    subjectStats,
    globalStats,
  } = useAttemptHistory();

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

  // Track the initial timeLeft when test starts for calculating time taken
  const startTimeLeftRef = useRef(0);
  useEffect(() => {
    if (testStarted && !testSubmitted && questionsData) {
      startTimeLeftRef.current = questionsData.duration;
    }
  }, [testStarted, testSubmitted, questionsData]);

  // Restore test state from localStorage on mount (wait for subjects to load)
  const hasRestoredRef = useRef(false);
  useEffect(() => {
    if (hasRestoredRef.current || subjectsLoading || subjects.length === 0) return;
    hasRestoredRef.current = true;

    const saved = loadTestState();
    if (!saved || !saved.testStarted) return;

    const subject = subjects.find((s) => s.id === saved.subjectId);
    if (!subject) return;

    // Re-select the subject (triggers question loading)
    selectSubject(subject);
    // Store saved state to apply after questions load
    pendingRestoreRef.current = saved;
  }, [selectSubject, subjects, subjectsLoading]);

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

  // Save attempt to Supabase when test is submitted
  const hasSavedAttemptRef = useRef(false);
  useEffect(() => {
    if (testSubmitted && selectedSubject && questionsData && !hasSavedAttemptRef.current) {
      hasSavedAttemptRef.current = true;
      const totalQuestions = questionsData.questions.length;
      const percentage = (score / totalQuestions) * 100;
      const passingScore = questionsData.passingScore ?? 90;
      const timeTaken = startTimeLeftRef.current - timeLeft;

      saveAttempt({
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        score,
        totalQuestions,
        percentage,
        passed: percentage >= passingScore,
        timeTaken: Math.max(0, timeTaken),
        attemptedAt: new Date().toISOString(),
      });
    }
    if (!testSubmitted) {
      hasSavedAttemptRef.current = false;
    }
  }, [testSubmitted, selectedSubject, questionsData, score, timeLeft, saveAttempt]);

  // MathJax typesetting on relevant state changes
  useMathJax([currentQuestion, testStarted, testSubmitted, questionsData]);

  // Load questions from Supabase when subject is selected
  useEffect(() => {
    if (!selectedSubject) return;

    let cancelled = false;
    const loadQuestions = async () => {
      try {
        const { data, error: err } = await supabase
          .from('questions')
          .select('*')
          .eq('subject_id', selectedSubject.id)
          .order('id', { ascending: true });

        if (cancelled) return;
        if (err) throw new Error(err.message);
        if (!data || data.length === 0) throw new Error('No questions found for this subject');

        const rows = data as QuestionRow[];
        const questionsData: QuestionsData = {
          title: selectedSubject.name,
          duration: selectedSubject.duration,
          passingScore: selectedSubject.passingScore,
          questions: rows.map((r) => ({
            id: r.id,
            question: r.question,
            options: r.options,
            correctAnswer: r.correct_answer,
            topic: r.topic ?? undefined,
          })),
        };

        loadSuccess(questionsData);
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
        onVisibilityChange={() => { setVisibilityVersion((v) => v + 1); refetchSubjects(); }}
      />
    );
  }

  // Attempt history panel
  if (historyOpen) {
    return (
      <AttemptHistoryPanel
        loading={historyLoading}
        error={historyError}
        subjectStats={subjectStats}
        globalStats={globalStats}
        onDeleteAttempt={deleteAttempt}
        onDeleteSubjectAttempts={deleteSubjectAttempts}
        onClose={() => setHistoryOpen(false)}
      />
    );
  }

  // Show loading while subjects are being fetched from Supabase
  if (subjectsLoading) {
    return <SuspenseFallback />;
  }

  // Show error if subjects failed to load
  if (subjectsError) {
    return (
      <ErrorScreen
        error={subjectsError}
        onBack={() => window.location.reload()}
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
        onHistoryOpen={() => setHistoryOpen(true)}
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
