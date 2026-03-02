import mongoose, { Schema, Document } from 'mongoose';

export interface IDistributionItem {
  itemId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IDistribution extends Document {
  volunteerId: mongoose.Types.ObjectId;
  state: string;
  city: string;
  pinCode: string;
  area: string;
  campaignId?: mongoose.Types.ObjectId;
  items: IDistributionItem[];
  beneficiaryName?: string;
  beneficiaryPhone?: string;
  isPackage?: boolean;
  packageName?: string;
  packageQuantity?: number;
  requestId: string;
  createdAt: Date;
}

const distributionSchema = new Schema<IDistribution>({
  volunteerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  pinCode: { type: String, required: true },
  area: { type: String, required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  beneficiaryName: { type: String },
  beneficiaryPhone: { type: String },
  isPackage: { type: Boolean, default: false },
  packageName: { type: String },
  packageQuantity: { type: Number },
  requestId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

distributionSchema.index({ volunteerId: 1 });
distributionSchema.index({ state: 1 });
distributionSchema.index({ city: 1 });
distributionSchema.index({ city: 1, area: 1 });
distributionSchema.index({ campaignId: 1 });
distributionSchema.index({ createdAt: -1 });

export const Distribution = mongoose.model<IDistribution>('Distribution', distributionSchema);
