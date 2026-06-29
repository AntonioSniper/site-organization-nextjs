'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './components/Auth';
import Link from 'next/link';

export default function Home() {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const showToast = (message, type = '') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  // Бронирование
  const bookBook = async (id) => {
    if (!user) {
      showToast('❌ Войдите в аккаунт для бронирования', 'error');
      return;
    }
    try {
      const book = books.find(b => b.id === id);
      if (!book || !book.available) {
        showToast('❌ Книга уже забронирована', 'error');
        return;
      }
      const res = await fetch('/api/books', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, available: false, username: user.username })
      });
      if (res.ok) {
        showToast(`✅ Книга «${book.title}» забронирована!`, 'success');
        fetchBooks();
      }
    } catch (error) {
      showToast('❌ Ошибка', 'error');
    }
  };

  // Возврат
  const returnBook = async (id) => {
    if (!user) {
      showToast('❌ Войдите в аккаунт для возврата', 'error');
      return;
    }
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

  const filteredBooks = books.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Arial, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{ background: '#1f2937', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '20px' }}>📚 Библиотека им. Я. Смелякова</h1>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Главная</Link>
          {user && (
            <Link href="/my-bookings" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>📖 Мои брони</Link>
          )}
          {user?.isAdmin && (
            <Link href="/admin" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>🔧 Админка</Link>
          )}
          {user ? (
            <>
              <span style={{ color: 'white' }}>👤 {user.username}</span>
              <button onClick={logout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Войти</Link>
              <Link href="/register" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Регистрация</Link>
            </>
          )}
        </div>
      </nav>

      {/* HEADER */}
      <header style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ background: '#1f2937', color: 'white', padding: '40px 20px', textAlign: 'center', borderRadius: '12px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>📚 Библиотека-общественный центр им. Я. Смелякова</h1>
          <p style={{ fontSize: '18px', opacity: 0.8 }}>г. Дзержинский, Московская область</p>
        </div>
      </header>

      {/* КНИГИ */}
      <section style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <h2 style={{ borderLeft: '5px solid #3b82f6', paddingLeft: '15px', marginBottom: '20px' }}>📖 Книжный фонд</h2>

          <input
            type="text"
            placeholder="🔍 Поиск по названию или автору..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 15px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', marginBottom: '20px' }}
          />

          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Загрузка...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
              {filteredBooks.map(book => (
                <div key={book.id} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ marginBottom: '8px' }}>{book.title}</h3>
                  <div style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '5px' }}>✍️ {book.author}</div>
                  <div style={{ color: '#95a5a6', fontSize: '13px', marginBottom: '10px' }}>📅 {book.year}</div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    background: book.available ? '#d4edda' : '#f8d7da',
                    color: book.available ? '#155724' : '#721c24'
                  }}>
                    {book.available ? '✅ Доступна' : '❌ Забронирована'}
                  </span>
                  <br />
                  {book.available ? (
                    <button onClick={() => bookBook(book.id)} style={{ padding: '8px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                      📥 Забронировать
                    </button>
                  ) : (
                    <button onClick={() => returnBook(book.id)} style={{ padding: '8px 18px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                      🔄 Вернуть
                    </button>
                  )}
                  {!book.available && book.bookedBy && (
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                      Забронировал: {book.bookedBy}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {!loading && filteredBooks.length === 0 && (
            <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>Книг не найдено</p>
          )}
        </div>
      </section>

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