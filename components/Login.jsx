'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import liff from '@line/liff';
import styles from './Login.module.css';

export default function Login() {
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initializeLiff = async () => {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
      if (liff.isLoggedIn()) {
        const profileData = await liff.getProfile();
        setProfile(profileData);
        localStorage.setItem('lineUserId', profileData.userId);
      } else {
        liff.login();
      }
    };
    initializeLiff();
  }, []);

  const handleLogout = () => {
    liff.logout();
    localStorage.removeItem('lineUserId');
    window.location.reload();
  };

  const navigateToRegister = () => {
    const urlParams = new URLSearchParams(searchParams.toString()).toString();
    router.push(`/register?${urlParams}`);
  };

  const handleCheckGrade = async () => {
    if (!profile) return;

    setLoading(true);
    setGrades(null);

    try {
      const response = await fetch('/api/checkgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineUserId: profile.userId }),
      });

      const data = await response.json();
      setGrades(data.success ? data.grades : { error: data.error || 'Grade check failed' });
    } catch (error) {
      setGrades({ error: 'An error occurred while checking grades' });
    } finally {
      setLoading(false);
    }
  };

  return profile ? (
    <div className={styles.loginContainer}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <img src={profile.pictureUrl} alt="Profile" className={styles.profileImage} />
          <div className={styles.profileInfo}>
            <p>Hello, <strong>{profile.displayName}</strong></p>
            <p>UID: {profile.userId}</p>
          </div>
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={navigateToRegister}>Go to Register</button>
          <button onClick={handleCheckGrade} disabled={loading}>
            {loading ? 'Checking...' : 'Check Grade'}
          </button>
        </div>
        {grades && (
          <div className={styles.gradesResult}>
            {grades.error ? <p>{grades.error}</p> : <pre>{JSON.stringify(grades, null, 2)}</pre>}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );
}
