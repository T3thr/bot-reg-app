'use client'
import { useState } from 'react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [lineUserId, setLineUserId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, lineUserId }),
    });
    const data = await response.json();
    setLoading(false);
    setMessage(data.success ? 'Registration successful!' : data.error);
  };

  return (
    <div className="register-container">
      <h1>Join Grade Tracker</h1>
      <p className="subtitle">Enter your credentials to start tracking your grades.</p>
      
      <form onSubmit={handleSubmit} className="register-form">
        <input 
          placeholder="Enter your Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          placeholder="Enter your LINE User ID"
          value={lineUserId}
          onChange={(e) => setLineUserId(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {message && <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}

      <style jsx>{`
        .register-container {
          max-width: 400px;
          margin: auto;
          padding: 20px;
          border-radius: 8px;
          background: #f9f9f9;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
          font-family: Arial, sans-serif;
        }
        h1 {
          color: #333;
          margin-bottom: 0.5em;
        }
        .subtitle {
          font-size: 0.9em;
          color: #555;
          margin-bottom: 1.5em;
        }
        .register-form {
          display: flex;
          flex-direction: column;
          gap: 1em;
        }
        input {
          padding: 0.75em;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1em;
          width: 100%;
        }
        button {
          padding: 0.75em;
          border: none;
          border-radius: 4px;
          background: #4CAF50;
          color: #fff;
          font-size: 1em;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:hover {
          background: #45a049;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .message {
          margin-top: 1em;
          font-size: 0.9em;
        }
        .success {
          color: #4CAF50;
        }
        .error {
          color: #e63946;
        }
      `}</style>
    </div>
  );
}
