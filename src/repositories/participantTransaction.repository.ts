import { ParticipantTransactionModel, IParticipantTransactionDoc } from '../models';
import { ParticipantRole, ParticipantState, ResourceType } from '../types';

export class ParticipantTransactionRepository {
  async findByTxId(txId: string): Promise<IParticipantTransactionDoc | null> {
    return ParticipantTransactionModel.findOne({ tx_id: txId });
  }

  async createPrepared(params: {
    tx_id: string;
    resource_type: ResourceType;
    resource_id: string;
    quantity: number;
    role: ParticipantRole;
  }): Promise<IParticipantTransactionDoc> {
    const tx = new ParticipantTransactionModel({
      ...params,
      state: ParticipantState.PREPARED,
      decision: null,
      created_at: new Date(),
      updated_at: new Date(),
      completed_at: null,
    });
    return tx.save();
  }

  async markCommitted(txId: string): Promise<void> {
    await ParticipantTransactionModel.findOneAndUpdate(
      { tx_id: txId },
      {
        $set: {
          state: ParticipantState.COMMITTED,
          decision: 'COMMIT',
          updated_at: new Date(),
          completed_at: new Date(),
        },
      }
    );
  }

  async markAborted(txId: string): Promise<void> {
    await ParticipantTransactionModel.findOneAndUpdate(
      { tx_id: txId },
      {
        $set: {
          state: ParticipantState.ABORTED,
          decision: 'ABORT',
          updated_at: new Date(),
          completed_at: new Date(),
        },
      }
    );
  }

  /**
   * Cari transaksi yang butuh recovery saat startup:
   * state=PREPARED dan decision=null
   */
  async findPendingRecovery(): Promise<IParticipantTransactionDoc[]> {
    return ParticipantTransactionModel.find({
      state: ParticipantState.PREPARED,
      decision: null,
    });
  }
}

export const participantTransactionRepository = new ParticipantTransactionRepository();
