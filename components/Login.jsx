'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import liff from '@line/liff';
import { FaUserCircle, FaSignOutAlt, FaRegRegistered, FaCheckCircle } from 'react-icons/fa';
import styles from './Login.module.css';

export default function Login() {
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID }).then(async () => {
      if (liff.isLoggedIn()) {
        const profileData = await liff.getProfile();
        setProfile(profileData);
        localStorage.setItem('lineUserId', profileData.userId);

        // Save URL query params in localStorage for persistence
        const urlParams = new URLSearchParams(window.location.search);
        ['code', 'state', 'liffClientId'].forEach(param => {
          const value = urlParams.get(param);
          if (value) localStorage.setItem(param, value);
        });
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
    const queryParams = new URLSearchParams({
      code: localStorage.getItem('code'),
      state: localStorage.getItem('state'),
      liffClientId: localStorage.getItem('liffClientId')
    }).toString();
    router.push(`/register?${queryParams}`);
  };

  return (
    profile ? (
      <div className={styles.loginContainer}>
        {/* Profile Display and Logout */}
        <button onClick={handleLogout}><FaSignOutAlt /> Logout</button>
        <button onClick={navigateToRegister}><FaRegRegistered /> Go to Register</button>
        {/* Grade Check Button */}
      </div>
    ) : (
      <p>Loading...</p>
    )
  );
}
