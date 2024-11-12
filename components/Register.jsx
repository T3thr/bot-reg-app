'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Register.module.css';
import { FaArrowLeft } from 'react-icons/fa';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [lineUserId, setLineUserId] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // For success/error message styling
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Retrieve lineUserId from localStorage when the component mounts
    const storedUserId = localStorage.getItem('lineUserId');
    if (storedUserId) {
      setLineUserId(storedUserId);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, lineUserId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Registration successful!');
        setMessageType('success');
      } else {
        setMessage(data.error || 'Registration failed.');
        setMessageType('error');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => {
    router.push('/');
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
            disabled
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
