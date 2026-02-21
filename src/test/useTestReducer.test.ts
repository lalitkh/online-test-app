import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTestReducer } from '../hooks/useTestReducer';

const mockSubject = {
  id: 'test',
  name: 'Test Subject',
  questionsFile: 'test.json',
};

const mockQuestionsData = {
  title: 'Test Quiz',
  duration: 600,
  questions: [
    { id: 1, question: 'Q1?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 },
    { id: 2, question: 'Q2?', options: ['A', 'B', 'C', 'D'], correctAnswer: 1 },
    { id: 3, question: 'Q3?', options: ['A', 'B', 'C', 'D'], correctAnswer: 2 },
  ],
};

describe('useTestReducer', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useTestReducer());
    expect(result.current.state.selectedSubject).toBeNull();
    expect(result.current.state.testStarted).toBe(false);
    expect(result.current.state.answers).toEqual({});
  });

  it('SELECT_SUBJECT sets subject and starts loading', () => {
    const { result } = renderHook(() => useTestReducer());
    act(() => result.current.selectSubject(mockSubject));
    expect(result.current.state.selectedSubject).toEqual(mockSubject);
    expect(result.current.state.loading).toBe(true);
  });

  it('LOAD_SUCCESS sets questions data and timer', () => {
    const { result } = renderHook(() => useTestReducer());
    act(() => result.current.selectSubject(mockSubject));
    act(() => result.current.loadSuccess(mockQuestionsData));
    expect(result.current.state.questionsData).toEqual(mockQuestionsData);
    expect(result.current.state.timeLeft).toBe(600);
    expect(result.current.state.loading).toBe(false);
  });

  it('LOAD_ERROR sets error message', () => {
    const { result } = renderHook(() => useTestReducer());
    act(() => result.current.selectSubject(mockSubject));
    act(() => result.current.loadError('Network error'));
    expect(result.current.state.error).toBe('Network error');
    expect(result.current.state.loading).toBe(false);
  });

  it('START_TEST sets testStarted to true', () => {
    const { result } = renderHook(() => useTestReducer());
    act(() => result.current.selectSubject(mockSubject));
    act(() => result.current.loadSuccess(mockQuestionsData));
    act(() => result.current.startTest());
    expect(result.current.state.testStarted).toBe(true);
  });

  it('ANSWER toggles answer selection', () => {
    const { result } = renderHook(() => useTestReducer());
    act(() => result.current.selectSubject(mockSubject));
    act(() => result.current.loadSuccess(mockQuestionsData));
    act(() => result.current.startTest());

    // Select answer
    act(() => result.current.answer(1, 2));
    expect(result.current.state.answers[1]).toBe(2);

    // Deselect same answer
    act(() => result.current.answer(1, 2));
    expect(result.current.state.answers[1]).toBeUndefined();

    // Select different answer
    act(() => result.current.answer(1, 0));
    expect(result.current.state.answers[1]).toBe(0);
  });

  it('NEXT_QUESTION and PREV_QUESTION navigate correctly', () => {
    const { result } = renderHook(() => useTestReducer());
    act(() => result.current.selectSubject(mockSubject));
    act(() => result.current.loadSuccess(mockQuestionsData));

    expect(result.current.state.currentQuestion).toBe(0);

    act(() => result.current.nextQuestion());
    expect(result.current.state.currentQuestion).toBe(1);

    act(() => result.current.nextQuestion());
    expect(result.current.state.currentQuestion).toBe(2);

    // Should not go beyond last question
    act(() => result.current.nextQuestion());
    expect(result.current.state.currentQuestion).toBe(2);

    act(() => result.current.prevQuestion());
    expect(result.current.state.currentQuestion).toBe(1);

    act(() => result.current.prevQuestion());
    expect(result.current.state.currentQuestion).toBe(0);

    // Should not go below 0
    act(() => result.current.prevQuestion());
    expect(result.current.state.currentQuestion).toBe(0);
  });

  it('GO_TO_QUESTION jumps to specific question', () => {
    const { result } = renderHook(() => useTestReducer());
    act(() => result.current.selectSubject(mockSubject));
    act(() => result.current.loadSuccess(mockQuestionsData));

    act(() => result.current.goToQuestion(2));
    expect(result.current.state.currentQuestion).toBe(2);
  });

  it('TICK decrements timer', () => {
    const { result } = renderHook(() => useTestReducer());
    act(() => result.current.selectSubject(mockSubject));
    act(() => result.current.loadSuccess(mockQuestionsData));

    expect(result.current.state.timeLeft).toBe(600);
    act(() => result.current.tick());
    expect(result.current.state.timeLeft).toBe(599);
  });

  it('SUBMIT records score and marks test as submitted', () => {
    const { result } = renderHook(() => useTestReducer());
    act(() => result.current.selectSubject(mockSubject));
    act(() => result.current.loadSuccess(mockQuestionsData));
    act(() => result.current.startTest());

    act(() => result.current.submit(2));
    expect(result.current.state.score).toBe(2);
    expect(result.current.state.testSubmitted).toBe(true);
  });

  it('RESTART resets test state but keeps questions', () => {
    const { result } = renderHook(() => useTestReducer());
    act(() => result.current.selectSubject(mockSubject));
    act(() => result.current.loadSuccess(mockQuestionsData));
    act(() => result.current.startTest());
    act(() => result.current.answer(1, 0));
    act(() => result.current.submit(1));

    act(() => result.current.restart());
    expect(result.current.state.testStarted).toBe(false);
    expect(result.current.state.answers).toEqual({});
    expect(result.current.state.score).toBe(0);
    expect(result.current.state.testSubmitted).toBe(false);
    expect(result.current.state.timeLeft).toBe(600);
    expect(result.current.state.questionsData).toEqual(mockQuestionsData);
  });

  it('BACK_TO_HOME resets everything', () => {
    const { result } = renderHook(() => useTestReducer());
    act(() => result.current.selectSubject(mockSubject));
    act(() => result.current.loadSuccess(mockQuestionsData));
    act(() => result.current.startTest());

    act(() => result.current.backToHome());
    expect(result.current.state.selectedSubject).toBeNull();
    expect(result.current.state.questionsData).toBeNull();
    expect(result.current.state.testStarted).toBe(false);
  });
});
