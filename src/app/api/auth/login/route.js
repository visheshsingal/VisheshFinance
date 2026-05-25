import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    const ADMIN_USER = process.env.ADMIN_USER || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASS || 'adminpassword';

    const rawUserCreds = process.env.USER_CREDENTIALS || '';
    const envUser = process.env.USER_USER && process.env.USER_PASS
      ? [{ username: process.env.USER_USER, password: process.env.USER_PASS }]
      : [];

    const userCredentials = rawUserCreds
      .split(',')
      .map(pair => pair.split(':').map(value => value.trim()))
      .filter(([u, p]) => u && p)
      .map(([username, password]) => ({ username, password }))
      .concat(envUser);

    const DEFAULT_USER = { username: 'user', password: 'userpassword' };
    const users = userCredentials.length ? userCredentials : [DEFAULT_USER];

    if (!username || !password) {
      return Response.json({ message: 'Missing credentials' }, { status: 400 });
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = jwt.sign({ user: username, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
      return Response.json({ token, role: 'admin' });
    }

    const matchedUser = users.find(user => user.username === username && user.password === password);
    if (matchedUser) {
      const token = jwt.sign({ user: username, role: 'user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
      return Response.json({ token, role: 'user' });
    }

    return Response.json({ message: 'Invalid credentials' }, { status: 401 });
  } catch (err) {
    return Response.json({ message: 'Server error: ' + err.message }, { status: 500 });
  }
}
