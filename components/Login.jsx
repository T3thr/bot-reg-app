'use client'
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import liff from '@line/liff';
import { FaSignOutAlt, FaRegRegistered, FaCheckCircle } from 'react-icons/fa';
import styles from './Login.module.css';

export default function Login() {
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Retrieve initial URL parameters (code, state)
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  useEffect(() => {
    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID }).then(async () => {
      if (liff.isLoggedIn()) {
        const profileData = await liff.getProfile();
        setProfile(profileData);
        localStorage.setItem('lineUserId', profileData.userId);
      } else {
        liff.login();
      }
    });
  }, []);

  const handleLogout = () => {
    liff.logout();
    localStorage.removeItem('lineUserId');
    window.location.reload();
  };

  const navigateToRegister = () => {
    router.push(`/register?code=${code}&state=${state}`);
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
      if (data.success) setGrades(data.grades);
      else setGrades({ error: data.error || 'Grade check failed or user not registered' });
    } catch (error) {
      setGrades({ error: 'An error occurred while checking grades' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      {profile ? (
        <div className={styles.loginContainer}>
          <div className={styles.profileCard}>
            <img src={profile.pictureUrl} alt="Profile" className={styles.profileImage} />
            <p>Hello, <strong>{profile.displayName}</strong></p>
            <p>UID: {profile.userId}</p>
            <button onClick={handleLogout} className={styles.btnLogout}><FaSignOutAlt /> Logout</button>
            <button onClick={navigateToRegister} className={styles.btnRegister}><FaRegRegistered /> Register</button>
            <button onClick={handleCheckGrade} className={styles.btnCheckGrade} disabled={loading}>
              {loading ? 'Checking...' : <><FaCheckCircle /> Check Grade</>}
            </button>
          </div>
          {grades && (grades.error ? <p>{grades.error}</p> : <pre>{JSON.stringify(grades, null, 2)}</pre>)}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </Suspense>
  );
}
