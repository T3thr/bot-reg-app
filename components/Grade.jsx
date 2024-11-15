// components/Grade.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserByLineUserId } from '@/backend/lib/gradeAction'; // Import the new hook from GradeAction.js
import styles from './Grade.module.css';

export default function Grade() {
  const [lineUserId, setLineUserId] = useState(null);
  const [grades, setGrades] = useState(null);  // Store grades locally
  const { data: user, isLoading: userLoading, error: userError } = useUserByLineUserId(lineUserId); // Fetch user data

  useEffect(() => {
    const userIdFromUrl = new URLSearchParams(window.location.search).get('lineUserId');
    if (userIdFromUrl) {
      setLineUserId(userIdFromUrl);
      fetchGrades(userIdFromUrl); // Fetch grades
    } else {
      const userIdFromStorage = localStorage.getItem('lineUserId');
      if (userIdFromStorage) {
        setLineUserId(userIdFromStorage);
        fetchGrades(userIdFromStorage); // Fetch grades
      } else {
        setError('No LINE User ID found.');
      }
    }
  }, []);

  // Fetch grades based on the lineUserId
  const fetchGrades = async (lineUserId) => {
    try {
      const response = await fetch(`/api/grades?lineUserId=${lineUserId}`);
      const data = await response.json();
      if (data.success) {
        setGrades(data.grades); // Store grades locally
      } else {
        setError(data.error || 'Failed to fetch grades.');
      }
    } catch (err) {
      setError('An error occurred while fetching grades.');
    }
  };

  if (userLoading) return <p>Loading user...</p>;
  if (userError) return <p className={styles.error}>Error fetching user data: {userError.message}</p>;

  if (!user || !grades) return <p>Loading grades...</p>;

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
    </div>
  );
}
