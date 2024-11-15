// components/Grade.jsx
'use client';

import { useLiffSession } from '@/context/LiffSessionContext';
import { useState, useEffect } from 'react';
import styles from './Grade.module.css';

export default function Grade() {
  const { lineUserId, profile, loading } = useLiffSession(); // Use the LiffSessionContext
  const [grades, setGrades] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return; // Wait until LIFF is initialized

    if (!lineUserId) {
      setError('You need to be logged in to view grades.');
      return;
    }

    const fetchGrades = async () => {
      try {
        const response = await fetch(`/api/checkgrade?lineUserId=${lineUserId}`, {
          method: 'GET',
        });

        const data = await response.json();
        if (data.success) {
          setGrades(data.grades);
        } else {
          setError(data.error || 'Failed to fetch grades.');
        }
      } catch (err) {
        setError('An error occurred while fetching grades.');
      }
    };

    fetchGrades();
  }, [lineUserId, loading]);

  if (loading) return <p>Loading...</p>;

  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.gradesContainer}>
      <h1>Grade Results</h1>
      <pre>{JSON.stringify(grades, null, 2)}</pre>
    </div>
  );
}
