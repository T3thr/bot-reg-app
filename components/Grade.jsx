'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import styles from './Grade.module.css';

export default function Grade() {
  const { data: session, status } = useSession(); // Access session data via NextAuth
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      if (status === 'loading') return; // Wait for session to load
      if (!session?.user?.id) {
        setError('You are not logged in. Please log in via LINE.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/checkgrade`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lineUserId: session.user.id }),
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

  if (loading || status === 'loading') return <p>Loading grades...</p>;

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        {status !== 'authenticated' && (
          <button onClick={() => signIn('line')}>Login with LINE</button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.gradesContainer}>
      <h1>Grade Results</h1>
      <pre>{JSON.stringify(grades, null, 2)}</pre>
    </div>
  );
}
