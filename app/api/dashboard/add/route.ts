import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Data from "@/models/Data";
import { connectDb } from "@/lib/mongo";
import jwt from "jsonwebtoken";
import Users from "@/models/Users";
import { Types } from "mongoose";
import { encryptPassword } from "@/utils/encryption";

export async function POST(req: NextRequest) {
  try {
      const token = req.cookies.get("token")?.value;
      
      if (!token) {
          return NextResponse.json({ message: "Unauthorized: Token missing" }, { status: 401 });
        }
    await connectDb();

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = new Types.ObjectId(decoded.userId);
    const existingUser = await Users.findOne({ _id: decoded.userId });
    const { site, password, masterPassword } = await req.json();
    const match=await bcrypt.compare(masterPassword,existingUser.masterPassword)
    if (existingUser && match) {
        // Encrypt the password using master password
        const { encryptedPassword } = encryptPassword(password, masterPassword);
        const data = new Data({ user_id: userId, site, password: encryptedPassword });
      await data.save();
      return NextResponse.json({ message: "Password added successfully" }, { status: 200 });
    }
    return NextResponse.json({ message: "Wrong Master Password"}, { status: 404 });
  } catch (err:any) {
    if (err instanceof jwt.JsonWebTokenError) {
        return NextResponse.json({message:"Unauthorized: Invalid token"},{status:401})
    }
    console.error("Error in POST:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}