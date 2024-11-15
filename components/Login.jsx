'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';
import { FaUserCircle, FaSignOutAlt, FaRegRegistered, FaCheckCircle } from 'react-icons/fa';
import styles from './Login.module.css';

export default function Login() {
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID }).then(async () => {
      if (liff.isLoggedIn()) {
        const profileData = await liff.getProfile();
        setProfile(profileData);
        localStorage.setItem('lineUserId', profileData.userId); // Save user ID in localStorage
      } else {
        // Trigger the login and ensure the user adds LINE OA as a friend
        liff.login({
          redirectUri: window.location.href, // This redirects after login
          scope: 'profile openid',  // Make sure you are requesting the correct scopes
        });
      }
    }).catch((error) => {
      console.error('LIFF Initialization failed', error);
    });
  }, []);

  useEffect(() => {
    if (profile) {
      // When the profile is set, check if the user is already a friend of the LINE OA
      // Example: Check if the user is already added as a friend
      liff.getAccessToken().then((token) => {
        // Here you would use the token to query the LINE OA API if needed.
        // If the user is not a friend, you can trigger an action to add the OA friend.
        // This might involve redirecting them to your OA friend URL or prompting them.
      }).catch((error) => {
        console.error('Failed to get access token', error);
      });
    }
  }, [profile]);

  const handleLogout = () => {
    liff.logout();
    localStorage.removeItem('lineUserId');
    window.location.reload();
  };

  const navigateToRegister = () => {
    router.push('/signup');
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
      if (data.success) {
        setGrades(data.grades);
      } else {
        setGrades({ error: data.error || 'Grade check failed or user not registered' });
      }
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
            <p className={styles.profileName}>Hello, <strong>{profile.displayName}</strong></p>
            <p className={styles.profileId}>UID: {profile.userId}</p>
          </div>
        </div>
        <div className={styles.buttonGroup}>
          <button className={`${styles.btn} ${styles.btnLogout}`} onClick={handleLogout}>
            <FaSignOutAlt className={styles.icon} /> Logout
          </button>
          <button className={`${styles.btn} ${styles.btnRegister}`} onClick={navigateToRegister}>
            <FaRegRegistered className={styles.icon} /> Go to Register
          </button>
          <button
            className={`${styles.btn} ${styles.btnCheckGrade}`}
            onClick={handleCheckGrade}
            disabled={loading}
          >
            {loading ? 'Checking...' : <><FaCheckCircle className={styles.icon} /> Check Grade</>}
          </button>
        </div>
        {grades && (
          <div className={styles.gradesResult}>
            {grades.error ? (
              <p className={styles.error}>{grades.error}</p>
            ) : (
              <pre>{JSON.stringify(grades, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className={styles.loading}>
      <p>Loading...</p>
    </div>
  );
}
