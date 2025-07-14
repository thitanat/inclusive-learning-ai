import { NextResponse } from 'next/server';
import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser
} from '@/models/user';

// GET: /api/admin/users or /api/admin/users?id=xxx or /api/admin/users?email=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const email = searchParams.get('email');
  try {
    if (id) {
      const user = await getUserById(id);
      return NextResponse.json(user);
    } else if (email) {
      const user = await getUserByEmail(email);
      return NextResponse.json(user);
    } else {
      const users = await getAllUsers();
      return NextResponse.json(users);
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch user(s)' }, { status: 500 });
  }
}

// POST: /api/admin/users
export async function POST(request: Request) {
  const data = await request.json();
  try {
    const result = await createUser(data);
    return NextResponse.json({ insertedId: result.insertedId });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT: /api/admin/users
export async function PUT(request: Request) {
  const { id, ...updateData } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    const result = await updateUser(id, updateData);
    return NextResponse.json({ modifiedCount: result.modifiedCount });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE: /api/admin/users
export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    const result = await deleteUser(id);
    return NextResponse.json({ deletedCount: result.deletedCount });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
