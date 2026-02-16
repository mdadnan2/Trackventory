import mongoose, { Schema, Document } from 'mongoose';

export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface ICampaign extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
  createdAt: Date;
}

const campaignSchema = new Schema<ICampaign>({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: Object.values(CampaignStatus), default: CampaignStatus.ACTIVE },
  createdAt: { type: Date, default: Date.now }
});

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);
