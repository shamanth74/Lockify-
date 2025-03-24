import { NextRequest,NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Users from "@/models/Users";
import { connectDb } from "@/lib/mongo";
import { generateToken } from "@/lib/jwt";


export async function POST(req:NextRequest){
    try{
        await connectDb();
        const {email,password}=await req.json();

        const user=await Users.findOne({email})
        if(!user) return NextResponse.json({message:"User Dosen't exist"});

        const isMatch=await bcrypt.compare(password,user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
        }
        const token=generateToken(user._id.toString())
        const response= NextResponse.json({ message: 'Login successfull',token }, { status: 201 });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, 
    });
    return response;
    }
    catch(err){
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

