import mongoose, { Schema, Document } from 'mongoose';

export interface IPackageItem {
  itemId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IPackage extends Document {
  name: string;
  description?: string;
  items: IPackageItem[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IPackage>({
  name: { type: String, required: true },
  description: { type: String },
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

packageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Package = mongoose.model<IPackage>('Package', packageSchema);
