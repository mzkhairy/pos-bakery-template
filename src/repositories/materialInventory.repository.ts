import { MaterialInventoryModel, IMaterialInventoryDoc } from '../models';

export class MaterialInventoryRepository {
  /**
   * Cari inventory berdasarkan material_id
   */
  async findByMaterialId(materialId: string): Promise<IMaterialInventoryDoc | null> {
    return MaterialInventoryModel.findOne({ material_id: materialId });
  }

  /**
   * Cek dan lock stok (atomic dengan findOneAndUpdate).
   * Hanya berhasil jika (stock - reserved) >= quantity.
   * Return: inventory terbaru jika berhasil, null jika tidak cukup stok.
   */
  async reserveStock(
    materialId: string,
    quantity: number
  ): Promise<IMaterialInventoryDoc | null> {
    const result = await MaterialInventoryModel.findOneAndUpdate(
      {
        material_id: materialId,
        // Kondisi: available stock harus cukup
        $expr: { $gte: [{ $subtract: ['$stock', '$reserved'] }, quantity] },
      },
      {
        $inc: { reserved: quantity },
        $set: { updated_at: new Date() },
      },
      { new: true }
    );
    return result;
  }

  /**
   * Release lock tanpa commit (digunakan saat abort dari source)
   */
  async releaseReservation(
    materialId: string,
    quantity: number
  ): Promise<void> {
    await MaterialInventoryModel.findOneAndUpdate(
      { material_id: materialId },
      {
        $inc: { reserved: -quantity },
        $set: { updated_at: new Date() },
      }
    );
  }

  /**
   * Commit: kurangi stok dan release reservation (source)
   */
  async commitDeduction(
    materialId: string,
    quantity: number
  ): Promise<void> {
    await MaterialInventoryModel.findOneAndUpdate(
      { material_id: materialId },
      {
        $inc: { stock: -quantity, reserved: -quantity },
        $set: { updated_at: new Date() },
      }
    );
  }

  /**
   * Commit: tambah stok (destination)
   */
  async commitAddition(
    materialId: string,
    quantity: number
  ): Promise<void> {
    await MaterialInventoryModel.findOneAndUpdate(
      { material_id: materialId },
      {
        $inc: { stock: quantity },
        $set: { updated_at: new Date() },
      }
    );
  }
}

export const materialInventoryRepository = new MaterialInventoryRepository();
