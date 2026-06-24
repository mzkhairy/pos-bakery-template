import { Schema, model, Document } from 'mongoose';

export interface IMaterialDoc extends Document {
  material_id: string;
  name: string;
  unit: string;
  cost_per_unit: number;
  is_active: boolean;
}

const materialSchema = new Schema<IMaterialDoc>(
  {
    material_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    cost_per_unit: { type: Number, required: true, min: 0 },
    is_active: { type: Boolean, default: true },
  },
  {
    collection: 'materials',
    timestamps: false,
    versionKey: false,
  }
);

export const MaterialModel = model<IMaterialDoc>('Material', materialSchema);
