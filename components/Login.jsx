'use client'
import { useEffect, useState } from 'react';
import liff from '@line/liff';

export default function Login() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID }).then(async () => {
      if (liff.isLoggedIn()) {
        const profile = await liff.getProfile();
        setProfile(profile);
      } else {
        liff.login();
      }
    });
  }, []);

  return profile ? (
    <div>
      <h1>Welcome, {profile.displayName}</h1>
      <p>Your LINE User ID: {profile.userId}</p>
      <button onClick={() => liff.logout()}>Logout</button>
      <button onClick={() => navigate('/register')}>Go to Register</button>
    </div>
  ) : (
    <p>Loading...</p>
  );
}
