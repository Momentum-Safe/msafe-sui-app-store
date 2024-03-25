import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { Decoder } from './decoder';
import { BorrowIntention, BorrowIntentionData } from './intentions/borrow';
import { ClaimBorrowRewardIntention, ClaimBorrowRewardIntentionData } from './intentions/claim-borrow-reward';
import { ClaimSupplyRewardIntention, ClaimSupplyRewardIntentionData } from './intentions/claim-supply-reward';
import { DepositCollateralIntention, DepositCollateralIntentionData } from './intentions/deposit-collateral';
import { OpenObligationIntention, OpenObligationIntentionData } from './intentions/open-obligation';
import { RepayIntention, RepayIntentionData } from './intentions/repay';
import { StakeSpoolIntention, StakeSpoolIntentionData } from './intentions/stake-spool';
import { SupplyLendingIntention, SupplyLendingIntentionData } from './intentions/supply-lending';
import { UnstakeSpoolIntention, UnstakeSpoolIntentionData } from './intentions/unstake-spool';
import { WithdrawCollateralIntention, WithdrawCollateralIntentionData } from './intentions/withdraw-collateral';
import { WithdrawLendingIntention, WithdrawLendingIntentionData } from './intentions/withdraw-lending';
import { ScallopBuilder } from './models';
import { SuiNetworks } from './types';
import { TransactionSubType } from './types/utils';
import { MSafeAppHelper } from '../interface';

export type ScallopIntention =
  | SupplyLendingIntention
  | WithdrawLendingIntention
  | BorrowIntention
  | RepayIntention
  | DepositCollateralIntention
  | WithdrawCollateralIntention
  | OpenObligationIntention
  | StakeSpoolIntention
  | UnstakeSpoolIntention
  | ClaimBorrowRewardIntention
  | ClaimSupplyRewardIntention;

export type ScallopIntentionData =
  | SupplyLendingIntentionData
  | WithdrawLendingIntentionData
  | BorrowIntentionData
  | RepayIntentionData
  | DepositCollateralIntentionData
  | WithdrawCollateralIntentionData
  | OpenObligationIntentionData
  | StakeSpoolIntentionData
  | UnstakeSpoolIntentionData
  | ClaimBorrowRewardIntentionData
  | ClaimSupplyRewardIntentionData;

export class ScallopAppHelper implements MSafeAppHelper<ScallopIntentionData> {
  application = 'scallop';

  async deserialize(
    input: SuiSignTransactionBlockInput & { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount },
  ): Promise<{
    txType: TransactionType;
    txSubType: TransactionSubType;
    intentionData: ScallopIntentionData;
  }> {
    const builder = new ScallopBuilder({
      client: input.suiClient,
      walletAddress: input.account.address,
      networkType: input.network.split(':')[1] as any,
    });
    await builder.init();
    const { transactionBlock } = input;
    const decoder = new Decoder(transactionBlock, builder.address.get('core.packages.protocol.id'));
    const result = decoder.decode();
    return {
      txType: TransactionType.Other,
      txSubType: result.type,
      intentionData: result.intentionData,
    };
  }

  async build(input: {
    intentionData: ScallopIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const { suiClient, account, network } = input;
    let intention: ScallopIntention;
    switch (input.txSubType) {
      case TransactionSubType.SupplyLending:
        intention = SupplyLendingIntention.fromData(input.intentionData as SupplyLendingIntentionData);
        break;
      case TransactionSubType.WithdrawLending:
        intention = WithdrawLendingIntention.fromData(input.intentionData as WithdrawLendingIntentionData);
        break;
      case TransactionSubType.Borrow:
        intention = BorrowIntention.fromData(input.intentionData as BorrowIntentionData);
        break;
      case TransactionSubType.Repay:
        intention = RepayIntention.fromData(input.intentionData as RepayIntentionData);
        break;
      case TransactionSubType.DepositCollateral:
        intention = DepositCollateralIntention.fromData(input.intentionData as DepositCollateralIntentionData);
        break;
      case TransactionSubType.WithdrawCollateral:
        intention = WithdrawCollateralIntention.fromData(input.intentionData as WithdrawCollateralIntentionData);
        break;
      case TransactionSubType.OpenObligation:
        intention = OpenObligationIntention.fromData(input.intentionData as OpenObligationIntentionData);
        break;
      case TransactionSubType.StakeSpool:
        intention = StakeSpoolIntention.fromData(input.intentionData as StakeSpoolIntentionData);
        break;
      case TransactionSubType.UnstakeSpool:
        intention = UnstakeSpoolIntention.fromData(input.intentionData as UnstakeSpoolIntentionData);
        break;
      case TransactionSubType.ClaimBorrowReward:
        intention = ClaimBorrowRewardIntention.fromData(input.intentionData as ClaimBorrowRewardIntentionData);
        break;
      case TransactionSubType.ClaimSupplyReward:
        intention = ClaimSupplyRewardIntention.fromData(input.intentionData as ClaimSupplyRewardIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient, account, network });
  }
}
