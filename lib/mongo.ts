import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;


if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

export const connectDb=async ()=>{
    if(mongoose.connection.readyState>=1) return;
    await mongoose.connect(MONGODB_URI);
    console.log("Mongodb connection successful")
}