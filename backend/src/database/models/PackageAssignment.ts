import mongoose, { Schema, Document } from 'mongoose';

export interface IPackageAssignment extends Document {
  packageId: mongoose.Types.ObjectId;
  volunteerId: mongoose.Types.ObjectId;
  quantity: number;
  assignedBy: mongoose.Types.ObjectId;
  assignedAt: Date;
  transactionIds: mongoose.Types.ObjectId[];
  requestId: string;
}

const packageAssignmentSchema = new Schema<IPackageAssignment>({
  packageId: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
  volunteerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true, min: 1 },
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAt: { type: Date, default: Date.now },
  transactionIds: [{ type: Schema.Types.ObjectId, ref: 'InventoryTransaction' }],
  requestId: { type: String, required: true, unique: true }
});

packageAssignmentSchema.index({ packageId: 1, volunteerId: 1 });
packageAssignmentSchema.index({ requestId: 1 });

export const PackageAssignment = mongoose.model<IPackageAssignment>('PackageAssignment', packageAssignmentSchema);
