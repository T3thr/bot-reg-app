'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Register.module.css';
import { FaArrowLeft } from 'react-icons/fa';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [lineUserId, setLineUserId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const storedUserId = localStorage.getItem('lineUserId');
    const liffParams = JSON.parse(localStorage.getItem('liffParams'));
    if (storedUserId) setLineUserId(storedUserId);

    // Check if query params exist to keep them in the URL
    if (liffParams) {
      const queryString = new URLSearchParams(liffParams).toString();
      router.replace(`/register?${queryString}`);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, lineUserId }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Registration successful!');
      } else {
        setMessage(data.error || 'Registration failed.');
      }
    } catch (error) {
      setMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => {
    const liffParams = JSON.parse(localStorage.getItem('liffParams'));
    const queryString = new URLSearchParams(liffParams).toString();
    router.push(`/?${queryString}`);
  };


  return (
    <div className={styles.container}>
      <div className={styles.registerBox}>
        <button className={styles.goBackButton} onClick={goBackToLogin}>
          <FaArrowLeft className={styles.icon} />
        </button>
        <h1 className={styles.title}>Join Grade Tracker</h1>
        <p className={styles.subtitle}>Enter your credentials to start tracking your grades.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="text"
            placeholder="LINE User ID"
            value={lineUserId}
            onChange={(e) => setLineUserId(e.target.value)} // Allow change if needed
            className={styles.input}
            required
          />

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {message && (
          <p className={`${styles.message} ${messageType === 'success' ? styles.success : styles.error}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
