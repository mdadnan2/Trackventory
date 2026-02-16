import mongoose, { Schema, Document } from 'mongoose';

export interface IVolunteerStockItem {
  itemId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IVolunteerStockAssignment extends Document {
  volunteerId: mongoose.Types.ObjectId;
  items: IVolunteerStockItem[];
  createdAt: Date;
}

const volunteerStockAssignmentSchema = new Schema<IVolunteerStockAssignment>({
  volunteerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const VolunteerStockAssignment = mongoose.model<IVolunteerStockAssignment>('VolunteerStockAssignment', volunteerStockAssignmentSchema);
