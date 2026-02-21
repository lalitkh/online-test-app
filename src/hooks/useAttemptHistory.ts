import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AttemptHistory, AttemptHistoryRow } from '../types';

function toAttemptHistory(row: AttemptHistoryRow): AttemptHistory {
  return {
    id: row.id,
    subjectId: row.subject_id,
    subjectName: row.subject_name,
    score: row.score,
    totalQuestions: row.total_questions,
    percentage: row.percentage,
    passed: row.passed,
    timeTaken: row.time_taken,
    attemptedAt: row.attempted_at,
  };
}

export interface SubjectStats {
  subjectId: string;
  subjectName: string;
  totalAttempts: number;
  minPercentage: number;
  maxPercentage: number;
  avgPercentage: number;
  passCount: number;
  failCount: number;
  attempts: AttemptHistory[];
}

export function useAttemptHistory() {
  const [attempts, setAttempts] = useState<AttemptHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttempts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('attempt_history')
      .select('*')
      .order('attempted_at', { ascending: false })
      .limit(200);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setAttempts((data as AttemptHistoryRow[]).map(toAttemptHistory));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  const saveAttempt = useCallback(async (attempt: Omit<AttemptHistory, 'id'>) => {
    const { error: err } = await supabase.from('attempt_history').insert({
      subject_id: attempt.subjectId,
      subject_name: attempt.subjectName,
      score: attempt.score,
      total_questions: attempt.totalQuestions,
      percentage: attempt.percentage,
      passed: attempt.passed,
      time_taken: attempt.timeTaken,
      attempted_at: attempt.attemptedAt,
    });

    if (err) {
      console.error('Failed to save attempt:', err.message);
      return;
    }

    fetchAttempts();
  }, [fetchAttempts]);

  const deleteAttempt = useCallback(async (id: string) => {
    const { error: err } = await supabase
      .from('attempt_history')
      .delete()
      .eq('id', id);

    if (err) {
      console.error('Failed to delete attempt:', err.message);
      return;
    }

    fetchAttempts();
  }, [fetchAttempts]);

  const deleteSubjectAttempts = useCallback(async (subjectId: string) => {
    const { error: err } = await supabase
      .from('attempt_history')
      .delete()
      .eq('subject_id', subjectId);

    if (err) {
      console.error('Failed to delete subject attempts:', err.message);
      return;
    }

    fetchAttempts();
  }, [fetchAttempts]);

  // Compute per-subject stats
  const subjectStats: SubjectStats[] = useMemo(() => {
    const map = new Map<string, AttemptHistory[]>();
    for (const a of attempts) {
      const list = map.get(a.subjectId) ?? [];
      list.push(a);
      map.set(a.subjectId, list);
    }

    return Array.from(map.entries()).map(([subjectId, list]) => {
      const percentages = list.map((a) => a.percentage);
      return {
        subjectId,
        subjectName: list[0].subjectName,
        totalAttempts: list.length,
        minPercentage: Math.min(...percentages),
        maxPercentage: Math.max(...percentages),
        avgPercentage: percentages.reduce((a, b) => a + b, 0) / percentages.length,
        passCount: list.filter((a) => a.passed).length,
        failCount: list.filter((a) => !a.passed).length,
        attempts: list,
      };
    });
  }, [attempts]);

  const globalStats = useMemo(() => {
    if (attempts.length === 0) return null;
    const percentages = attempts.map((a) => a.percentage);
    return {
      totalAttempts: attempts.length,
      totalSubjects: subjectStats.length,
      avgPercentage: percentages.reduce((a, b) => a + b, 0) / percentages.length,
      passRate: (attempts.filter((a) => a.passed).length / attempts.length) * 100,
    };
  }, [attempts, subjectStats]);

  return {
    attempts,
    loading,
    error,
    saveAttempt,
    deleteAttempt,
    deleteSubjectAttempts,
    subjectStats,
    globalStats,
    refetch: fetchAttempts,
  };
}
