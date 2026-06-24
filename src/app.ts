import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import twoPhaseRoutes from './routes/twoPhase.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    branch: process.env.BRANCH_ID,
    timestamp: new Date().toISOString(),
  });
});

// 2PC Routes
app.use('/api/2pc', twoPhaseRoutes);

// Error handler (harus di akhir)
app.use(errorHandler);

export default app;
