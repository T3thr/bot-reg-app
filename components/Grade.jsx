// components/Grade.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGrade } from '@/context/GradeContext';  // Import the context hook
import styles from './Grade.module.css';

export default function Grade() {
  const [lineUserId, setLineUserId] = useState(null);
  const { grades, analysis, loading, error, fetchGrades } = useGrade();  // Use context values and fetchGrades function

  const router = useRouter();

  useEffect(() => {
    const userIdFromUrl = new URLSearchParams(window.location.search).get('lineUserId');
    if (userIdFromUrl) {
      setLineUserId(userIdFromUrl);
      fetchGrades(userIdFromUrl);  // Fetch grades using context function
    } else {
      const userIdFromStorage = localStorage.getItem('lineUserId');
      if (userIdFromStorage) {
        setLineUserId(userIdFromStorage);
        fetchGrades(userIdFromStorage);  // Fetch grades using context function
      } else {
        setError('No LINE User ID found.');
      }
    }
  }, [fetchGrades]);

  if (loading) return <p>Loading grades...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.gradesContainer}>
      <h1>Grade Results</h1>
      <pre>{JSON.stringify(grades, null, 2)}</pre>

      <div className={styles.analysis}>
        <p>{analysis?.message}</p>
        {analysis?.eValMessage && <p className={styles.eVal}>{analysis.eValMessage}</p>}
      </div>
    </div>
  );
}
