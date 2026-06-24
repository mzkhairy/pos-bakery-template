import { materialInventoryRepository } from '../repositories/materialInventory.repository';
import { participantTransactionRepository } from '../repositories/participantTransaction.repository';
import {
  CanCommitRequest,
  CanCommitResponse,
  CommitAckResponse,
  AbortAckResponse,
  DecisionResponse,
  ParticipantRole,
  ParticipantState,
  ResourceType,
  VoteValue,
} from '../types';
import { logger } from '../utils/logger';

export class TwoPhaseService {
  /**
   * PHASE 1: Coordinator meminta vote
   * - Source: cek stok dan lock
   * - Destination: selalu YES (siap menerima)
   */
  async canCommit(req: CanCommitRequest): Promise<CanCommitResponse> {
    const { tx_id, resource_type, resource_id, quantity, role } = req;

    // Cegah double vote untuk tx_id yang sama
    const existing = await participantTransactionRepository.findByTxId(tx_id);
    if (existing) {
      logger.warn('Duplicate canCommit request', { tx_id, existing_state: existing.state });
      // Jika sudah ada tapi state-nya sudah final, kembalikan sesuai state
      if (existing.state === ParticipantState.COMMITTED) {
        return { vote: VoteValue.YES, tx_id };
      }
      if (existing.state === ParticipantState.ABORTED) {
        return { vote: VoteValue.NO, tx_id, reason: 'ALREADY_ABORTED' };
      }
      // Masih PREPARED — ini request ulang (coordinator retry)
      return { vote: VoteValue.YES, tx_id };
    }

    // Destination selalu YES
    if (role === ParticipantRole.DESTINATION) {
      await participantTransactionRepository.createPrepared({
        tx_id,
        resource_type: resource_type as ResourceType,
        resource_id,
        quantity,
        role,
      });
      logger.info('Vote YES (destination)', { tx_id, resource_id, quantity });
      return { vote: VoteValue.YES, tx_id };
    }

    // Source: cek dan lock stok
    if (resource_type === ResourceType.MATERIAL) {
      const locked = await materialInventoryRepository.reserveStock(resource_id, quantity);

      if (!locked) {
        logger.warn('Vote NO — insufficient stock', { tx_id, resource_id, quantity });
        return { vote: VoteValue.NO, tx_id, reason: 'INSUFFICIENT_STOCK' };
      }

      await participantTransactionRepository.createPrepared({
        tx_id,
        resource_type: resource_type as ResourceType,
        resource_id,
        quantity,
        role,
      });

      logger.info('Vote YES (source — stock reserved)', { tx_id, resource_id, quantity });
      return { vote: VoteValue.YES, tx_id };
    }

    // Resource type tidak dikenal
    return { vote: VoteValue.NO, tx_id, reason: 'UNSUPPORTED_RESOURCE_TYPE' };
  }

  /**
   * PHASE 2: Coordinator meminta commit
   * IDEMPOTENT — aman dipanggil berulang
   */
  async doCommit(params: {
    tx_id: string;
    resource_id: string;
    quantity: number;
    role: ParticipantRole;
  }): Promise<CommitAckResponse> {
    const { tx_id, resource_id, quantity, role } = params;

    const tx = await participantTransactionRepository.findByTxId(tx_id);

    if (!tx) {
      // Tidak ada record — ini anomali (mungkin canCommit belum dipanggil)
      // Untuk safety, log dan return ACK (coordinator tidak perlu retry)
      logger.warn('doCommit called but no participant transaction found', { tx_id });
      return { ack: 'COMMITTED', tx_id };
    }

    // IDEMPOTENT CHECK — sudah committed sebelumnya
    if (tx.state === ParticipantState.COMMITTED) {
      logger.info('doCommit idempotent — already committed', { tx_id });
      return { ack: 'COMMITTED', tx_id };
    }

    // Jangan commit jika sudah aborted
    if (tx.state === ParticipantState.ABORTED) {
      logger.warn('doCommit called on aborted transaction — treating as committed (no-op)', { tx_id });
      return { ack: 'COMMITTED', tx_id };
    }

    // Jalankan commit berdasarkan role
    if (role === ParticipantRole.SOURCE) {
      await materialInventoryRepository.commitDeduction(resource_id, quantity);
      logger.info('doCommit source — stock deducted', { tx_id, resource_id, quantity });
    } else {
      await materialInventoryRepository.commitAddition(resource_id, quantity);
      logger.info('doCommit destination — stock added', { tx_id, resource_id, quantity });
    }

    await participantTransactionRepository.markCommitted(tx_id);

    return { ack: 'COMMITTED', tx_id };
  }

  /**
   * PHASE 2 (abort): Coordinator meminta abort
   * IDEMPOTENT — aman dipanggil berulang
   */
  async doAbort(params: {
    tx_id: string;
    resource_id: string;
    quantity: number;
    role: ParticipantRole;
  }): Promise<AbortAckResponse> {
    const { tx_id, resource_id, quantity, role } = params;

    const tx = await participantTransactionRepository.findByTxId(tx_id);

    if (!tx) {
      // Tidak ada record — canCommit mungkin belum sempat menyimpan (edge case)
      logger.warn('doAbort called but no participant transaction found', { tx_id });
      return { ack: 'ABORTED', tx_id };
    }

    // IDEMPOTENT CHECK
    if (tx.state === ParticipantState.ABORTED) {
      logger.info('doAbort idempotent — already aborted', { tx_id });
      return { ack: 'ABORTED', tx_id };
    }

    if (tx.state === ParticipantState.COMMITTED) {
      logger.warn('doAbort called on committed transaction — ignoring', { tx_id });
      return { ack: 'ABORTED', tx_id };
    }

    // Release lock hanya untuk source (destination tidak mengubah stok saat abort)
    if (role === ParticipantRole.SOURCE) {
      await materialInventoryRepository.releaseReservation(resource_id, quantity);
      logger.info('doAbort source — reservation released', { tx_id, resource_id, quantity });
    } else {
      logger.info('doAbort destination — no stock change needed', { tx_id });
    }

    await participantTransactionRepository.markAborted(tx_id);

    return { ack: 'ABORTED', tx_id };
  }

  /**
   * Recovery: participant tanya ke coordinator decision-nya apa
   */
  async getDecisionFromCoordinator(txId: string): Promise<DecisionResponse> {
    // Endpoint ini dipanggil oleh recovery service, bukan langsung dari sini.
    // Ini hanya placeholder untuk tipe response.
    return { tx_id: txId, decision: 'UNKNOWN' };
  }
}

export const twoPhaseService = new TwoPhaseService();
