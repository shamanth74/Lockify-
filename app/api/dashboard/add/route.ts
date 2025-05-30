import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import Users from "@/models/Users";
import Data from "@/models/Data";
import { connectDb } from "@/lib/mongo";
import { encryptPassword } from "@/utils/encryption";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: Token missing" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { site, username, password, masterPassword } = await req.json();

    const existingUser = await Users.findOne({ _id: decoded.userId });
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify master password first
    const isMatch = await bcrypt.compare(masterPassword, existingUser.masterPassword);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid master password" }, { status: 401 });
    }

    // Encrypt the password using the verified master password
    const { encryptedPassword } = encryptPassword(password, masterPassword);

    // Create new password entry
    const newPassword = new Data({
      user_id: decoded.userId,
      site,
      username,
      password: encryptedPassword,
    });

    await newPassword.save();
    return NextResponse.json({ message: "Password added successfully" });

  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}