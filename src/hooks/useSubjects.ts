import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Subject, SubjectRow } from '../types';

function toSubject(row: SubjectRow): Subject {
  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    displayOrder: row.display_order,
    duration: row.duration,
    passingScore: row.passing_score,
  };
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchSubjects() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('subjects')
        .select('*')
        .order('display_order', { ascending: true });

      if (cancelled) return;

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      setSubjects((data as SubjectRow[]).map(toSubject));
      setLoading(false);
    }

    fetchSubjects();
    return () => { cancelled = true; };
  }, [fetchKey]);

  const refetch = () => setFetchKey((k) => k + 1);

  return { subjects, loading, error, refetch };
}
