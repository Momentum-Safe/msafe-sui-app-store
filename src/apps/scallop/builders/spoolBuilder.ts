import { TransactionBlock } from '@mysten/sui.js/transactions';
import type { TransactionArgument, TransactionResult } from '@mysten/sui.js/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';

import { spoolRewardCoins } from '../constants/enum';
import type { ScallopBuilder } from '../models';
import { getStakeAccounts } from '../queries/spoolQuery';
import type {
  SpoolIds,
  GenerateSpoolNormalMethod,
  GenerateSpoolQuickMethod,
  SupportStakeMarketCoins,
  SuiAddressArg,
} from '../types';
import { requireSender } from '../utils';

/**
 * Check and get stake account id from transaction block.
 *
 * @description
 * If the stake account id is provided, directly return it.
 * Otherwise, automatically get all stake account id from the sender.
 *
 * @param builder - Scallop builder instance.
 * @param txBlock - TxBlock created by SuiKit.
 * @param stakeMarketCoinName - The name of the market coin supported for staking.
 * @param stakeAccountId - Stake account id.
 * @return Stake account ids.
 */
const requireStakeAccountIds = async (
  ...params: [
    builder: ScallopBuilder,
    txBlock: TransactionBlock,
    stakeMarketCoinName: SupportStakeMarketCoins,
    stakeAccountId?: SuiAddressArg,
  ]
) => {
  const [builder, txBlock, stakeMarketCoinName, stakeAccountId] = params;
  if (params.length === 4 && stakeAccountId) {
    return [stakeAccountId];
  }
  const sender = requireSender(txBlock);
  const stakeAccounts = await getStakeAccounts(builder.query, sender);
  if (stakeAccounts[stakeMarketCoinName].length === 0) {
    throw new Error(`No stake account id found for sender ${sender}`);
  }
  return stakeAccounts[stakeMarketCoinName].map((account) => account.id);
};

/**
 * Check and get stake accounts information from transaction block.
 *
 * @description
 * If the stake account id is provided, directly return its account.
 * Otherwise, automatically get all stake account from the sender.
 *
 * @param builder - Scallop builder instance.
 * @param txBlock - TxBlock created by SuiKit.
 * @param stakeMarketCoinName - The name of the market coin supported for staking.
 * @param stakeAccountId - Stake account id.
 * @return Stake accounts.
 */
const requireStakeAccounts = async (
  ...params: [
    builder: ScallopBuilder,
    txBlock: TransactionBlock,
    stakeMarketCoinName: SupportStakeMarketCoins,
    stakeAccountId?: SuiAddressArg,
  ]
) => {
  const [builder, txBlock, stakeMarketCoinName, stakeAccountId] = params;
  const sender = requireSender(txBlock);
  const stakeAccounts = await getStakeAccounts(builder.query, sender);
  if (stakeAccounts[stakeMarketCoinName].length === 0) {
    throw new Error(`No stake account found for sender ${sender}`);
  }

  const specificStakeAccounts = stakeAccountId
    ? stakeAccounts[stakeMarketCoinName].filter((account) => account.id === stakeAccountId)
    : stakeAccounts[stakeMarketCoinName];

  return specificStakeAccounts;
};

/**
 * Generate spool normal methods.
 *
 * @param builder - Scallop builder instance.
 * @param txBlock - TxBlock created by SuiKit .
 * @return Spool normal methods.
 */
