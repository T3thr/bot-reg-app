'use client';
import { createContext, useContext, useState } from 'react';

const GradeContext = createContext();

export function GradeProvider({ children }) {
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkGrade = async (lineUserId) => {
    setLoading(true);
    setGrades(null);

    try {
      const response = await fetch('/api/checkgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineUserId }),
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

  return (
    <GradeContext.Provider value={{ grades, loading, checkGrade }}>
      {children}
    </GradeContext.Provider>
  );
}

export function useGrade() {
  return useContext(GradeContext);
}
