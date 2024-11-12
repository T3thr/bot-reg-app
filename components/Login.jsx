'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';
import { FaUserCircle, FaSignOutAlt, FaRegRegistered, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios'; // Import axios
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
    router.push('/register');
  };

  const handleCheckGrade = async () => {
    if (!profile) return;

    setLoading(true);
    setGrades(null);

    try {
      const response = await axios.post('/api/checkgrades', {
        username: profile.displayName,
        lineUserId: profile.userId,
      });

      if (response.data.success) {
        setGrades(response.data.grades);
      } else {
        setGrades({ error: 'Grade check failed or user not registered' });
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
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