export const generateSpoolNormalMethod: GenerateSpoolNormalMethod = ({ builder, txBlock }) => {
  const spoolIds: SpoolIds = {
    spoolPkg: builder.address.get('spool.id'),
  };
  return {
    createStakeAccount: (stakeMarketCoinName) => {
      const marketCoinType = builder.utils.parseMarketCoinType(stakeMarketCoinName);
      const stakePoolId = builder.address.get(`spool.pools.${stakeMarketCoinName}.id`);
      return txBlock.moveCall({
        target: `${spoolIds.spoolPkg}::user::new_spool_account`,
        arguments: [txBlock.object(stakePoolId), txBlock.object(SUI_CLOCK_OBJECT_ID)],
        typeArguments: [marketCoinType],
      });
    },
    stake: (stakeAccount, coin, stakeMarketCoinName) => {
      const marketCoinType = builder.utils.parseMarketCoinType(stakeMarketCoinName);
      const stakePoolId = builder.address.get(`spool.pools.${stakeMarketCoinName}.id`);
      txBlock.moveCall({
        target: `${spoolIds.spoolPkg}::user::stake`,
        arguments: [
          txBlock.object(stakePoolId),
          txBlock.object(stakeAccount as string),
          typeof coin === 'string' ? txBlock.pure(coin) : (coin as TransactionArgument),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [marketCoinType],
      });
    },
    unstake: (stakeAccount, amount, stakeMarketCoinName) => {
      const marketCoinType = builder.utils.parseMarketCoinType(stakeMarketCoinName);
      const stakePoolId = builder.address.get(`spool.pools.${stakeMarketCoinName}.id`);
      return txBlock.moveCall({
        target: `${spoolIds.spoolPkg}::user::unstake`,
        arguments: [
          txBlock.object(stakePoolId),
          txBlock.object(stakeAccount as string),
          txBlock.pure(amount),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [marketCoinType],
      });
    },
    claim: (stakeAccount, stakeMarketCoinName) => {
      const stakePoolId = builder.address.get(`spool.pools.${stakeMarketCoinName}.id`);
      const rewardPoolId = builder.address.get(`spool.pools.${stakeMarketCoinName}.rewardPoolId`);
      const marketCoinType = builder.utils.parseMarketCoinType(stakeMarketCoinName);
      const rewardCoinName = spoolRewardCoins[stakeMarketCoinName];
      const rewardCoinType = builder.utils.parseCoinType(rewardCoinName);
      return txBlock.moveCall({
        target: `${spoolIds.spoolPkg}::user::redeem_rewards`,
        arguments: [
          txBlock.object(stakePoolId),
          txBlock.object(rewardPoolId),
          txBlock.object(stakeAccount as string),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [marketCoinType, rewardCoinType],
      });
    },
  };
};

/**
 * Generate spool quick methods.
 *
 * @description
 * The quick methods are the same as the normal methods, but they will automatically
 * help users organize transaction blocks, include get stake account info, and transfer
 * coins to the sender. So, they are all asynchronous methods.
 *
 * @param builder - Scallop builder instance.
 * @param txBlock - TxBlock created by SuiKit .
 * @return Spool quick methods.
 */
export const generateSpoolQuickMethod: GenerateSpoolQuickMethod = ({ builder, txBlock }) => {
  const normalMethod = generateSpoolNormalMethod({ builder, txBlock });
  return {
    normalMethod,
    stakeQuick: async (amountOrMarketCoin, stakeMarketCoinName, stakeAccountId) => {
      const sender = requireSender(txBlock);
      const stakeAccountIds = await requireStakeAccountIds(builder, txBlock, stakeMarketCoinName, stakeAccountId);

      const marketCoinType = builder.utils.parseMarketCoinType(stakeMarketCoinName);
      if (typeof amountOrMarketCoin === 'number') {
        const coins = await builder.utils.selectCoinIds(amountOrMarketCoin, marketCoinType, sender);
        const [takeCoin, leftCoin] = builder.utils.takeAmountFromCoins(txBlock, coins, amountOrMarketCoin);
        normalMethod.stake(stakeAccountIds[0], takeCoin, stakeMarketCoinName);
        txBlock.transferObjects([leftCoin], sender);
      } else {
        normalMethod.stake(stakeAccountIds[0], amountOrMarketCoin, stakeMarketCoinName);
      }
    },
    unstakeQuick: async (amount, stakeMarketCoinName, stakeAccountId) => {
      let remainingAmount = amount;
      const stakeAccounts = await requireStakeAccounts(builder, txBlock, stakeMarketCoinName, stakeAccountId);
      const stakeMarketCoins: TransactionResult[] = [];
      for (let i = 0; i < stakeAccounts.length; i++) {
        if (stakeAccounts[i].staked === 0) {
          continue;
        }
        const amountToUnstake = Math.min(remainingAmount, stakeAccounts[i].staked);
        const marketCoin = normalMethod.unstake(stakeAccounts[i].id, amountToUnstake, stakeMarketCoinName);
        stakeMarketCoins.push(marketCoin);
        remainingAmount -= amountToUnstake;
        if (remainingAmount === 0) {
          break;
        }
      }
      return stakeMarketCoins;
    },
    claimQuick: async (stakeMarketCoinName, stakeAccountId) => {
      const stakeAccountIds = await requireStakeAccountIds(builder, txBlock, stakeMarketCoinName, stakeAccountId);
      const rewardCoins: TransactionResult[] = [];
      stakeAccountIds.forEach((accountId) => {
        const rewardCoin = normalMethod.claim(accountId, stakeMarketCoinName);
        rewardCoins.push(rewardCoin);
      });
      return rewardCoins;
    },
  };
};
