import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';

import { OLD_BORROW_INCENTIVE_PROTOCOL_ID } from '../constants';
import { borrowIncentiveRewardCoins } from '../constants/enum';
import type { ScallopBuilder } from '../models';
import { getObligations, getObligationLocked, getVeSca, getVeScas } from '../queries';
import type {
  BorrowIncentiveIds,
  GenerateBorrowIncentiveNormalMethod,
  GenerateBorrowIncentiveQuickMethod,
  SuiTxBlockWithBorrowIncentiveNormalMethods,
  BorrowIncentiveTxBlock,
  ScallopTxBlock,
  VescaIds,
  SuiAddressArg,
} from '../types';
import { requireSender } from '../utils';

/**
 * Check and get veSCA data from transaction block.
 *
 * @description
 * If the veScaKey id is provided, directly return it.
 * Otherwise, automatically get veScaKey from the sender.
 *
 * @param builder - Scallop builder instance.
 * @param txBlock - TxBlock created by SuiKit.
 * @param veScaKey - veSCA key.
 * @return veSCA key, ID, locked amount and unlock at timestamp.
 */

export const requireVeSca = async (
  ...params: [builder: ScallopBuilder, SuiTxBlock: TransactionBlock, veScaKey?: SuiAddressArg]
) => {
  const [builder, txBlock, veScaKey] = params;
  if (params.length === 3 && veScaKey && typeof veScaKey === 'string') {
    const veSca = await getVeSca(builder.query, veScaKey);

    if (!veSca) {
      return undefined;
    }

    return veSca;
  }

  const sender = requireSender(txBlock);
  const veScas = await getVeScas(builder.query, sender);
  if (veScas.length === 0) {
    return undefined;
  }

  return veScas[0];
};

/**
 * Check veSca bind status
 * @param query
 * @param veScaKey
 * @returns
 */
export const getBindedObligationId = async (builder: ScallopBuilder, veScaKey: string) => {
  const borrowIncentivePkgId = builder.address.get('borrowIncentive.id');
  const incentivePoolsId = builder.address.get('borrowIncentive.incentivePools');
  const veScaPkgId = builder.address.get('vesca.id');

  const { client } = builder;

  // get incentive pools
  const incentivePoolsResponse = await client.getObject({
    id: incentivePoolsId,
    options: {
      showContent: true,
    },
  });

  if (incentivePoolsResponse.data?.content?.dataType !== 'moveObject') {
    return false;
  }
  const incentivePoolFields = incentivePoolsResponse.data.content.fields as any;
  const veScaBindTableId = incentivePoolFields.ve_sca_bind.fields.id.id as string;

  // check if veSca is inside the bind table
  const keyType = `${borrowIncentivePkgId}::typed_id::TypedID<${veScaPkgId}::ve_sca::VeScaKey>`;
  const veScaBindTableResponse = await client.getDynamicFieldObject({
    parentId: veScaBindTableId,
    name: {
      type: keyType,
      value: veScaKey,
    },
  });

  if (veScaBindTableResponse.data?.content?.dataType !== 'moveObject') {
    return false;
  }
  const veScaBindTableFields = veScaBindTableResponse.data.content.fields as any;
  // get obligationId pair
  const obligationId = veScaBindTableFields.value.fields.id as string;

  return obligationId;
};

/**
 * Check and get Obligation information from transaction block.
 *
 * @description
 * If the obligation id is provided, direactly return it.
 * If both obligation id and key is provided, direactly return them.
 * Otherwise, automatically get obligation id and key from the sender.
 *
 * @param builder - Scallop builder instance.
 * @param txBlock - TxBlock created by SuiKit.
 * @param obligationId - Obligation id.
 * @param obligationKey - Obligation key.
 * @return Obligation id and key.
 */
const requireObligationInfo = async (
  ...params: [builder: ScallopBuilder, txBlock: TransactionBlock, obligationId?: string, obligationKey?: string]
) => {
  const [builder, txBlock, obligationId, obligationKey] = params;
  if (params.length === 4 && obligationId && obligationKey && typeof obligationId === 'string') {
    const obligationLocked = await getObligationLocked(builder.query, obligationId);
    return { obligationId, obligationKey, obligationLocked };
  }
  const sender = requireSender(txBlock);
  const obligations = await getObligations(builder.query, sender);
  if (obligations.length === 0) {
    throw new Error(`No obligation found for sender ${sender}`);
  }
  return {
    obligationId: obligations[0].id,
    obligationKey: obligations[0].keyId,
    obligationLocked: obligations[0].locked,
  };
};

