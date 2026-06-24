export enum ParticipantState {
  PREPARED = 'PREPARED',
  COMMITTED = 'COMMITTED',
  ABORTED = 'ABORTED',
}

export enum ParticipantRole {
  SOURCE = 'source',
  DESTINATION = 'destination',
}

export enum ResourceType {
  MATERIAL = 'material',
  PRODUCT = 'product',
}

export enum VoteValue {
  YES = 'YES',
  NO = 'NO',
}

export enum CoordinatorDecision {
  COMMIT = 'COMMIT',
  ABORT = 'ABORT',
  UNKNOWN = 'UNKNOWN',
}
