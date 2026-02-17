import mongoose, { Schema, Document } from 'mongoose';

export interface IDistributionItem {
  itemId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IDistribution extends Document {
  volunteerId: mongoose.Types.ObjectId;
  cityId: mongoose.Types.ObjectId;
  area: string;
  campaignId?: mongoose.Types.ObjectId;
  items: IDistributionItem[];
  requestId: string;
  createdAt: Date;
}

const distributionSchema = new Schema<IDistribution>({
  volunteerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
  area: { type: String, required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  requestId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

distributionSchema.index({ volunteerId: 1 });
distributionSchema.index({ cityId: 1 });
distributionSchema.index({ cityId: 1, area: 1 });
distributionSchema.index({ campaignId: 1 });
distributionSchema.index({ createdAt: -1 });

export const Distribution = mongoose.model<IDistribution>('Distribution', distributionSchema);
