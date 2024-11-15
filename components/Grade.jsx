'use client';

import { useSession } from 'next-auth/react'; // Use session from NextAuth
import { useState, useEffect } from 'react';
import styles from './Grade.module.css';

export default function Grade() {
  const { data: session, status } = useSession(); // Get session info from NextAuth
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') return;

    if (!session || !session.user?.id) {
      setError('You need to be logged in to view grades.');
      setLoading(false);
      return;
    }

    const fetchGrades = async () => {
      try {
        // Fetch grades using the LINE User ID from the session
        const response = await fetch(`/api/checkgrade?lineUserId=${session.user.id}`, {
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

    fetchGrades();
  }, [session, status]);

  if (loading) return <p>Loading grades...</p>;

  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.gradesContainer}>
      <h1>Grade Results</h1>
      <pre>{JSON.stringify(grades, null, 2)}</pre>
    </div>
  );
}
