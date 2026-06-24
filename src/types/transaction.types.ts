import { ParticipantRole, ParticipantState, ResourceType, VoteValue } from './enums';

// ─── Participant Transaction (disimpan di DB cabang) ─────────────────────────

export interface IParticipantTransaction {
  tx_id: string;
  state: ParticipantState;
  resource_type: ResourceType;
  resource_id: string;
  quantity: number;
  role: ParticipantRole;
  decision: string | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

// ─── Request Payloads dari Coordinator ───────────────────────────────────────

export interface CanCommitRequest {
  tx_id: string;
  resource_type: ResourceType;
  resource_id: string;
  quantity: number;
  role: ParticipantRole;
}

export interface DoCommitRequest {
  tx_id: string;
  resource_id: string;
  quantity: number;
  role: ParticipantRole;
}

export interface DoAbortRequest {
  tx_id: string;
  resource_id: string;
  quantity: number;
  role: ParticipantRole;
}

// ─── Response ke Coordinator ─────────────────────────────────────────────────

export interface CanCommitResponse {
  vote: VoteValue;
  tx_id: string;
  reason?: string;
}

export interface CommitAckResponse {
  ack: 'COMMITTED';
  tx_id: string;
}

export interface AbortAckResponse {
  ack: 'ABORTED';
  tx_id: string;
}

export interface DecisionResponse {
  tx_id: string;
  decision: 'COMMIT' | 'ABORT' | 'UNKNOWN';
}
