import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import Users from "@/models/Users";
import Data from "@/models/Data";
import { decryptPassword } from "@/utils/encryption";
import { connectDb } from "@/lib/mongo";
import { sendEmail } from "@/utils/email";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    // Token from cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: Token missing" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Extract query params
    const url = new URL(req.url);
    const site = url.searchParams.get('site');
    const encryptedPassword = url.searchParams.get('encryptedPassword');

    if (!site || !encryptedPassword) {
      return NextResponse.json({ message: "Missing site or encrypted password" }, { status: 400 });
    }

    // Read master password from JSON body
    const { masterPassword } = await req.json();
    if (!masterPassword) {
      return NextResponse.json({ message: "Master Password is required" }, { status: 400 });
    }

    // Validate user
    const existingUser = await Users.findOne({ _id: decoded.userId });
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find the data for the given site and encrypted password
    const data = await Data.findOne({ user_id: decoded.userId, site, password: encryptedPassword });
    if (!data) {
      return NextResponse.json({ message: "No matching data found" }, { status: 404 });
    }

    // Decrypt the password using the provided master password
    const decryptedPassword = decryptPassword(encryptedPassword, masterPassword);
    if (!decryptedPassword) {
      return NextResponse.json({ message: "Failed to decrypt password. Invalid master password." }, { status: 403 });
    }
    await sendEmail(existingUser.email, "Password Viewed Notification", `Your password for ${site} was viewed.If not You Take necessary Actions`);
    return NextResponse.json({ decryptedPassword }, { status: 200 });

  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
