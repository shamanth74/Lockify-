import mongoose,{Schema,Document} from "mongoose";

interface Iuser extends Document{
    email:string;
    password:string;
    masterPassword:string;
}

const UserSchema:Schema=new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    masterPassword: { type: String, required: true } 
})

export default mongoose.models.User || mongoose.model<Iuser>('User', UserSchema);