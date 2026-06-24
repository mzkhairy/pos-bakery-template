import axios from 'axios';
import { participantTransactionRepository } from '../repositories/participantTransaction.repository';
import { materialInventoryRepository } from '../repositories/materialInventory.repository';
import { ParticipantRole, ParticipantState } from '../types';
import { logger } from '../utils/logger';

const COORDINATOR_URL = process.env.COORDINATOR_URL || 'http://localhost:5000';

export async function runStartupRecovery(): Promise<void> {
  logger.info('Starting participant recovery scan...');

  const pendingTxs = await participantTransactionRepository.findPendingRecovery();

  if (pendingTxs.length === 0) {
    logger.info('No pending participant transactions. Recovery complete.');
    return;
  }

  logger.warn(`Found ${pendingTxs.length} pending participant transaction(s). Recovering...`);

  for (const tx of pendingTxs) {
    const { tx_id, resource_id, quantity, role } = tx;

    logger.info(`Querying coordinator decision for ${tx_id}`);

    try {
      const response = await axios.get(
        `${COORDINATOR_URL}/api/2pc/decision/${tx_id}`,
        { timeout: 5000 }
      );

      const decision: 'COMMIT' | 'ABORT' | 'UNKNOWN' = response.data.decision;

      logger.info(`Coordinator decision for ${tx_id}: ${decision}`);

      if (decision === 'COMMIT') {
        // Jalankan commit
        if (role === ParticipantRole.SOURCE) {
          await materialInventoryRepository.commitDeduction(resource_id, quantity);
          logger.info(`Recovery COMMIT (source): deducted ${quantity} of ${resource_id}`, { tx_id });
        } else {
          await materialInventoryRepository.commitAddition(resource_id, quantity);
          logger.info(`Recovery COMMIT (destination): added ${quantity} of ${resource_id}`, { tx_id });
        }
        await participantTransactionRepository.markCommitted(tx_id);

      } else if (decision === 'ABORT') {
        // Jalankan abort
        if (role === ParticipantRole.SOURCE) {
          await materialInventoryRepository.releaseReservation(resource_id, quantity);
          logger.info(`Recovery ABORT (source): released reservation for ${resource_id}`, { tx_id });
        }
        await participantTransactionRepository.markAborted(tx_id);

      } else {
        // UNKNOWN — coordinator mungkin belum selesai, biarkan untuk recovery berikutnya
        logger.warn(`Coordinator returned UNKNOWN for ${tx_id}. Will retry on next startup.`);
      }

    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to query coordinator for ${tx_id}`, { message: err.message });
      // Jangan crash — lanjutkan recovery untuk transaksi lain
    }
  }

  logger.info('Participant recovery complete.');
}
