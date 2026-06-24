import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import {
  EmployeeModel,
  MaterialModel,
  MaterialInventoryModel,
  ProductModel,
  ProductInventoryModel
} from './models';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const BRANCH_ID = process.env.BRANCH_ID;
const BRANCH_CODE = process.env.BRANCH_CODE;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is missing in environment variables. Please check your .env file.');
}

if (!BRANCH_ID || !BRANCH_CODE) {
  console.warn('BRANCH_ID or BRANCH_CODE is missing. Defaulting to empty strings, but it is recommended to provide them.');
}

// ==========================================
// MASTER DATA (Sama untuk semua cabang)
// ==========================================

const employees = [
  { employee_id: 'EMP001', name: 'Budi Santoso', role: 'manager', shift: 'pagi', salary: 5000000 },
  { employee_id: 'EMP002', name: 'Ani Wijaya', role: 'kasir', shift: 'pagi', salary: 3000000 },
  { employee_id: 'EMP003', name: 'Cici Sari', role: 'produksi', shift: 'pagi', salary: 4000000 },
  { employee_id: 'EMP004', name: 'Dodi Pratama', role: 'gudang', shift: 'pagi', salary: 3500000 },
];

const materials = [
  { material_id: 'MAT001', name: 'Tepung Terigu', unit: 'kg', cost_per_unit: 12000 },
  { material_id: 'MAT002', name: 'Gula Pasir', unit: 'kg', cost_per_unit: 14000 },
  { material_id: 'MAT003', name: 'Mentega', unit: 'kg', cost_per_unit: 35000 },
  { material_id: 'MAT004', name: 'Telur Ayam', unit: 'kg', cost_per_unit: 26000 },
  { material_id: 'MAT005', name: 'Ragi Instan', unit: 'bungkus', cost_per_unit: 5000 },
];

const products = [
  { product_id: 'PRD001', name: 'Roti Tawar', category: 'Roti', price: 15000, cost: 8000 },
  { product_id: 'PRD002', name: 'Roti Cokelat', category: 'Roti Manis', price: 10000, cost: 5000 },
  { product_id: 'PRD003', name: 'Croissant', category: 'Pastry', price: 20000, cost: 10000 },
];

// ==========================================
// INVENTORY CONFIGURATION (Per Cabang)
// ==========================================

type BranchConfig = {
  materials: { material_id: string; stock: number; unit: string }[];
  products: { product_id: string; stock: number; unit: string }[];
};

const inventoryConfig: Record<string, BranchConfig> = {
  bekasi: {
    materials: [
      { material_id: 'MAT001', stock: 100, unit: 'kg' },
      { material_id: 'MAT002', stock: 80, unit: 'kg' },
      { material_id: 'MAT003', stock: 60, unit: 'kg' },
      { material_id: 'MAT004', stock: 50, unit: 'kg' },
      { material_id: 'MAT005', stock: 100, unit: 'bungkus' },
    ],
    products: [
      { product_id: 'PRD001', stock: 30, unit: 'pcs' },
      { product_id: 'PRD002', stock: 50, unit: 'pcs' },
      { product_id: 'PRD003', stock: 20, unit: 'pcs' },
    ]
  },
  jakarta: {
    materials: [
      { material_id: 'MAT001', stock: 50, unit: 'kg' },
      { material_id: 'MAT002', stock: 40, unit: 'kg' },
      { material_id: 'MAT003', stock: 30, unit: 'kg' },
      { material_id: 'MAT004', stock: 25, unit: 'kg' },
      { material_id: 'MAT005', stock: 50, unit: 'bungkus' },
    ],
    products: [
      { product_id: 'PRD001', stock: 15, unit: 'pcs' },
      { product_id: 'PRD002', stock: 25, unit: 'pcs' },
      { product_id: 'PRD003', stock: 10, unit: 'pcs' },
    ]
  },
  bandung: {
    materials: [
      { material_id: 'MAT001', stock: 120, unit: 'kg' },
      { material_id: 'MAT002', stock: 90, unit: 'kg' },
      { material_id: 'MAT003', stock: 70, unit: 'kg' },
      { material_id: 'MAT004', stock: 60, unit: 'kg' },
      { material_id: 'MAT005', stock: 150, unit: 'bungkus' },
    ],
    products: [
      { product_id: 'PRD001', stock: 40, unit: 'pcs' },
      { product_id: 'PRD002', stock: 60, unit: 'pcs' },
      { product_id: 'PRD003', stock: 30, unit: 'pcs' },
    ]
  },
  semarang: {
    materials: [
      { material_id: 'MAT001', stock: 80, unit: 'kg' },
      { material_id: 'MAT002', stock: 60, unit: 'kg' },
      { material_id: 'MAT003', stock: 45, unit: 'kg' },
      { material_id: 'MAT004', stock: 40, unit: 'kg' },
      { material_id: 'MAT005', stock: 80, unit: 'bungkus' },
    ],
    products: [
      { product_id: 'PRD001', stock: 20, unit: 'pcs' },
      { product_id: 'PRD002', stock: 40, unit: 'pcs' },
      { product_id: 'PRD003', stock: 15, unit: 'pcs' },
    ]
  },
  surabaya: {
    materials: [
      { material_id: 'MAT001', stock: 150, unit: 'kg' },
      { material_id: 'MAT002', stock: 100, unit: 'kg' },
      { material_id: 'MAT003', stock: 80, unit: 'kg' },
      { material_id: 'MAT004', stock: 70, unit: 'kg' },
      { material_id: 'MAT005', stock: 200, unit: 'bungkus' },
    ],
    products: [
      { product_id: 'PRD001', stock: 50, unit: 'pcs' },
      { product_id: 'PRD002', stock: 80, unit: 'pcs' },
      { product_id: 'PRD003', stock: 40, unit: 'pcs' },
    ]
  }
};

