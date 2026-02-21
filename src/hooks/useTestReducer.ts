import { useReducer, useCallback } from 'react';
import { Subject, QuestionsData } from '../types';

export interface TestState {
  selectedSubject: Subject | null;
  questionsData: QuestionsData | null;
  loading: boolean;
  error: string | null;
  testStarted: boolean;
  currentQuestion: number;
  answers: Record<number, number>;
  timeLeft: number;
  testSubmitted: boolean;
  score: number;
}

type TestAction =
  | { type: 'SELECT_SUBJECT'; subject: Subject }
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; data: QuestionsData }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'START_TEST' }
  | { type: 'ANSWER'; questionId: number; answerIndex: number }
  | { type: 'GO_TO_QUESTION'; index: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'TICK' }
  | { type: 'SUBMIT'; score: number }
  | { type: 'RESTART' }
  | { type: 'BACK_TO_HOME' }
  | { type: 'RESTORE'; partial: Partial<TestState> };

const initialState: TestState = {
  selectedSubject: null,
  questionsData: null,
  loading: false,
  error: null,
  testStarted: false,
  currentQuestion: 0,
  answers: {},
  timeLeft: 0,
  testSubmitted: false,
  score: 0,
};

function testReducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case 'SELECT_SUBJECT':
      return { ...initialState, selectedSubject: action.subject, loading: true };

    case 'LOAD_START':
      return { ...state, loading: true, error: null };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        loading: false,
        questionsData: action.data,
        timeLeft: action.data.duration,
      };

    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.error };

    case 'START_TEST':
      return { ...state, testStarted: true };

    case 'ANSWER': {
      const newAnswers = { ...state.answers };
      if (newAnswers[action.questionId] === action.answerIndex) {
        delete newAnswers[action.questionId];
      } else {
        newAnswers[action.questionId] = action.answerIndex;
      }
      return { ...state, answers: newAnswers };
    }

    case 'GO_TO_QUESTION':
      return { ...state, currentQuestion: action.index };

    case 'NEXT_QUESTION':
      if (!state.questionsData) return state;
      return {
        ...state,
        currentQuestion: Math.min(
          state.questionsData.questions.length - 1,
          state.currentQuestion + 1
        ),
      };

    case 'PREV_QUESTION':
      return {
        ...state,
        currentQuestion: Math.max(0, state.currentQuestion - 1),
      };

    case 'TICK':
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) };

    case 'SUBMIT':
      return { ...state, testSubmitted: true, score: action.score };

    case 'RESTART':
      return {
        ...state,
        testStarted: false,
        currentQuestion: 0,
        answers: {},
        timeLeft: state.questionsData?.duration ?? 0,
        testSubmitted: false,
        score: 0,
      };

    case 'BACK_TO_HOME':
      return initialState;

    case 'RESTORE':
      return { ...state, ...action.partial };

    default:
      return state;
  }
}

export function useTestReducer() {
  const [state, dispatch] = useReducer(testReducer, initialState);

  const selectSubject = useCallback(
    (subject: Subject) => dispatch({ type: 'SELECT_SUBJECT', subject }),
    []
  );

  const loadSuccess = useCallback(
    (data: QuestionsData) => dispatch({ type: 'LOAD_SUCCESS', data }),
    []
  );

  const loadError = useCallback(
    (error: string) => dispatch({ type: 'LOAD_ERROR', error }),
    []
  );

  const startTest = useCallback(() => dispatch({ type: 'START_TEST' }), []);

  const answer = useCallback(
    (questionId: number, answerIndex: number) =>
      dispatch({ type: 'ANSWER', questionId, answerIndex }),
    []
  );

  const goToQuestion = useCallback(
    (index: number) => dispatch({ type: 'GO_TO_QUESTION', index }),
    []
  );

  const nextQuestion = useCallback(
    () => dispatch({ type: 'NEXT_QUESTION' }),
    []
  );

  const prevQuestion = useCallback(
    () => dispatch({ type: 'PREV_QUESTION' }),
    []
  );

  const tick = useCallback(() => dispatch({ type: 'TICK' }), []);

  const submit = useCallback(
    (score: number) => dispatch({ type: 'SUBMIT', score }),
    []
  );

  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  const backToHome = useCallback(
    () => dispatch({ type: 'BACK_TO_HOME' }),
    []
  );

  const restore = useCallback(
    (partial: Partial<TestState>) => dispatch({ type: 'RESTORE', partial }),
    []
  );

  return {
    state,
    dispatch,
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
  };
}
