'use client';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

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

  const navigateToRegister = () => {
    const queryString = `?code=${searchParams.get('code')}&state=${searchParams.get('state')}`;
    router.push(`/register${queryString}`);
  };

  const handleCheckGrade = async () => {
    setLoading(true);
    setGrades(null);
    const lineUserId = profile?.userId;

    try {
      const { data } = await axios.post('/api/checkgrade', { lineUserId });
      setGrades(data.grades || { error: data.error });
    } catch {
      setGrades({ error: 'Grade check failed' });
    } finally {
      setLoading(false);
    }
  };

  return profile ? (
    <div className={styles.loginContainer}>
      {/* Profile and UI code */}
      <button onClick={navigateToRegister}>Go to Register</button>
      {grades && <pre>{JSON.stringify(grades, null, 2)}</pre>}
    </div>
  ) : (
    <div className={styles.loading}>Loading...</div>
  );
}
