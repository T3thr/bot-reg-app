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

  import { NextResponse } from 'next/server';
  import mongodbConnect from '@/backend/lib/mongodb';
  import User from '@/backend/models/User';
  
  export async function POST(req) {
    try {
      await mongodbConnect();
      const { username, password, lineUserId } = await req.json();
  
      // Check if the user with the provided LINE User ID already exists
      const existingUser = await User.findOne({ lineUserId });
      if (existingUser) {
        return NextResponse.json({ error: 'User already registered.' }, { status: 400 });
      }
  
      // Create a new user in the database
      const newUser = new User({ username, password, lineUserId });
      await newUser.save();
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Registration error:', error);
      return NextResponse.json({ error: 'Error registering user.' }, { status: 500 });
    }
  }  

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
