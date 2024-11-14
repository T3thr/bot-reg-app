'use client'; 
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';
import { FaUserCircle, FaSignOutAlt, FaRegRegistered, FaCheckCircle, FaPlusCircle } from 'react-icons/fa';
import styles from './Login.module.css';

export default function Login() {
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasAddedLineOA, setHasAddedLineOA] = useState(false); // Track Line OA addition
  const router = useRouter();
  const lineOAUrl = "https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2006561325&redirect_uri=https://bot-reg-app.vercel.app&state=12345abcde&scope=profile%20openid%20email&bot_prompt=aggressive&nonce=09876xyz";

  useEffect(() => {
    // Extract 'code' and 'state' from the URL when the user is redirected from LIFF
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      // Store the code and state in the URL for later usage
      window.history.replaceState({}, '', `${window.location.pathname}?code=${code}&state=${state}`);
    }

    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID }).then(async () => {
      if (liff.isLoggedIn()) {
        const profileData = await liff.getProfile();
        setProfile(profileData);
        localStorage.setItem('lineUserId', profileData.userId);

        const lineOAStatus = localStorage.getItem('lineOAAdded');
        if (lineOAStatus) {
          setHasAddedLineOA(true);
        } else {
          window.location.href = lineOAUrl;
          localStorage.setItem('lineOAAdded', 'true');
        }
      } else {
        liff.login();
      }
    });
  }, []);

  const handleLogout = () => {
    liff.logout();
    localStorage.removeItem('lineUserId');
    localStorage.removeItem('liffParams');
    localStorage.removeItem('lineOAAdded');
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

  const handleAddLineOA = () => {
    window.location.href = lineOAUrl;
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

          {/* Conditionally render Add Line OA button */}
          {!hasAddedLineOA && (
            <button className={`${styles.btn} ${styles.btnAddLineOA}`} onClick={handleAddLineOA}>
              <FaPlusCircle className={styles.icon} /> Add Line OA
            </button>
          )}
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
