import mongoose, { Schema, Document } from 'mongoose';

export interface IData extends Document {
  user_id: mongoose.Types.ObjectId;
  site: string;
  username?: string;
  password: string;
}

const DataSchema = new Schema<IData>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  site: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Check if the model exists before creating a new one
const Data = mongoose.models.Data || mongoose.model<IData>('Data', DataSchema);

export default Data;