export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  topic?: string;
}

export interface QuestionsData {
  title: string;
  duration: number;
  passingScore?: number;
  questions: Question[];
}

export interface Subject {
  id: string;
  name: string;
  questionsFile: string;
}

// Declare MathJax global
declare global {
  interface Window {
    MathJax: {
      typesetPromise?: () => Promise<void>;
      startup?: {
        promise: Promise<void>;
      };
      tex?: Record<string, unknown>;
      options?: Record<string, unknown>;
    };
  }
}
