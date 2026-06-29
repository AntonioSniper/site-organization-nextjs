import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dataFilePath = path.join(process.cwd(), 'data', 'books.json');

async function readData() {
  const data = await fs.readFile(dataFilePath, 'utf8');
  return JSON.parse(data);
}

async function writeData(data) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

// GET — получить все книги
export async function GET() {
  const data = await readData();
  return Response.json(data.books);
}

// POST — добавить книгу
export async function POST(request) {
  const { title, author, year } = await request.json();
  const data = await readData();

  const newBook = {
    id: uuidv4(),
    title,
    author,
    year: parseInt(year),
    available: true,
    bookedBy: null
  };

  data.books.push(newBook);
  await writeData(data);

  return Response.json(newBook, { status: 201 });
}

// PUT — обновить книгу (бронирование/возврат)
export async function PUT(request) {
  const { id, available, username } = await request.json();
  const data = await readData();

  const book = data.books.find(b => b.id === id);
  if (!book) {
    return Response.json({ error: 'Книга не найдена' }, { status: 404 });
  }

  book.available = available;
  book.bookedBy = available ? null : username;

  await writeData(data);
  return Response.json(book);
}

// DELETE — удалить книгу
export async function DELETE(request) {
  const { id } = await request.json();
  const data = await readData();

  data.books = data.books.filter(b => b.id !== id);
  await writeData(data);

  return Response.json({ success: true });
}