async function seed() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI!);
    console.log('Connected to MongoDB.');

    // 1. Seed Employees
    console.log('\n--- Seeding Employees ---');
    for (const emp of employees) {
      const updated = await EmployeeModel.findOneAndUpdate(
        { employee_id: emp.employee_id },
        { $set: emp },
        { upsert: true, new: true }
      );
      console.log(`Seeded Employee: ${updated.employee_id} - ${updated.name} (${updated.role})`);
    }

    // 2. Seed Materials
    console.log('\n--- Seeding Materials ---');
    for (const mat of materials) {
      const updated = await MaterialModel.findOneAndUpdate(
        { material_id: mat.material_id },
        { $set: mat },
        { upsert: true, new: true }
      );
      console.log(`Seeded Material: ${updated.material_id} - ${updated.name} (Cost: ${updated.cost_per_unit}/${updated.unit})`);
    }

    // 3. Seed Products
    console.log('\n--- Seeding Products ---');
    for (const prd of products) {
      const updated = await ProductModel.findOneAndUpdate(
        { product_id: prd.product_id },
        { $set: prd },
        { upsert: true, new: true }
      );
      console.log(`Seeded Product: ${updated.product_id} - ${updated.name} (Price: ${updated.price})`);
    }

    // 4. Seed Inventories (Filtered by BRANCH_ID)
    if (BRANCH_ID && inventoryConfig[BRANCH_ID.toLowerCase()]) {
      console.log(`\n--- Seeding Inventory for Branch: ${BRANCH_ID.toUpperCase()} ---`);
      const config = inventoryConfig[BRANCH_ID.toLowerCase()];
      const prefixId = BRANCH_CODE || BRANCH_ID.toUpperCase();

      // Material Inventory
      for (const matInv of config.materials) {
        const invId = `INV-${prefixId}-${matInv.material_id}`;
        const updated = await MaterialInventoryModel.findOneAndUpdate(
          { material_id: matInv.material_id },
          { 
            $set: {
              inventory_id: invId,
              stock: matInv.stock,
              unit: matInv.unit,
              reserved: 0 // CRITICAL: reserved MUST be seeded with 0
            }
          },
          { upsert: true, new: true }
        );
        console.log(`Seeded Material Inventory: ${updated.material_id} -> Stock: ${updated.stock} ${updated.unit}`);
      }

      // Product Inventory
      for (const prdInv of config.products) {
        const invId = `INV-${prefixId}-${prdInv.product_id}`;
        const updated = await ProductInventoryModel.findOneAndUpdate(
          { product_id: prdInv.product_id },
          { 
            $set: {
              inventory_id: invId,
              stock: prdInv.stock,
              unit: prdInv.unit
            }
          },
          { upsert: true, new: true }
        );
        console.log(`Seeded Product Inventory: ${updated.product_id} -> Stock: ${updated.stock} ${updated.unit}`);
      }

    } else {
      console.log(`\n--- No Inventory Configuration for Branch: ${BRANCH_ID || 'Unknown'} ---`);
      console.log('Only Master Data (Employees, Materials, Products) were seeded.');
    }

    console.log('\n--- Seeding Participant Transactions ---');
    console.log('participant_transactions is NOT seeded. It starts empty by design.');

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    console.log('\nDisconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

seed();
