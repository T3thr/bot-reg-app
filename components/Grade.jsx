// components/Grade.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGrade } from '@/context/GradeContext'; // Import the custom hook from context
import { useUserByLineUserId } from '@/backend/lib/gradeAction'; // Import the new hook from GradeAction.js
import styles from './Grade.module.css';

export default function Grade() {
  const [lineUserId, setLineUserId] = useState(null);
  const { grades, loading, error, analysis, fetchGrades } = useGrade(); // Access context values

  // Fetch user data from MongoDB using the lineUserId
  const { data: user, isLoading: userLoading, error: userError } = useUserByLineUserId(lineUserId);

  useEffect(() => {
    const userIdFromUrl = new URLSearchParams(window.location.search).get('lineUserId');
    if (userIdFromUrl) {
      setLineUserId(userIdFromUrl);
      fetchGrades(userIdFromUrl); // Fetch grades using context function
    } else {
      const userIdFromStorage = localStorage.getItem('lineUserId');
      if (userIdFromStorage) {
        setLineUserId(userIdFromStorage);
        fetchGrades(userIdFromStorage); // Fetch grades using context function
      } else {
        setError('No LINE User ID found.');
      }
    }
  }, [fetchGrades]);

  if (loading || userLoading) return <p>Loading...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (userError) return <p className={styles.error}>Error fetching user data: {userError.message}</p>;

  return (
    <div className={styles.gradesContainer}>
      <h1>Grade Results</h1>

      {/* Display user information */}
      <h2>User Information</h2>
      <div>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>LINE User ID:</strong> {user.lineUserId}</p>
      </div>

      <h2>Grades</h2>
      <pre>{JSON.stringify(grades, null, 2)}</pre>

      <div className={styles.analysis}>
        <p>{analysis?.message}</p>
        {analysis?.eValMessage && <p className={styles.eVal}>{analysis.eValMessage}</p>}
      </div>
    </div>
  );
}
