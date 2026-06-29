'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/Auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyBookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  const showToast = (message, type = '') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const returnBook = async (id) => {
    try {
      const book = books.find(b => b.id === id);
      if (!book || book.available) {
        showToast('❌ Книга уже доступна', 'error');
        return;
      }
      if (book.bookedBy !== user.username) {
        showToast('❌ Вы не можете вернуть эту книгу', 'error');
        return;
      }
      const res = await fetch('/api/books', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, available: true, username: null })
      });
      if (res.ok) {
        showToast(`✅ Книга «${book.title}» возвращена!`, 'success');
        fetchBooks();
      }
    } catch (error) {
      showToast('❌ Ошибка', 'error');
    }
  };

  const myBookings = books.filter(b => b.bookedBy === user?.username);

  if (loading || !user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Arial, sans-serif' }}>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Arial, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{ background: '#1f2937', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '20px' }}>📚 Библиотека им. Я. Смелякова</h1>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Главная</Link>
          <Link href="/my-bookings" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 'bold' }}>📖 Мои брони</Link>
          {user.isAdmin && (
            <Link href="/admin" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>🔧 Админка</Link>
          )}
          <span style={{ color: 'white' }}>👤 {user.username}</span>
          <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}>
            Выйти
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <h1 style={{ borderBottom: '3px solid #3498db', paddingBottom: '15px', marginBottom: '20px' }}>
            📖 Мои брони
          </h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Книги, которые вы забронировали
          </p>

          {loadingBooks ? (
            <p>Загрузка...</p>
          ) : myBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ fontSize: '20px', marginBottom: '10px' }}>📭</p>
              <p style={{ color: '#999' }}>У вас пока нет забронированных книг</p>
              <Link href="/" style={{ color: '#3498db', textDecoration: 'none', marginTop: '10px', display: 'inline-block' }}>
                → Перейти к каталогу книг
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {myBookings.map(book => (
                <div key={book.id} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '2px solid #3498db' }}>
                  <h3 style={{ marginBottom: '8px', color: '#1f2937' }}>{book.title}</h3>
                  <div style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '5px' }}>✍️ {book.author}</div>
                  <div style={{ color: '#95a5a6', fontSize: '13px', marginBottom: '10px' }}>📅 {book.year}</div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    background: '#f8d7da',
                    color: '#721c24'
                  }}>
                    📌 Забронирована вами
                  </span>
                  <br />
                  <button
                    onClick={() => returnBook(book.id)}
                    style={{ padding: '8px 18px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    🔄 Вернуть книгу
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast.message && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          background: toast.type === 'success' ? '#22c55e' : '#ef4444',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          {toast.message}
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '20px', color: '#777', maxWidth: '1100px', margin: '30px auto 0' }}>
        <p>© 2025 Библиотека-общественный центр им. Я. Смелякова</p>
      </footer>
    </div>
  );
}