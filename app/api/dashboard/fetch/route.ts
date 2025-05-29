import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import Users from "@/models/Users";
import Data from "@/models/Data";
import { decryptPassword } from "@/utils/encryption";
import { connectDb } from "@/lib/mongo";
import { sendEmail } from "@/utils/email";

interface PasswordResponse {
  id: string;
  _id: string;
  site: string;
  username?: string;
  password: string;
}

interface MongoPassword {
  _id: { toString(): string };
  site: string;
  username?: string;
  password: string;
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "Unauthorized: Token missing" }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Validate user
    const existingUser = await Users.findOne({ _id: decoded.userId });
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Fetch all passwords for the user
    const passwords = await Data.find({ user_id: decoded.userId })
      .select('site username password')
      .lean() as unknown as MongoPassword[];
    
    const formattedPasswords: PasswordResponse[] = passwords.map(p => ({
      id: p._id.toString(),
      _id: p._id.toString(),
      site: p.site,
      username: p.username,
      password: '********' // Masked password
    }));

    return NextResponse.json({ passwords: formattedPasswords });

  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    // Token from cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: Token missing" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { masterPassword } = await req.json();

    // Validate user
    const existingUser = await Users.findOne({ _id: decoded.userId });
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // If no master password provided, return list of passwords without decrypted values
    if (!masterPassword) {
      const passwords = await Data.find({ user_id: decoded.userId })
        .select('site username password')
        .lean() as unknown as MongoPassword[];
      
      return NextResponse.json({ 
        passwords: passwords.map(p => ({
          id: p._id.toString(),
          _id: p._id.toString(),
          site: p.site,
          username: p.username,
          password: '********' // Masked password
        }))
      });
    }

    // If master password provided, decrypt and return the actual password
    const url = new URL(req.url);
    const site = url.searchParams.get('site');
    const encryptedPassword = url.searchParams.get('encryptedPassword');

    if (!site || !encryptedPassword) {
      return NextResponse.json({ message: "Missing site or encrypted password" }, { status: 400 });
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

    await sendEmail(existingUser.email, "Password Viewed Notification", `Your password for ${site} was viewed. If not you, take necessary actions.`);
    return NextResponse.json({ decryptedPassword }, { status: 200 });

  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
