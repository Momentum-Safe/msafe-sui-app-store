import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction, TransactionResult } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import { WalletAccount } from '@mysten/wallet-standard';
import { Lending, ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { isObligationMigrated, OldBorrowIncentiveTxBuilder } from '../../utils';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export class ClaimIncentiveRewardIntention extends ScallopCoreBaseIntention<any> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimIncentiveReward;

  constructor(data = {}) {
    super(data);
  }

  async claimIncentiveRewards(client: ScallopClient, walletAddress: string) {
    const txb = client.builder.createTxBlock();
    txb.setSender(walletAddress);

    const allStakeAccounts = await client.query.getAllStakeAccounts(walletAddress);
    const lendings = await client.query.getLendings(undefined, walletAddress);
    const obligations = await client.query.getObligations(walletAddress);
    const obligationAccounts = Object.values((await client.query.getObligationAccounts(walletAddress)) ?? []);

    const lendingInfos = (() => {
      const spoolCoinNames = [...client.constants.whitelist.spool].map((marketCoinName) =>
        client.utils.parseCoinName(marketCoinName),
      );

      return (
        Object.values(lendings ?? []).filter(
          (lendingInfo) => !!lendingInfo && spoolCoinNames.includes(lendingInfo.coinName),
        ) as Lending[]
      ).reduce(
        (acc, lendingInfo) => {
          const marketCoinName = client.utils.parseMarketCoinName(lendingInfo.coinName);
          if (!acc[marketCoinName]) {
            acc[marketCoinName] = 0;
          }
          acc[marketCoinName] += lendingInfo.availableClaimCoin;
          return acc;
        },
        {} as Record<string, number>,
      );
    })();

    const rewardCoinCollection: Record<string, TransactionResult[]> = {};

    Object.entries(allStakeAccounts).forEach(([stakeMarketCoinName, stakeAccounts]) => {
      for (let i = 0; i < stakeAccounts.length; i++) {
        const stakeAccount = stakeAccounts[i];
        // skip if no points to save gas
        if (!lendingInfos[stakeMarketCoinName as string]) {
          continue;
        }
        const rewardCoin = txb.claim(stakeAccount.id, stakeMarketCoinName as string);

        // supposed to be all SUI reward for sCoin pool
        if (!rewardCoinCollection.sui) {
          rewardCoinCollection.sui = [rewardCoin];
        } else {
          rewardCoinCollection.sui.push(rewardCoin);
        }
      }
    });

    const totalClaimCoin = (() => {
      const coins = {} as Record<string, number>;
      coins.sui = Object.values(lendingInfos).reduce(
        (totalClaim, availableClaimCoin) => totalClaim + availableClaimCoin,
        0,
      );

      obligationAccounts.forEach((obligationAccount) => {
        Object.values(obligationAccount.borrowIncentives).forEach((borrowIncentive) => {
          if (borrowIncentive) {
            borrowIncentive.rewards.forEach((reward) => {
              if (!coins[reward.coinName]) {
                coins[reward.coinName] = 0;
              }
              if (coins[reward.coinName]) {
                coins[reward.coinName] += reward.availableClaimCoin;
              } else {
                coins[reward.coinName] = reward.availableClaimCoin;
              }
            });
          }
        });
      });
      return coins;
    })();

    if (obligations.length > 0 && obligationAccounts.length > 0) {
      for (let i = 0; i < obligationAccounts.length; i++) {
        const obligationAccount = obligationAccounts[i];

        let obligationHasReward = false;
        const obligationKeyId = obligations.find(
          (obligation) => obligation.id === obligationAccount.obligationId,
        )?.keyId;

        const isRewardCoinClaimed: Partial<Record<string, boolean>> = {};
        if (obligationKeyId) {
          Object.values(obligationAccount.borrowIncentives).forEach((borrowIncentive) => {
            if (borrowIncentive) {
              const filteredBorrowIncentives = borrowIncentive.rewards.filter((reward) => {
                const rewardCoinName = reward.coinName as string;
                // determine if this obligation has rewards at all to reduce overall movecalls
                return reward.availableClaimCoin > 0 && !isRewardCoinClaimed[rewardCoinName];
              });
              obligationHasReward = filteredBorrowIncentives.length > 0;
              filteredBorrowIncentives.forEach((filteredBorrowIncentive) => {
                const rewardCoin = txb.claimBorrowIncentive(
                  obligationAccount.obligationId,
                  obligationKeyId,
                  filteredBorrowIncentive.coinName,
                );

                isRewardCoinClaimed[filteredBorrowIncentive.coinName] = true;
                if (!rewardCoinCollection[filteredBorrowIncentive.coinName]) {
                  rewardCoinCollection[filteredBorrowIncentive.coinName] = [rewardCoin];
                } else {
                  rewardCoinCollection[filteredBorrowIncentive.coinName].push(rewardCoin);
                }
              });
            }
          });

          // claim old reward
          // if no claim coin in sui, skip
          if (totalClaimCoin.sui > 0) {
            const oldRewardCoin = OldBorrowIncentiveTxBuilder.redeem_rewards(
              txb,
              obligationKeyId,
              obligationAccount.obligationId,
              SUI_TYPE_ARG,
            );
            // should all be SUI
            if (rewardCoinCollection.sui) {
              rewardCoinCollection.sui.push(oldRewardCoin);
            } else {
              rewardCoinCollection.sui = [oldRewardCoin];
            }
          }

          if (obligationHasReward) {
            const isMigrated = await isObligationMigrated(client.query, obligationAccount.obligationId);

            // only restake if the obligation is migrated
            if (isMigrated) {
              txb.unstakeObligation(obligationAccount.obligationId, obligationKeyId);
              // Check if current obligationId is binded with veSCA before restake
              const bindedVeScaKey = await client.query.getBindedVeScaKey(obligationAccount.obligationId);
              if (bindedVeScaKey) {
                txb.stakeObligationWithVesca(obligationAccount.obligationId, obligationKeyId, bindedVeScaKey);
              } else {
                txb.stakeObligation(obligationAccount.obligationId, obligationKeyId);
              }
            }
          }
        }
      }
    }

    const objectsNeedToTransfer = (
      await Promise.all(
        Object.entries(rewardCoinCollection).map(async ([coinName, rewardCoins]) => {
          const mergeDest = rewardCoins[0];
          if (rewardCoins.length > 1) {
            txb.mergeCoins(mergeDest, rewardCoins.slice(1));
          }
          if (coinName === 'sui') {
            txb.mergeCoins(txb.gas, [mergeDest]);
            return undefined;
          }
          await client.builder.utils.mergeSimilarCoins(
            txb,
            mergeDest,
            client.utils.parseCoinType(coinName as string),
            walletAddress,
          );
          return mergeDest;
        }),
      )
    ).filter((t) => !!t);

    if (objectsNeedToTransfer.length > 0) {
      txb.transferObjects(objectsNeedToTransfer, walletAddress);
    }

    return txb.txBlock;
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return this.claimIncentiveRewards(input.scallopClient, input.account.address);
  }

  static fromData(data = {}): ClaimIncentiveRewardIntention {
    return new ClaimIncentiveRewardIntention(data);
  }
}
