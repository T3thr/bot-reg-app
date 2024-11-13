'use client'
import { useState, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RegisterContext from '@/context/RegisterContext';
import styles from './Register.module.css';
import { FaArrowLeft } from 'react-icons/fa';

export default function Register() {
  const { lineUserId, loading, message, messageType, registerUser, clearMessage } = useContext(RegisterContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    clearMessage();
    await registerUser(username, password);
  };

  

  const goBackToLogin = () => {
    // Clear any existing message before navigating back to login
    setMessage('');
    setMessageType('');
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
