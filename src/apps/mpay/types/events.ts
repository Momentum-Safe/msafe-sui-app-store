// StreamEvent is all stream related events.
export type StreamEvent = {
  streamId: string;
  createdAt: Date;
  sender: string;
  txDigest: string;
  data: CreateStreamEventData | CancelStreamEventData | ClaimEventData | AutoClaimEventData | SetAutoClaimEventData;
};

export interface CreateStreamEventData {
  type: 'create_stream';
  coinType: string;
  balance: bigint;
}

export interface CancelStreamEventData {
  type: 'cancel_stream';
  coinType: string;
  withdrawAmount: bigint;
}

export interface ClaimEventData {
  type: 'claim';
  coinType: string;
  claimAmount: bigint;
}

export interface AutoClaimEventData {
  type: 'auto_claim';
  coinType: string;
  claimAmount: bigint;
}

export interface SetAutoClaimEventData {
  type: 'set_auto_claim';
  enabled: boolean;
}
