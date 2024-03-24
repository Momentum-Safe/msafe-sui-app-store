/* eslint-disable import/no-extraneous-dependencies */
import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/dist/cjs/builder';
import { SuiClient } from '@mysten/sui.js/dist/cjs/client';
import { WalletAccount } from '@mysten/wallet-standard';
import BigNumber from 'bignumber.js';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { coinDecimals } from '../constants';
import { ScallopBuilder } from '../models';
import { NetworkType, SupportAssetCoins, TransactionSubType } from '../types';

export interface SupplyLendingIntentionData {
  amount: number;
  coinType: SupportAssetCoins;
}

export class SupplyLendingIntention extends CoreBaseIntention<SupplyLendingIntentionData> {
  txType: TransactionType;

  txSubType: TransactionSubType.SupplyLending;

  constructor(public readonly data: SupplyLendingIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const network = input.network.split(':')[1] as NetworkType;
    const scallopBuilder = new ScallopBuilder({
      client: input.suiClient,
      walletAddress: input.account.address,
      networkType: network,
    });
    await scallopBuilder.init();
    const tx = scallopBuilder.createTxBlock();
    const coinName = scallopBuilder.utils.parseCoinNameFromType(this.data.coinType);
    const coinDecimal = coinDecimals[coinName];
    const amount = new BigNumber(this.data.amount).shiftedBy(coinDecimal);
    tx.depositEntry(amount.toString(), coinName);
    return tx;
  }

  static fromData(data: SupplyLendingIntentionData): SupplyLendingIntention {
    return new SupplyLendingIntention(data);
  }
}
