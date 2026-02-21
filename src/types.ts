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
  isActive?: boolean;
  displayOrder?: number;
  duration: number;
  passingScore?: number;
}

// Supabase row types
export interface SubjectRow {
  id: string;
  name: string;
  is_active: boolean;
  display_order: number;
  duration: number;
  passing_score: number;
}

export interface QuestionRow {
  id: number;
  subject_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  topic: string | null;
}

// Attempt history types
export interface AttemptHistory {
  id?: string;
  subjectId: string;
  subjectName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  timeTaken: number;
  attemptedAt: string;
}

export interface AttemptHistoryRow {
  id: string;
  subject_id: string;
  subject_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  time_taken: number;
  attempted_at: string;
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
