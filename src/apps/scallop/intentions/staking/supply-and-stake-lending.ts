/* eslint-disable import/no-extraneous-dependencies */
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface SupplyAndStakeLendingIntentionData {
  amount: number | string;
  coinName: string;
  stakeAccountId?: string | null;
}

export class SupplyAndStakeLendingIntention extends ScallopCoreBaseIntention<SupplyAndStakeLendingIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.SupplyAndStakeLending;

  constructor(public readonly data: SupplyAndStakeLendingIntentionData) {
    super(data);
  }

  async supplyAndStake({ account, scallopClient: client }: { account: WalletAccount; scallopClient: ScallopClient }) {
    const sender = account.address;
    const { amount, coinName, stakeAccountId } = this.data;

    const tx = client.builder.createTxBlock();
    tx.setSender(sender);

    const marketCoin = await tx.depositQuick(+amount, coinName);
    const stakeMarketCoinName = client.utils.parseMarketCoinName(coinName);
    if (client.constants.whitelist.spool.has(stakeMarketCoinName)) {
      return tx.txBlock;
    }
    const stakeAccounts = await client.query.getStakeAccounts(stakeMarketCoinName, sender);
    const targetStakeAccount = stakeAccountId || (stakeAccounts.length > 0 ? stakeAccounts[0].id : undefined);
    if (targetStakeAccount) {
      await tx.stakeQuick(marketCoin, stakeMarketCoinName, targetStakeAccount);
    } else {
      const newStakeAccount = tx.createStakeAccount(stakeMarketCoinName);
      await tx.stakeQuick(marketCoin, stakeMarketCoinName, newStakeAccount);
      tx.transferObjects([newStakeAccount], sender);
    }
    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.supplyAndStake(input);
  }

  static fromData(data: SupplyAndStakeLendingIntentionData): SupplyAndStakeLendingIntention {
    return new SupplyAndStakeLendingIntention(data);
  }
}
