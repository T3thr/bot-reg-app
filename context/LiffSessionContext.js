// contexts/LiffSessionContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import liff from '@line/liff';

const LiffSessionContext = createContext();

export function useLiffSession() {
  return useContext(LiffSessionContext);
}

export const LiffSessionProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lineUserId, setLineUserId] = useState(null);

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
        if (liff.isLoggedIn()) {
          const profileData = await liff.getProfile();
          setProfile(profileData);
          setLineUserId(profileData.userId); // Store the user ID
        } else {
          liff.login();
        }
      } catch (err) {
        console.error('LIFF initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeLiff();
  }, []);

  return (
    <LiffSessionContext.Provider value={{ profile, lineUserId, loading }}>
      {children}
    </LiffSessionContext.Provider>
  );
};
