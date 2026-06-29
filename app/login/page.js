'use client';

import { useState } from 'react';
import { useAuth } from '../components/Auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🔐 Вход</h2>
      {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '6px', marginBottom: '12px' }}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '6px', marginBottom: '12px' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Загрузка...' : 'Войти'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Нет аккаунта? <Link href="/register" style={{ color: '#3498db' }}>Зарегистрироваться</Link>
      </p>
    </div>
  );
}