import { useState, useEffect, useCallback } from 'react';
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
      .limit(50);

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

    // Refresh the list
    fetchAttempts();
  }, [fetchAttempts]);

  return { attempts, loading, error, saveAttempt, refetch: fetchAttempts };
}
