'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';

export default function Login() {
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID }).then(async () => {
      if (liff.isLoggedIn()) {
        const profileData = await liff.getProfile();
        setProfile(profileData);
      } else {
        liff.login();
      }
    });
  }, []);

  const handleLogout = () => {
    liff.logout();
    window.location.reload();
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  return profile ? (
    <div className="login-container">
      <div className="profile-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={profile.pictureUrl} alt="Profile" width="100" style={{ borderRadius: '50%', marginBottom: '10px' }} />
        <div className="message" style={{ padding: '10px', background: '#ddd', textAlign: 'center' }}>
          <p>Hello <strong>{profile.displayName}</strong></p>
          <p>UID: {profile.userId}</p>
        </div>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button onClick={handleLogout} style={buttonStyle}>Logout</button>
        <button onClick={navigateToRegister} style={buttonStyle}>Go to Register</button>
      </div>
    </div>
  ) : (
    <p>Loading...</p>
  );
}

const buttonStyle = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: '#0078FF',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '16px'
};
