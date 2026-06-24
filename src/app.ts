import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';

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

// Routes — akan diimport di Phase 04
// import twoPhaseRoutes from './routes/twoPhase.routes';
// app.use('/api/2pc', twoPhaseRoutes);

export default app;
