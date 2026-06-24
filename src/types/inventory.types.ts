// ─── Material Inventory ───────────────────────────────────────────────────────

export interface IMaterialInventory {
  inventory_id: string;
  material_id: string;
  stock: number;
  reserved: number;
  unit: string;
  updated_at: Date;
}

// ─── Product Inventory ────────────────────────────────────────────────────────

export interface IProductInventory {
  inventory_id: string;
  product_id: string;
  stock: number;
  unit: string;
  updated_at: Date;
}
