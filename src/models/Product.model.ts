import { Schema, model, Document } from 'mongoose';

export interface IProductDoc extends Document {
  product_id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const productSchema = new Schema<IProductDoc>(
  {
    product_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'products',
    timestamps: false,
    versionKey: false,
  }
);

export const ProductModel = model<IProductDoc>('Product', productSchema);
