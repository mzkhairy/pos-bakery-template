import { Schema, model, Document } from 'mongoose';

export interface IProductInventoryDoc extends Document {
  inventory_id: string;
  product_id: string;
  stock: number;
  unit: string;
  updated_at: Date;
}

const productInventorySchema = new Schema<IProductInventoryDoc>(
  {
    inventory_id: { type: String, required: true, unique: true },
    product_id: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'product_inventory',
    timestamps: false,
    versionKey: false,
  }
);

productInventorySchema.index({ product_id: 1 });

export const ProductInventoryModel = model<IProductInventoryDoc>(
  'ProductInventory',
  productInventorySchema
);
