import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import Users from "@/models/Users";
import Data from "@/models/Data";
import { connectDb } from "@/lib/mongo";
import { decryptPassword } from "@/utils/encryption";
import { sendEmail } from "@/utils/email";
import bcrypt from "bcryptjs";
import mongoose from 'mongoose';

export async function DELETE(
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

    // Delete the password using the same ObjectId
    await Data.deleteOne({ 
      _id: new mongoose.Types.ObjectId(params.id),
      user_id: decoded.userId 
    });
    
    return NextResponse.json({ message: "Password deleted successfully" });

  } catch (error) {
    console.error("Error in DELETE:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
} 