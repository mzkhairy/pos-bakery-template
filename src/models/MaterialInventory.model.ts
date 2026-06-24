import { Schema, model, Document } from 'mongoose';

export interface IMaterialInventoryDoc extends Document {
  inventory_id: string;
  material_id: string;
  stock: number;
  reserved: number;
  unit: string;
  updated_at: Date;
}

const materialInventorySchema = new Schema<IMaterialInventoryDoc>(
  {
    inventory_id: { type: String, required: true, unique: true },
    material_id: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reserved: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'material_inventory',
    timestamps: false,
    versionKey: false,
  }
);

// Index untuk cepat query berdasarkan material_id
materialInventorySchema.index({ material_id: 1 });

export const MaterialInventoryModel = model<IMaterialInventoryDoc>(
  'MaterialInventory',
  materialInventorySchema
);
