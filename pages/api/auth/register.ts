import { NextApiRequest,NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import Users from "@/models/Users";
import { connectDb } from "@/lib/mongo";
import {z} from 'zod';

const UserSchema=z.object({
    email:z.string().email({message:"Invalid email format"}),
    password:z.string().min(8,{message:"Password should contain atleast 8 characters"}),
    masterPassword:z.string().min(6,{message:"MasterPassword not strong"})
})

export default async function handler(req:NextApiRequest,res:NextApiResponse) {
    if(req.method=='POST'){
        try{
            await connectDb();
            const parsedData=UserSchema.parse(req.body);
            const { email, password, masterPassword } = parsedData;
            const existingUser=await Users.findOne({email});
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already registered' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const hashedMasterPassword = await bcrypt.hash(masterPassword, 10);

            const user = new Users({ email, password: hashedPassword, masterPassword: hashedMasterPassword });

            await user.save();

            res.status(201).json({ message: 'User registered successfully' });

        }
        catch (error) {
            console.error('Registration Error:', error);
        
            // ✅ Handle Zod Validation Errors
            if (error instanceof z.ZodError) {
              return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
            }
        
            res.status(500).json({ message: 'Registration failed' });
          }
    }
    else{
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
} 