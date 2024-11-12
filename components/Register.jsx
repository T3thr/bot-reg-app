import { useState } from 'react';
import styles from './Register.module.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [lineUserId, setLineUserId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, lineUserId }),
      });

      if (!response.ok) throw new Error('Error registering user.');
      
      const data = await response.json();
      setMessage(data.success ? 'Registration successful!' : data.error || 'Registration failed.');
    } catch (error) {
      console.error(error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
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
          onChange={(e) => setLineUserId(e.target.value)}
          className={styles.input}
          required
        />

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {message && <p className={`${styles.message} ${message.includes('successful') ? styles.success : styles.error}`}>{message}</p>}
    </div>
  );
}
