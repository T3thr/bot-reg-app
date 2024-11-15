'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // Using NextAuth session only
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
      const fetchProfile = async () => {
        const res = await fetch('/api/auth/session'); // Call to session API to retrieve the profile
        const profileData = await res.json();
        if (profileData?.user?.id) {
          setProfile(profileData.user);
        } else {
          alert('Unable to retrieve profile. Please log in again.');
        }
      };
      fetchProfile();
    }
  }, [status, session]);

  const handleLogout = async () => {
    // Trigger sign-out using LIFF through NextAuth signOut method
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.reload();
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
