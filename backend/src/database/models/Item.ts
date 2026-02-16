import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  name: string;
  category: string;
  unit: string;
  isActive: boolean;
  createdAt: Date;
}

const itemSchema = new Schema<IItem>({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

itemSchema.index({ name: 1 });

export const Item = mongoose.model<IItem>('Item', itemSchema);
