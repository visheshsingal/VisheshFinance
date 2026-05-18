import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    const ADMIN_USER = process.env.ADMIN_USER || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASS || 'adminpassword';

    if (!username || !password) {
      return Response.json({ message: 'Missing credentials' }, { status: 400 });
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = jwt.sign({ user: username }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
      return Response.json({ token });
    }

    return Response.json({ message: 'Invalid credentials' }, { status: 401 });
  } catch (err) {
    return Response.json({ message: 'Server error: ' + err.message }, { status: 500 });
  }
}