/**
 * Generate borrow incentive normal methods.
 *
 * @param builder - Scallop builder instance.
 * @param txBlock - TxBlock created by SuiKit .
 * @return Borrow incentive normal methods.
 */
export const generateBorrowIncentiveNormalMethod: GenerateBorrowIncentiveNormalMethod = ({ builder, txBlock }) => {
  const borrowIncentiveIds: BorrowIncentiveIds = {
    borrowIncentivePkg: builder.address.get('borrowIncentive.id'),
    query: builder.address.get('borrowIncentive.query'),
    incentivePools: builder.address.get('borrowIncentive.incentivePools'),
    incentiveAccounts: builder.address.get('borrowIncentive.incentiveAccounts'),
    obligationAccessStore: builder.address.get('core.obligationAccessStore'),
    config: builder.address.get('borrowIncentive.config'),
  };
  const veScaIds: Omit<VescaIds, 'pkgId'> = {
    table: builder.address.get('vesca.table'),
    treasury: builder.address.get('vesca.treasury'),
    config: builder.address.get('vesca.config'),
  };
  return {
    stakeObligation: (obligationId, obligationKey) => {
      txBlock.moveCall({
        target: `${borrowIncentiveIds.borrowIncentivePkg}::user::stake`,
        arguments: [
          txBlock.object(borrowIncentiveIds.incentivePools),
          txBlock.object(borrowIncentiveIds.incentiveAccounts),
          txBlock.object(obligationKey as string),
          txBlock.object(obligationId as string),
          txBlock.object(borrowIncentiveIds.obligationAccessStore),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
    },
    stakeObligationWithVesca: (obligationId, obligationKey, veScaKey) => {
      txBlock.moveCall({
        target: `${borrowIncentiveIds.borrowIncentivePkg}::user::stake_with_ve_sca`,
        arguments: [
          txBlock.object(borrowIncentiveIds.config),
          txBlock.object(borrowIncentiveIds.incentivePools),
          txBlock.object(borrowIncentiveIds.incentiveAccounts),
          txBlock.object(obligationKey as string),
          txBlock.object(obligationId as string),
          txBlock.object(borrowIncentiveIds.obligationAccessStore),
          txBlock.object(veScaIds.config),
          txBlock.object(veScaIds.treasury),
          txBlock.object(veScaIds.table),
          txBlock.object(veScaKey as string),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
    },
    unstakeObligation: (obligationId, obligationKey) => {
      txBlock.moveCall({
        target: `${borrowIncentiveIds.borrowIncentivePkg}::user::unstake`,
        arguments: [
          txBlock.object(borrowIncentiveIds.incentivePools),
          txBlock.object(borrowIncentiveIds.incentiveAccounts),
          txBlock.object(obligationKey as string),
          txBlock.object(obligationId as string),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
    },
    claimBorrowIncentive: (obligationId, obligationKey, coinName, rewardCoinName) => {
      const rewardCoinNames = borrowIncentiveRewardCoins[coinName];
      if (rewardCoinNames.includes(rewardCoinName) === false) {
        throw new Error(`Invalid reward coin name ${rewardCoinName}`);
      }
      const rewardType = builder.utils.parseCoinType(rewardCoinName);
      return txBlock.moveCall({
        target: `${borrowIncentiveIds.borrowIncentivePkg}::user::redeem_rewards`,
        arguments: [
          txBlock.object(borrowIncentiveIds.incentivePools),
          txBlock.object(borrowIncentiveIds.incentiveAccounts),
          txBlock.object(obligationKey as string),
          txBlock.object(obligationId as string),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [rewardType],
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
export const generateBorrowIncentiveQuickMethod: GenerateBorrowIncentiveQuickMethod = ({ builder, txBlock }) => {
  const normalMethod = generateBorrowIncentiveNormalMethod({ builder, txBlock });
  return {
    normalMethod,
    stakeObligationQuick: async (obligation, obligationKey) => {
      const {
        obligationId: obligationArg,
        obligationKey: obligationtKeyArg,
        obligationLocked,
      } = await requireObligationInfo(builder, txBlock, obligation as string, obligationKey as string);

      const unstakeObligationBeforeStake = !!txBlock.blockData.transactions.find(
        (txn) =>
          txn.kind === 'MoveCall' && txn.target === `${builder.address.get('borrowIncentive.id')}::user::unstake`,
      );

      if (!obligationLocked || unstakeObligationBeforeStake) {
        normalMethod.stakeObligation(obligationArg, obligationtKeyArg);
      }
    },
    unstakeObligationQuick: async (obligation, obligationKey) => {
      const {
        obligationId: obligationArg,
        obligationKey: obligationtKeyArg,
        obligationLocked,
      } = await requireObligationInfo(builder, txBlock, obligation as string, obligationKey as string);

      if (obligationLocked) {
        normalMethod.unstakeObligation(obligationArg, obligationtKeyArg);
      }
    },
    stakeObligationWithVeScaQuick: async (obligation, obligationKey, veScaKey) => {
      const {
        obligationId: obligationArg,
        obligationKey: obligationtKeyArg,
        obligationLocked,
      } = await requireObligationInfo(builder, txBlock, obligation as string, obligationKey as string);

      const unstakeObligationBeforeStake = !!txBlock.blockData.transactions.find(
        (txn) =>
          txn.kind === 'MoveCall' &&
          (txn.target === `${OLD_BORROW_INCENTIVE_PROTOCOL_ID}::user::unstake` ||
            txn.target === `${builder.address.get('borrowIncentive.id')}::user::unstake`),
      );

      if (!obligationLocked || unstakeObligationBeforeStake) {
        const veSca = await requireVeSca(builder, txBlock, veScaKey);
        if (veSca) {
          const bindedObligationId = await getBindedObligationId(builder, veSca.keyId);
          // if bindedObligationId is equal to obligationId, then use it again
          if (!bindedObligationId || bindedObligationId === obligationArg) {
            normalMethod.stakeObligationWithVesca(obligationArg, obligationtKeyArg, veSca.keyId);
          } else {
            normalMethod.stakeObligation(obligationArg, obligationtKeyArg);
          }
        } else {
          normalMethod.stakeObligation(obligationArg, obligationtKeyArg);
        }
      }
    },
    claimBorrowIncentiveQuick: async (coinName, rewardCoinName, obligation, obligationKey) => {
      const { obligationId: obligationArg, obligationKey: obligationtKeyArg } = await requireObligationInfo(
        builder,
        txBlock,
        obligation as string,
        obligationKey as string,
      );

      return normalMethod.claimBorrowIncentive(obligationArg, obligationtKeyArg, coinName, rewardCoinName);
    },
  };
};

/**
 * Create an enhanced transaction block instance for interaction with borrow incentive modules of the Scallop contract.
 *
 * @param builder - Scallop builder instance.
 * @param initTxBlock - Scallop txBlock, txBlock created by SuiKit, or original transaction block.
 * @return Scallop borrow incentive txBlock.
 */
export const newBorrowIncentiveTxBlock = (builder: ScallopBuilder, initTxBlock?: ScallopTxBlock | TransactionBlock) => {
  const txBlock =
    initTxBlock instanceof TransactionBlock ? new TransactionBlock(initTxBlock) : initTxBlock || new TransactionBlock();

  const normalMethod = generateBorrowIncentiveNormalMethod({
    builder,
    txBlock,
  });

  const normalTxBlock = new Proxy(txBlock, {
    get: (target, prop) => {
      if (prop in normalMethod) {
        return Reflect.get(normalMethod, prop);
      }
      return Reflect.get(target, prop);
    },
  }) as SuiTxBlockWithBorrowIncentiveNormalMethods;

  const quickMethod = generateBorrowIncentiveQuickMethod({
    builder,
    txBlock: normalTxBlock,
  });

  return new Proxy(normalTxBlock, {
    get: (target, prop) => {
      if (prop in quickMethod) {
        return Reflect.get(quickMethod, prop);
      }
      return Reflect.get(target, prop);
    },
  }) as BorrowIncentiveTxBlock;
};
