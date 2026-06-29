'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/Auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [form, setForm] = useState({ title: '', author: '', year: '' });
  const [toast, setToast] = useState({ message: '', type: '' });

  // Проверка: только admin имеет доступ
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && !user.isAdmin) {
      router.push('/');
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
      setBooksLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchBooks();
    }
  }, [user]);

  const showToast = (message, type = '') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.year) {
      showToast('❌ Заполните все поля', 'error');
      return;
    }

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast('✅ Книга добавлена', 'success');
        setForm({ title: '', author: '', year: '' });
        fetchBooks();
      }
    } catch (error) {
      showToast('❌ Ошибка при добавлении', 'error');
    }
  };

  const deleteBook = async (id) => {
    if (!confirm('Удалить книгу?')) return;
    try {
      const res = await fetch('/api/books', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        showToast('✅ Книга удалена', 'success');
        fetchBooks();
      }
    } catch (error) {
      showToast('❌ Ошибка при удалении', 'error');
    }
  };

  const toggleAvailable = async (id, currentStatus) => {
    try {
      const res = await fetch('/api/books', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, available: !currentStatus, username: null })
      });
      if (res.ok) {
        showToast('✅ Статус обновлён', 'success');
        fetchBooks();
      }
    } catch (error) {
      showToast('❌ Ошибка обновления', 'error');
    }
  };

  if (loading || !user || !user.isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Arial, sans-serif' }}>
        <p>⛔ Доступ запрещён. Только для администратора.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{ background: '#1f2937', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', margin: '-20px -20px 20px -20px' }}>
        <h1 style={{ fontSize: '20px' }}>📚 Библиотека им. Я. Смелякова</h1>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Главная</Link>
          <Link href="/admin" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 'bold' }}>🔧 Админка</Link>
          <span style={{ color: 'white' }}>👤 {user.username} (админ)</span>
          <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}>
            Выйти
          </button>
        </div>
      </nav>

      <h1 style={{ borderBottom: '3px solid #3498db', paddingBottom: '10px' }}>📚 Админка библиотеки</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Управление книжным фондом</p>

      {/* ФОРМА ДОБАВЛЕНИЯ */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>➕ Добавить книгу</h3>
        <form onSubmit={addBook} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Название"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{ flex: 2, minWidth: '150px', padding: '10px', border: '2px solid #ddd', borderRadius: '6px' }}
          />
          <input
            type="text"
            placeholder="Автор"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            style={{ flex: 1, minWidth: '120px', padding: '10px', border: '2px solid #ddd', borderRadius: '6px' }}
          />
          <input
            type="number"
            placeholder="Год"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            style={{ width: '100px', padding: '10px', border: '2px solid #ddd', borderRadius: '6px' }}
          />
          <button type="submit" style={{ padding: '10px 25px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            ➕ Добавить
          </button>
        </form>
      </div>

      {/* ТАБЛИЦА КНИГ */}
      {booksLoading ? (
        <p>Загрузка книг...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
            <thead>
              <tr style={{ background: '#2c3e50', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Название</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Автор</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Год</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Статус</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Забронировал</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{book.title}</td>
                  <td style={{ padding: '12px' }}>{book.author}</td>
                  <td style={{ padding: '12px' }}>{book.year}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      background: book.available ? '#d4edda' : '#f8d7da',
                      color: book.available ? '#155724' : '#721c24'
                    }}>
                      {book.available ? '✅ Доступна' : '❌ Забронирована'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{book.bookedBy || '—'}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => toggleAvailable(book.id, book.available)}
                      style={{ padding: '5px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                    >
                      🔄
                    </button>
                    <button
                      onClick={() => deleteBook(book.id)}
                      style={{ padding: '5px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {books.length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Книг пока нет</p>}
        </div>
      )}

      {/* TOAST */}
      {toast.message && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          background: toast.type === 'success' ? '#27ae60' : '#e74c3c',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}