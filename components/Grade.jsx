// components/Grade.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './Grade.module.css';

export default function Grade() {
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lineUserId, setLineUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch lineUserId from URL or localStorage
    const userIdFromUrl = new URLSearchParams(window.location.search).get('lineUserId');
    if (userIdFromUrl) {
      setLineUserId(userIdFromUrl);
      fetchGrades(userIdFromUrl);  // Fetch grades after getting user ID
    } else {
      const userIdFromStorage = localStorage.getItem('lineUserId');
      if (userIdFromStorage) {
        setLineUserId(userIdFromStorage);
        fetchGrades(userIdFromStorage);  // Fetch grades after getting user ID
      } else {
        setError('No LINE User ID found.');
        setLoading(false);
      }
    }
  }, []);

  const fetchGrades = async (lineUserId) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading grades...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.gradesContainer}>
      <h1>Grade Results</h1>
      <pre>{JSON.stringify(grades, null, 2)}</pre>
    </div>
  );
}
