import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import Users from "@/models/Users";
import Data from "@/models/Data";
import { connectDb } from "@/lib/mongo";
import bcrypt from "bcryptjs";

export async function DELETE(req: NextRequest) {
  try {
    await connectDb();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: Token missing" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { masterPassword } = await req.json();

    const user = await Users.findOne({ _id: decoded.userId });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify master password
    const isMatch = await bcrypt.compare(masterPassword, user.masterPassword);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid master password" }, { status: 401 });
    }

    // Delete all passwords associated with the user
    await Data.deleteMany({ user_id: decoded.userId });

    // Delete the user account
    await Users.deleteOne({ _id: decoded.userId });

    // Clear the token cookie
    const response = NextResponse.json({ message: "Account deleted successfully" });
    response.cookies.delete("token");

    return response;

  } catch (error) {
    console.error("Error in DELETE:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
} 