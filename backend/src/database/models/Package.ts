import mongoose, { Schema, Document } from 'mongoose';

export interface IPackageItem {
  itemId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IPackage extends Document {
  name: string;
  items: IPackageItem[];
  isActive: boolean;
  createdAt: Date;
}

const packageSchema = new Schema<IPackage>({
  name: { type: String, required: true },
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Package = mongoose.model<IPackage>('Package', packageSchema);
