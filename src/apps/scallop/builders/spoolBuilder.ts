import { TransactionBlock } from '@mysten/sui.js/transactions';
import type { TransactionArgument, TransactionResult } from '@mysten/sui.js/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';

import { generateSCoinNormalMethod } from './sCoinBuilder';
import { SUPPORT_SPOOLS } from '../constants';
import { spoolRewardCoins } from '../constants/enum';
import type { ScallopBuilder } from '../models';
import { getStakeAccounts } from '../queries/spoolQuery';
import type {
  SpoolIds,
  GenerateSpoolNormalMethod,
  GenerateSpoolQuickMethod,
  SupportStakeMarketCoins,
  SuiAddressArg,
  StakePoolIds,
  RewardPoolIds,
  StakeMarketCoinTypes,
} from '../types';
import { requireSender } from '../utils';

const stakeHelper = async (
  builder: ScallopBuilder,
  txBlock: TransactionBlock,
  stakeAccount: SuiAddressArg,
  coinName: SupportStakeMarketCoins,
  amount: number,
  sender: string,
  isSCoin = false,
) => {
  const scoinNormalMethod = await generateSCoinNormalMethod({ builder, txBlock });
  const spoolNormalMethod = await generateSpoolNormalMethod({ builder, txBlock });
  try {
    const { takeCoin, leftCoin, totalAmount } = isSCoin
      ? await builder.selectSCoin(txBlock, coinName, amount, sender)
      : await builder.selectMarketCoin(txBlock, coinName, amount, sender);
    if (isSCoin) {
      const marketCoin = scoinNormalMethod.burnSCoin(coinName, takeCoin);
      spoolNormalMethod.stake(stakeAccount, marketCoin, coinName);
    } else {
      spoolNormalMethod.stake(stakeAccount, takeCoin, coinName);
    }
    txBlock.transferObjects([leftCoin], sender);
    return totalAmount;
  } catch (e) {
    return 0;
  }
};

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
export const generateSpoolNormalMethod: GenerateSpoolNormalMethod = async ({ builder, txBlock }) => {
  const spoolIds: SpoolIds = {
    spoolPkg: builder.address.get('spool.id'),
  };
  const stakePoolIds: StakePoolIds = {};
  const rewardPoolIds: RewardPoolIds = {};
  const stakeMarketCoinTypes: StakeMarketCoinTypes = {};
  SUPPORT_SPOOLS.forEach((stakeMarketCoinName) => {
    const spoolId = builder.address.get(`spool.pools.${stakeMarketCoinName}.id`);
    const rewardId = builder.address.get(`spool.pools.${stakeMarketCoinName}.rewardPoolId`);
    const marketCoinType = builder.utils.parseMarketCoinType(stakeMarketCoinName);
    stakePoolIds[stakeMarketCoinName] = spoolId;
    rewardPoolIds[stakeMarketCoinName] = rewardId;
    stakeMarketCoinTypes[stakeMarketCoinName] = marketCoinType;
  });
  return {
    createStakeAccount: (stakeMarketCoinName) => {
      const marketCoinType = stakeMarketCoinTypes[stakeMarketCoinName];
      const stakePoolId = stakePoolIds[stakeMarketCoinName];
      return txBlock.moveCall({
        target: `${spoolIds.spoolPkg}::user::new_spool_account`,
        arguments: [txBlock.object(stakePoolId), txBlock.object(SUI_CLOCK_OBJECT_ID)],
        typeArguments: [marketCoinType],
      });
    },
    stake: (stakeAccount, coin, stakeMarketCoinName) => {
      const marketCoinType = stakeMarketCoinTypes[stakeMarketCoinName];
      const stakePoolId = stakePoolIds[stakeMarketCoinName];
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
      const marketCoinType = stakeMarketCoinTypes[stakeMarketCoinName];
      const stakePoolId = stakePoolIds[stakeMarketCoinName];
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
      const stakePoolId = stakePoolIds[stakeMarketCoinName];
      const rewardPoolId = rewardPoolIds[stakeMarketCoinName];
      const marketCoinType = stakeMarketCoinTypes[stakeMarketCoinName];
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
export const generateSpoolQuickMethod: GenerateSpoolQuickMethod = async ({ builder, txBlock }) => {
  const normalMethod = await generateSpoolNormalMethod({ builder, txBlock });
  const scoinMethod = await generateSCoinNormalMethod({ builder, txBlock });
  return {
    normalMethod,
    stakeQuick: async (amountOrMarketCoin, stakeMarketCoinName, stakeAccountId) => {
      const sender = requireSender(txBlock);
      const stakeAccountIds = await requireStakeAccountIds(builder, txBlock, stakeMarketCoinName, stakeAccountId);

      if (typeof amountOrMarketCoin === 'number') {
        // try stake market coin
        const stakedMarketCoinAmount = await stakeHelper(
          builder,
          txBlock,
          stakeAccountIds[0],
          stakeMarketCoinName,
          amountOrMarketCoin,
          sender,
        );

        // eslint-disable-next-line no-param-reassign
        amountOrMarketCoin -= stakedMarketCoinAmount;
        // no market coin, try sCoin
        if (!stakedMarketCoinAmount) {
          await stakeHelper(
            builder,
            txBlock,
            stakeAccountIds[0],
            stakeMarketCoinName,
            amountOrMarketCoin,
            sender,
            true,
          );
        }
      } else {
        normalMethod.stake(stakeAccountIds[0], amountOrMarketCoin, stakeMarketCoinName);
      }
    },
    unstakeQuick: async (amount, stakeMarketCoinName, stakeAccountId) => {
      const stakeAccounts = await requireStakeAccounts(builder, txBlock, stakeMarketCoinName, stakeAccountId);
      const toTransfer: TransactionResult[] = [];
      stakeAccounts.forEach((account) => {
        if (account.staked === 0) {
          return;
        }
        const amountToUnstake = Math.min(amount, account.staked);
        const marketCoin = normalMethod.unstake(account.id, amountToUnstake, stakeMarketCoinName);
        const sCoin = scoinMethod.mintSCoin(stakeMarketCoinName, marketCoin);
        toTransfer.push(sCoin);
      });

      if (toTransfer.length > 0) {
        const mergedCoin = toTransfer[0];
        if (toTransfer.length > 1) {
          txBlock.mergeCoins(mergedCoin, toTransfer.slice(1));
        }

        // check for existing sCoins
        try {
          const existingCoins = await builder.utils.selectCoinIds(
            Number.MAX_SAFE_INTEGER,
            builder.utils.parseSCoinType(stakeMarketCoinName),
            requireSender(txBlock),
          );

          if (existingCoins.length > 0) {
            txBlock.mergeCoins(mergedCoin, existingCoins);
          }
        } catch (e) {
          console.log(e);
          // ignore
        }
        return mergedCoin;
      }
      return undefined;
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
