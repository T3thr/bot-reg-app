// context/GradeContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const GradeContext = createContext();

export const GradeProvider = ({ children }) => {
  const [grades, setGrades] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGrades = async (lineUserId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/checkgrade?lineUserId=${lineUserId}`);
      if (response.data.success) {
        setGrades(response.data.grades);
        setAnalysis(response.data.analysis);
      } else {
        setError(response.data.error || 'Failed to fetch grades.');
      }
    } catch (err) {
      setError('An error occurred while fetching grades.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradeContext.Provider value={{ grades, analysis, loading, error, fetchGrades }}>
      {children}
    </GradeContext.Provider>
  );
};

export const useGrade = () => useContext(GradeContext);
