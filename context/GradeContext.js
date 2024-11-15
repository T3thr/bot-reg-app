// context/GradeContext.js
'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create GradeContext
const GradeContext = createContext();

// GradeProvider component to wrap the app
export function GradeProvider({ children }) {
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // Fetch grades and analysis based on lineUserId
  const fetchGrades = async (lineUserId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/checkgrade?lineUserId=${lineUserId}`);
      if (response.data.success) {
        setGrades(response.data.grades);
        setAnalysis(response.data.analysis); // Store the analysis result
      } else {
        setError(response.data.error || 'Failed to fetch grades.');
      }
    } catch (err) {
      setError('An error occurred while fetching grades.');
    } finally {
      setLoading(false);
    }
  };

  // Context value to share with consumers
  const value = {
    grades,
    loading,
    error,
    analysis,
    fetchGrades,
  };

  return <GradeContext.Provider value={value}>{children}</GradeContext.Provider>;
}

// Custom hook to use the GradeContext
export function useGrade() {
  return useContext(GradeContext);
}
