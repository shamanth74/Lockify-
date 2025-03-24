import { NextRequest, NextResponse } from 'next/server';
import jwt  from 'jsonwebtoken';
import { authMiddleware } from '@/lib/authMiddleware';

export async function GET(req: NextRequest) {
    const authError = await authMiddleware(req);
    if (authError) return authError;
    
    
    return NextResponse.json({ message: 'Welcome to the Dashboard!' }, { status: 200 });
}