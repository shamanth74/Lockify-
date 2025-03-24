import mongoose,{Schema,Document, Types} from "mongoose";

interface IData extends Document{
    user_id:Types.ObjectId,
    site:string,
    password:string
}

const DataSchema:Schema=new Schema({
    user_id:{type:Types.ObjectId,required:true},
    site:{type:String,required:true},
    password:{type:String,required:true}
})

export default mongoose.models.Data || mongoose.model<IData>('data',DataSchema);