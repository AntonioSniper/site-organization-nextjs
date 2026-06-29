import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
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

async function writeUsers(data) {
  await fs.writeFile(usersFilePath, JSON.stringify(data, null, 2));
}

export async function POST(request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return Response.json({ error: 'Заполните все поля' }, { status: 400 });
  }

  const data = await readUsers();

  if (data.users.find(u => u.username === username)) {
    return Response.json({ error: 'Пользователь уже существует' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // ✅ Админом становится только пользователь с логином "admin"
  const isAdmin = username === 'admin';

  const newUser = {
    id: uuidv4(),
    username,
    password: hashedPassword,
    isAdmin: isAdmin
  };

  data.users.push(newUser);
  await writeUsers(data);

  const { password: _, ...userWithoutPassword } = newUser;
  return Response.json(userWithoutPassword, { status: 201 });
}