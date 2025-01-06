import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { KriyaSDK } from 'kriya-dex-sdk';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';
import { SuiNetworks } from '@/types';

import { Rpc, TransactionSubType } from '../types';

export interface ClaimRewardsIntentionData {
  objectId: string;
  tokenXType: string;
  tokenYType: string;
  positionObjectId: string;
}

export class ClaimRewardsIntention extends BaseIntentionLegacy<ClaimRewardsIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.ClaimRewards;

  constructor(public override readonly data: ClaimRewardsIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    const { address } = account;
    const isMainnet: boolean = input.network === 'sui:mainnet';
    const farmSdk = new KriyaSDK.StakingFarm(Rpc, isMainnet);
    const { objectId, tokenXType, tokenYType, positionObjectId } = this.data;
    const farm = { objectId, tokenXType, tokenYType };
    const txb = new TransactionBlock();

    farmSdk.claimTx(
      // @ts-ignore
      txb,
      farm,
      positionObjectId,
      address,
    );

    return txb;
  }

  static fromData(data: ClaimRewardsIntentionData) {
    return new ClaimRewardsIntention(data);
  }
}
