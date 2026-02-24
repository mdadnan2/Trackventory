import mongoose, { Schema, Document } from 'mongoose';

export interface IPackageDistribution extends Document {
  packageId: mongoose.Types.ObjectId;
  volunteerId: mongoose.Types.ObjectId;
  quantity: number;
  distributionDate: Date;
  location: {
    cityId?: mongoose.Types.ObjectId;
    areaId?: mongoose.Types.ObjectId;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  beneficiaryInfo: {
    name: string;
    phone?: string;
    familySize?: number;
    idProof?: string;
  };
  campaignId?: mongoose.Types.ObjectId;
  transactionIds: mongoose.Types.ObjectId[];
  requestId: string;
  createdAt: Date;
}

const packageDistributionSchema = new Schema<IPackageDistribution>({
  packageId: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
  volunteerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true, min: 1 },
  distributionDate: { type: Date, required: true },
  location: {
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: false },
    areaId: { type: Schema.Types.ObjectId, required: false },
    address: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  beneficiaryInfo: {
    name: { type: String, required: true },
    phone: { type: String },
    familySize: { type: Number },
    idProof: { type: String }
  },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
  transactionIds: [{ type: Schema.Types.ObjectId, ref: 'InventoryTransaction' }],
  requestId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

packageDistributionSchema.index({ packageId: 1, volunteerId: 1 });
packageDistributionSchema.index({ requestId: 1 });
packageDistributionSchema.index({ 'location.cityId': 1, 'location.areaId': 1 });

export const PackageDistribution = mongoose.model<IPackageDistribution>('PackageDistribution', packageDistributionSchema);
