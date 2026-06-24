import { Router } from 'express';
import { createCrudRouter } from '../utils/crud.factory';
import {
  EmployeeModel,
  MaterialModel,
  MaterialInventoryModel,
  ProductModel,
  ProductInventoryModel
} from '../models';

const router = Router();

// Expose CRUD for master data and inventory models
router.use('/employees', createCrudRouter(EmployeeModel, 'employee_id'));
router.use('/materials', createCrudRouter(MaterialModel, 'material_id'));
router.use('/material-inventories', createCrudRouter(MaterialInventoryModel, 'inventory_id'));
router.use('/products', createCrudRouter(ProductModel, 'product_id'));
router.use('/product-inventories', createCrudRouter(ProductInventoryModel, 'inventory_id'));

export default router;
