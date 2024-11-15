'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';


export default function GradesPage() {
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const lineUserId = searchParams.get('lineUserId');

  useEffect(() => {
    if (!lineUserId) {
      setError('No LINE User ID provided.');
      setLoading(false);
      return;
    }

    const fetchGrades = async () => {
      try {
        const response = await fetch('/api/checkgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lineUserId }),
        });

        const data = await response.json();
        if (data.success) {
          setGrades(data.notification);
        } else {
          setError(data.error || 'Failed to fetch grades.');
        }
      } catch (err) {
        setError('An error occurred while fetching grades.');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [lineUserId]);

  if (loading) return <p>Loading grades...</p>;

  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.gradesContainer}>
      <h1>Grade Results</h1>
      <pre>{JSON.stringify(grades, null, 2)}</pre>
    </div>
  );
}
