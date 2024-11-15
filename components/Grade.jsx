'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Grade.module.css';
import liff from '@line/liff';

export default function Grade() {
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lineUserId, setLineUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize LIFF
    if (window.LIFF) {
      window.LIFF.init({ liffId: 'YOUR_LIFF_ID' }) // Replace with your actual LIFF ID
        .then(() => {
          if (window.LIFF.isLoggedIn()) {
            // Get user profile after login
            window.LIFF.getProfile().then((profile) => {
              setLineUserId(profile.userId); // Save the user ID
              fetchGrades(profile.userId);  // Fetch grades after getting user profile
            }).catch(err => {
              setError('Error fetching user profile');
            });
          } else {
            window.LIFF.login();
          }
        })
        .catch((err) => {
          setError('Error initializing LIFF');
        });
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
