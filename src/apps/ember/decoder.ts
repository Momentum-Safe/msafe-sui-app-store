import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import {
  CancelPendingWithdrawalRequestIntentionData,
  DecodeResult,
  DepositAssetIntentionData,
  MintSharesIntentionData,
  RedeemSharesIntentionData,
  TransactionSubType,
} from './types';

export class Decoder {
  constructor(
    public readonly transaction: Transaction,
    public readonly appContext?: any,
  ) {}

  async decode(): Promise<DecodeResult> {
    if (this.isDepositAssetTransaction()) {
      return this.decodeDepositAssetTx();
    }
    if (this.isMintSharesTransaction()) {
      return this.decodeMintSharesTx();
    }
    if (this.isRedeemSharesTransaction()) {
      return this.decodeRedeemSharesTx();
    }
    if (this.isCancelPendingWithdrawalRequestTransaction()) {
      return this.decodeCancelPendingWithdrawalRequestTx();
    }
    throw new Error(`Unknown transaction type`);
  }

  private get commands() {
    return this.transaction.getData().commands;
  }

  private getMoveCallCommand(fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall' && command.MoveCall.function === fn);
  }

  private isDepositAssetTransaction() {
    return !!this.getMoveCallCommand('deposit_asset');
  }

  private isMintSharesTransaction() {
    return !!this.getMoveCallCommand('mint_shares');
  }

  private isRedeemSharesTransaction() {
    return !!this.getMoveCallCommand('redeem_shares');
  }

  private isCancelPendingWithdrawalRequestTransaction() {
    return !!this.getMoveCallCommand('cancel_pending_withdrawal_request');
  }

  private async decodeDepositAssetTx(): Promise<DecodeResult> {
    const { appContext } = this;

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.DepositAsset,
      intentionData: {
        vaultID: appContext.txParams.vaultID,
        amount: appContext.txParams.amount,
      } as DepositAssetIntentionData,
    };
  }

  private async decodeMintSharesTx(): Promise<DecodeResult> {
    const { appContext } = this;

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.MintShares,
      intentionData: {
        vaultID: appContext.txParams.vaultID,
        numShares: appContext.txParams.numShares,
      } as MintSharesIntentionData,
    };
  }

  private async decodeRedeemSharesTx(): Promise<DecodeResult> {
    const { appContext } = this;

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.RedeemShares,
      intentionData: {
        vaultID: appContext.txParams.vaultID,
        numShares: appContext.txParams.numShares,
      } as RedeemSharesIntentionData,
    };
  }

  private async decodeCancelPendingWithdrawalRequestTx(): Promise<DecodeResult> {
    const { appContext } = this;

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CancelPendingWithdrawalRequest,
      intentionData: {
        vaultID: appContext.txParams.vaultID,
        sequenceNumber: appContext.txParams.sequenceNumber,
      } as CancelPendingWithdrawalRequestIntentionData,
    };
  }
}
