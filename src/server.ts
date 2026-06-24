import app from './app';
import { connectDatabase } from './config/database';
import { runStartupRecovery } from './transactions/participantRecovery';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function bootstrap(): Promise<void> {
  await connectDatabase();

  // Recovery sebelum menerima request
  await runStartupRecovery();

  app.listen(PORT, () => {
    console.log(`[Server] Branch "${process.env.BRANCH_ID}" running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
