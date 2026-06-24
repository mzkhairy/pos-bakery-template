import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { MaterialModel, MaterialInventoryModel } from './models';

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

const materials = [
  { material_id: 'MAT001', name: 'Tepung Terigu', unit: 'kg', cost_per_unit: 12000 },
  { material_id: 'MAT002', name: 'Gula Pasir', unit: 'kg', cost_per_unit: 14000 },
  { material_id: 'MAT003', name: 'Mentega', unit: 'kg', cost_per_unit: 35000 },
];

const inventoryConfig: Record<string, { material_id: string; stock: number; unit: string }[]> = {
  bekasi: [
    { material_id: 'MAT001', stock: 100, unit: 'kg' },
    { material_id: 'MAT002', stock: 80, unit: 'kg' },
    { material_id: 'MAT003', stock: 60, unit: 'kg' },
  ],
  jakarta: [
    { material_id: 'MAT001', stock: 50, unit: 'kg' },
    { material_id: 'MAT002', stock: 40, unit: 'kg' },
    { material_id: 'MAT003', stock: 30, unit: 'kg' },
  ]
};

async function seed() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI!);
    console.log('Connected to MongoDB.');

    console.log('\n--- Seeding Materials ---');
    for (const mat of materials) {
      const updated = await MaterialModel.findOneAndUpdate(
        { material_id: mat.material_id },
        { $set: mat },
        { upsert: true, new: true }
      );
      console.log(`Seeded Material: ${updated.material_id} - ${updated.name} (Cost: ${updated.cost_per_unit}/${updated.unit})`);
    }

    if (BRANCH_ID && inventoryConfig[BRANCH_ID.toLowerCase()]) {
      console.log(`\n--- Seeding Material Inventory for Branch: ${BRANCH_ID.toUpperCase()} ---`);
      const branchInventory = inventoryConfig[BRANCH_ID.toLowerCase()];
      for (const inv of branchInventory) {
        // Construct a unique inventory_id using branch code and material id
        const invId = `INV-${BRANCH_CODE || BRANCH_ID.toUpperCase()}-${inv.material_id}`;
        
        const updatedInv = await MaterialInventoryModel.findOneAndUpdate(
          { material_id: inv.material_id },
          { 
            $set: {
              inventory_id: invId,
              stock: inv.stock,
              unit: inv.unit,
              reserved: 0 // CRITICAL: reserved MUST be seeded with 0
            }
          },
          { upsert: true, new: true }
        );
        console.log(`Seeded Inventory: ${updatedInv.material_id} -> Stock: ${updatedInv.stock} ${updatedInv.unit}, Reserved: ${updatedInv.reserved}`);
      }
    } else {
      console.log(`\n--- No Inventory Configuration for Branch: ${BRANCH_ID || 'Unknown'} ---`);
      console.log('Only Materials were seeded.');
    }

    // participant_transactions TIDAK di-seed — collection ini mulai kosong (by design)
    // Query 2PC bergantung pada state yang dinamis, tidak ada transaksi awal yang diperlukan.
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

/*
Urutan eksekusi seed yang harus dijalankan user:
1. Bekasi seed dulu (BRANCH_ID=bekasi, BRANCH_CODE=BKS)
2. Jakarta seed kedua (BRANCH_ID=jakarta, BRANCH_CODE=JKT)
3. Coordinator tidak perlu seed
*/
