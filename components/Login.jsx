'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import liff from '@line/liff';
import { FaUserCircle, FaSignOutAlt, FaRegRegistered, FaCheckCircle } from 'react-icons/fa';
import styles from './Login.module.css';

export default function Login() {
  const { data: session, status } = useSession(); // Use session from NextAuth
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Wait for session status to be loaded

    if (session?.user?.id) {
      // If user is logged in via session, use session data
      setProfile({
        userId: session.user.id,
        displayName: session.user.name,
        pictureUrl: session.user.image,
      });
    } else {
      // If not logged in, trigger LIFF login
      liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID }).then(async () => {
        if (liff.isLoggedIn()) {
          const profileData = await liff.getProfile();
          setProfile(profileData);
          localStorage.setItem('lineUserId', profileData.userId); // Save user ID
        } else {
          liff.login(); // Trigger login if not logged in
        }
      });
    }
  }, [status, session, router]);

  const handleLogout = () => {
    liff.logout();
    localStorage.removeItem('lineUserId');
  };

  const navigateToRegister = () => {
    router.push('/signup');
  };

  const navigateToCheckGrade = () => {
    if (profile) {
      router.push(`/grade`);
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
