import { Router, Request, Response, NextFunction } from 'express';
import { Model, Document } from 'mongoose';

/**
 * Creates a generic CRUD router for a Mongoose model.
 * @param model Mongoose model
 * @param idField The primary key field (e.g., 'employee_id')
 */
export function createCrudRouter<T extends Document>(
  model: Model<T>,
  idField: string
): Router {
  const router = Router();

  // GET all
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await model.find({});
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  });

  // GET by ID
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await model.findOne({ [idField]: req.params.id });
      if (!item) {
        res.status(404).json({ success: false, message: 'Data not found' });
        return;
      }
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  });

  // POST create
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newItem = new model(req.body);
      await newItem.save();
      res.status(201).json({ success: true, data: newItem });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({ success: false, message: 'Duplicate key error' });
        return;
      }
      next(error);
    }
  });

  // PUT update
  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedItem = await model.findOneAndUpdate(
        { [idField]: req.params.id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!updatedItem) {
        res.status(404).json({ success: false, message: 'Data not found' });
        return;
      }
      res.json({ success: true, data: updatedItem });
    } catch (error) {
      next(error);
    }
  });

  // DELETE
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedItem = await model.findOneAndDelete({ [idField]: req.params.id });
      if (!deletedItem) {
        res.status(404).json({ success: false, message: 'Data not found' });
        return;
      }
      res.json({ success: true, message: 'Data deleted successfully' });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
