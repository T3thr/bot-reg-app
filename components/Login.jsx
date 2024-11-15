'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';
import { FaUserCircle, FaSignOutAlt, FaRegRegistered, FaCheckCircle } from 'react-icons/fa';
import styles from './Login.module.css';

export default function Login() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID }).then(async () => {
      if (liff.isLoggedIn()) {
        const profileData = await liff.getProfile();
        setProfile(profileData);
        localStorage.setItem('lineUserId', profileData.userId); // Save user ID in localStorage
      } else {
        liff.login(); // If not logged in, trigger the LINE login
      }
    });
  }, []);

  const handleLogout = () => {
    liff.logout();
    localStorage.removeItem('lineUserId');
    window.location.reload();
  };

  const navigateToRegister = () => {
    router.push(`/signup`);
  };

  const navigateToCheckGrade = () => {
    const lineUserId = profile?.userId || localStorage.getItem('lineUserId');
    if (lineUserId) {
      router.push(`/grades?lineUserId=${lineUserId}`);
    } else {
      alert('Unable to retrieve LINE User ID. Please login again.');
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
            onClick={navigateToCheckGrade}
            disabled={loading}
          >
            {loading ? 'Loading...' : <><FaCheckCircle className={styles.icon} /> Check Grade</>}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className={styles.loading}>
      <p>Loading...</p>
    </div>
  );
}
