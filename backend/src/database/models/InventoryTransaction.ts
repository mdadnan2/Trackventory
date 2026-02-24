import mongoose, { Schema, Document } from 'mongoose';

export enum TransactionType {
  STOCK_IN = 'STOCK_IN',
  ISSUE_TO_VOLUNTEER = 'ISSUE_TO_VOLUNTEER',
  DISTRIBUTION = 'DISTRIBUTION',
  DAMAGE = 'DAMAGE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN_TO_CENTRAL = 'RETURN_TO_CENTRAL',
  CENTRAL_DISTRIBUTION = 'CENTRAL_DISTRIBUTION',
  CENTRAL_DAMAGE = 'CENTRAL_DAMAGE',
  VOLUNTEER_TRANSFER = 'VOLUNTEER_TRANSFER'
}

export enum TransactionDirection {
  IN = 'IN',
  OUT = 'OUT'
}

export interface IInventoryTransaction extends Document {
  itemId: mongoose.Types.ObjectId;
  type: TransactionType;
  direction: TransactionDirection;
  quantity: number;
  referenceType?: string;
  referenceId?: mongoose.Types.ObjectId | string;
  packageAssignmentId?: mongoose.Types.ObjectId;
  packageDistributionId?: mongoose.Types.ObjectId;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const inventoryTransactionSchema = new Schema<IInventoryTransaction>({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  type: { type: String, enum: Object.values(TransactionType), required: true },
  direction: { type: String, enum: Object.values(TransactionDirection), required: true },
  quantity: { type: Number, required: true, min: 1 },
  referenceType: { type: String },
  referenceId: { type: Schema.Types.Mixed },
  packageAssignmentId: { type: Schema.Types.ObjectId, ref: 'PackageAssignment' },
  packageDistributionId: { type: Schema.Types.ObjectId, ref: 'PackageDistribution' },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

inventoryTransactionSchema.index({ itemId: 1, createdAt: -1 });
inventoryTransactionSchema.index({ performedBy: 1 });
inventoryTransactionSchema.index({ referenceId: 1 });

export const InventoryTransaction = mongoose.model<IInventoryTransaction>('InventoryTransaction', inventoryTransactionSchema);
