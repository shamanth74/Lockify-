import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import Users from '@/models/Users';
import { connectDb } from '@/lib/mongo';
import { z } from 'zod';
import { generateToken } from '@/lib/jwt';

const UserSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(8, { message: 'Password should contain at least 8 characters' }),
  masterPassword: z.string().min(6, { message: 'MasterPassword not strong enough' }),
});

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const parsedData = UserSchema.parse(body);
    const { email, password, masterPassword } = parsedData;

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Email is already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedMasterPassword = await bcrypt.hash(masterPassword, 10);

    const user = new Users({ email, password: hashedPassword, masterPassword: hashedMasterPassword });
    await user.save();
    const token=generateToken(user._id.toString())
    return NextResponse.json({ message: 'User registered successfully',token }, { status: 201 });
  } 
  catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors.map(e => e.message).join(', ') }, { status: 400 });
    }

    return NextResponse.json({ message: 'Registration failed' }, { status: 500 });
  }
}
