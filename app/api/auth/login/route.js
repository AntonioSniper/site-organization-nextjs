import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

async function readUsers() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return { users: [] };
  }
}

export async function POST(request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return Response.json({ error: 'Заполните все поля' }, { status: 400 });
  }

  const data = await readUsers();
  const user = data.users.find(u => u.username === username);

  if (!user) {
    return Response.json({ error: 'Пользователь не найден' }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return Response.json({ error: 'Неверный пароль' }, { status: 401 });
  }

  const { password: _, ...userWithoutPassword } = user;
  return Response.json(userWithoutPassword);
}