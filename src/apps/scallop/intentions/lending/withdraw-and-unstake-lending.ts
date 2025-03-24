/* eslint-disable import/no-extraneous-dependencies */
import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface WithdrawAndUnstakeLendingIntentionData {
  amount: number | undefined;
  coinName: string;
  stakeAccountId: { id: string; coin: number }[];
}

export class WithdrawAndUnstakeLendingIntention extends ScallopCoreBaseIntention<WithdrawAndUnstakeLendingIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.WithdrawAndUnstakeLending;

  constructor(public readonly data: WithdrawAndUnstakeLendingIntentionData) {
    super(data);
  }

  async unstakeAndWithdraw(client: ScallopClient, data: WithdrawAndUnstakeLendingIntentionData, walletAddress: string) {
    const tx = client.builder.createTxBlock();
    tx.setSender(walletAddress);

    const { stakeAccountId, amount: totalAmount, coinName } = this.data;
    const withdrawCoins = [];
    for (let i = 0; i < stakeAccountId.length; i++) {
      const { id: stakeAccount, coin: amount } = stakeAccountId[i];
      const stakeMarketCoinName = client.utils.parseMarketCoinName(coinName);
      const [marketCoin] = await tx.unstakeQuick(amount, stakeMarketCoinName, stakeAccount);
      if (marketCoin) {
        const wdScoin = tx.withdraw(marketCoin, coinName);
        withdrawCoins.push(wdScoin);
      }
    }
    if (totalAmount > 0) {
      const wdCoin = await tx.withdrawQuick(totalAmount, coinName);
      withdrawCoins.push(wdCoin);
    }
    if (withdrawCoins.length > 1) {
      tx.mergeCoins(withdrawCoins[0], withdrawCoins.slice(1));
    }
    tx.transferObjects(withdrawCoins, walletAddress);
    return tx.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.unstakeAndWithdraw(input.scallopClient, this.data, input.account.address);
  }

  static fromData(data: WithdrawAndUnstakeLendingIntentionData): WithdrawAndUnstakeLendingIntention {
    return new WithdrawAndUnstakeLendingIntention(data);
  }
}
