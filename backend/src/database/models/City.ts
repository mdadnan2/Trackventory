import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
  name: string;
  createdAt: Date;
}

const citySchema = new Schema<ICity>({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

citySchema.index({ name: 1 });

export const City = mongoose.model<ICity>('City', citySchema);
