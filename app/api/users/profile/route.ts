import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import Users from "@/models/Users";
import { connectDb } from "@/lib/mongo";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: Token missing" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await Users.findOne({ _id: decoded.userId }).select('email lastLogin');

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: user.email,
      lastLogin: user.lastLogin || new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
} 