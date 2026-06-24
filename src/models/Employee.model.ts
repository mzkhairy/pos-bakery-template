import { Schema, model, Document } from 'mongoose';

export interface IEmployeeDoc extends Document {
  employee_id: string;
  name: string;
  role: 'manager' | 'kasir' | 'produksi' | 'gudang';
  shift: 'pagi' | 'siang' | 'malam';
  salary: number;
  created_at: Date;
  updated_at: Date;
}

const employeeSchema = new Schema<IEmployeeDoc>(
  {
    employee_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['manager', 'kasir', 'produksi', 'gudang'],
      required: true,
    },
    shift: {
      type: String,
      enum: ['pagi', 'siang', 'malam'],
      required: true,
    },
    salary: { type: Number, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'employees',
    timestamps: false,
    versionKey: false,
  }
);

employeeSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

export const EmployeeModel = model<IEmployeeDoc>('Employee', employeeSchema);
