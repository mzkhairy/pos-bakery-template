import { Schema, model, Document } from 'mongoose';
import { ParticipantRole, ParticipantState, ResourceType } from '../types';

export interface IParticipantTransactionDoc extends Document {
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

const participantTransactionSchema = new Schema<IParticipantTransactionDoc>(
  {
    tx_id: { type: String, required: true, unique: true },
    state: {
      type: String,
      enum: Object.values(ParticipantState),
      required: true,
      default: ParticipantState.PREPARED,
    },
    resource_type: {
      type: String,
      enum: Object.values(ResourceType),
      required: true,
    },
    resource_id: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    role: {
      type: String,
      enum: Object.values(ParticipantRole),
      required: true,
    },
    decision: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    completed_at: { type: Date, default: null },
  },
  {
    collection: 'participant_transactions',
    timestamps: false,
    versionKey: false,
  }
);

// Index: recovery lookup
participantTransactionSchema.index({ state: 1, decision: 1 });

export const ParticipantTransactionModel = model<IParticipantTransactionDoc>(
  'ParticipantTransaction',
  participantTransactionSchema
);
