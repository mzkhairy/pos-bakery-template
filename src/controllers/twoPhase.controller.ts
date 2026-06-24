import { Request, Response } from 'express';
import { twoPhaseService } from '../services/twoPhase.service';
import { participantTransactionRepository } from '../repositories/participantTransaction.repository';
import { CanCommitRequest, ParticipantRole, ResourceType } from '../types';
import { logger } from '../utils/logger';

export class TwoPhaseController {
  /**
   * POST /api/2pc/can-commit
   */
  async canCommit(req: Request, res: Response): Promise<void> {
    try {
      const { tx_id, resource_type, resource_id, quantity, role } = req.body;

      // Validasi
      if (!tx_id || !resource_type || !resource_id || quantity === undefined || !role) {
        res.status(400).json({ error: 'Missing required fields: tx_id, resource_type, resource_id, quantity, role' });
        return;
      }

      if (!Object.values(ParticipantRole).includes(role)) {
        res.status(400).json({ error: `Invalid role. Must be: ${Object.values(ParticipantRole).join(', ')}` });
        return;
      }

      const payload: CanCommitRequest = { tx_id, resource_type, resource_id, quantity, role };
      const result = await twoPhaseService.canCommit(payload);

      res.status(200).json(result);
    } catch (error) {
      logger.error('canCommit error', { error });
      res.status(500).json({ error: 'Internal server error during canCommit' });
    }
  }

  /**
   * POST /api/2pc/do-commit
   */
  async doCommit(req: Request, res: Response): Promise<void> {
    try {
      const { tx_id, resource_id, quantity, role } = req.body;

      if (!tx_id || !resource_id || quantity === undefined || !role) {
        res.status(400).json({ error: 'Missing required fields: tx_id, resource_id, quantity, role' });
        return;
      }

      const result = await twoPhaseService.doCommit({ tx_id, resource_id, quantity, role });
      res.status(200).json(result);
    } catch (error) {
      logger.error('doCommit error', { error });
      res.status(500).json({ error: 'Internal server error during doCommit' });
    }
  }

  /**
   * POST /api/2pc/do-abort
   */
  async doAbort(req: Request, res: Response): Promise<void> {
    try {
      const { tx_id, resource_id, quantity, role } = req.body;

      if (!tx_id || !resource_id || quantity === undefined || !role) {
        res.status(400).json({ error: 'Missing required fields: tx_id, resource_id, quantity, role' });
        return;
      }

      const result = await twoPhaseService.doAbort({ tx_id, resource_id, quantity, role });
      res.status(200).json(result);
    } catch (error) {
      logger.error('doAbort error', { error });
      res.status(500).json({ error: 'Internal server error during doAbort' });
    }
  }

  /**
   * GET /api/2pc/decision/:txId
   * Coordinator tanya ke participant (digunakan oleh recovery)
   */
  async getDecision(req: Request, res: Response): Promise<void> {
    try {
      const { txId } = req.params;
      const tx = await participantTransactionRepository.findByTxId(txId);

      if (!tx) {
        res.status(200).json({ tx_id: txId, decision: 'UNKNOWN' });
        return;
      }

      const decision = tx.decision ?? 'UNKNOWN';
      res.status(200).json({ tx_id: txId, decision });
    } catch (error) {
      logger.error('getDecision error', { error });
      res.status(500).json({ error: 'Internal server error during getDecision' });
    }
  }
}

export const twoPhaseController = new TwoPhaseController();
