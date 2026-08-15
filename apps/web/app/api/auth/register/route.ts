import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  // Demo mode: registration succeeds but users are not persisted.
  // Connect a database (PostgreSQL + Prisma) for production persistence.
  return NextResponse.json({ message: 'Account created successfully', user: { name, email } });
}
