import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import Users from "@/models/Users";
import Data from "@/models/Data";
import { connectDb } from "@/lib/mongo";
import { decryptPassword } from "@/utils/encryption";
import { sendEmail } from "@/utils/email";
import bcrypt from "bcryptjs";
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: Token missing" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { masterPassword } = await request.json();

    // Verify master password
    const user = await Users.findOne({ _id: decoded.userId });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(masterPassword, user.masterPassword);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid master password" }, { status: 401 });
    }

    let passwordData;
    try {
      // Convert string ID to MongoDB ObjectId
      const objectId = new mongoose.Types.ObjectId(params.id);
      passwordData = await Data.findOne({ 
        _id: objectId,
        user_id: decoded.userId 
      });
    } catch (error) {
      return NextResponse.json({ message: "Invalid password ID" }, { status: 400 });
    }
    
    if (!passwordData) {
      return NextResponse.json({ message: "Password not found" }, { status: 404 });
    }

    // Decrypt the stored password using the provided master password
    const decryptedPassword = decryptPassword(passwordData.password, masterPassword);
    if (!decryptedPassword) {
      return NextResponse.json({ message: "Failed to decrypt password" }, { status: 500 });
    }

    // Try to send email notification, but don't fail if it doesn't work
    try {
      await sendEmail(
        user.email,
        "Password Viewed Notification",
        `Your password for ${passwordData.site} was viewed at ${new Date().toLocaleString()}. If this wasn't you, please take necessary actions.`
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue with the response even if email fails
    }

    return NextResponse.json({ password: decryptedPassword });

  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
} 