import { TransactionArgument, TransactionObjectArgument } from '@mysten/sui.js/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';

import { requireVeSca } from './borrowIncentiveBuilder';
import { SCA_COIN_TYPE } from '../constants';
import { GenerateVeScaNormalMethod, GenerateVeScaQuickMethod, SuiAddressArg, SuiObjectArg, VescaIds } from '../types';
import {
  requireSender,
  checkLockSca,
  checkExtendLockPeriod,
  checkExtendLockAmount,
  checkRenewExpiredVeSca,
  checkVesca,
} from '../utils';

/**
 * Generate veSCA normal methods.
 *
 * @param builder - Scallop builder instance.
 * @param txBlock - TxBlock created by SuiKit .
 * @return veSCA normal methods.
 */
export const generateNormalVeScaMethod: GenerateVeScaNormalMethod = ({ builder, txBlock }) => {
  const veScaIds: VescaIds = {
    pkgId: builder.address.get('vesca.id'),
    table: builder.address.get('vesca.table'),
    treasury: builder.address.get('vesca.treasury'),
    config: builder.address.get('vesca.config'),
  };

  return {
    lockSca: (scaCoin, unlockAtInSecondTimestamp) =>
      txBlock.moveCall({
        target: `${veScaIds.pkgId}::ve_sca::mint_ve_sca_key`,
        arguments: [
          txBlock.object(veScaIds.config),
          txBlock.object(veScaIds.table),
          txBlock.object(veScaIds.treasury),
          typeof scaCoin === 'string' ? txBlock.pure(scaCoin) : (scaCoin as TransactionArgument),
          txBlock.pure(unlockAtInSecondTimestamp),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
      }),
    extendLockPeriod: (veScaKey, newUnlockAtInSecondTimestamp) => {
      txBlock.moveCall({
        target: `${veScaIds.pkgId}::ve_sca::extend_lock_period`,
        arguments: [
          txBlock.object(veScaIds.config),
          txBlock.object(veScaKey as string),
          txBlock.object(veScaIds.table),
          txBlock.object(veScaIds.treasury),
          txBlock.pure(newUnlockAtInSecondTimestamp),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
    },
    extendLockAmount: (veScaKey, scaCoin) => {
      txBlock.moveCall({
        target: `${veScaIds.pkgId}::ve_sca::lock_more_sca`,
        arguments: [
          txBlock.object(veScaIds.config),
          txBlock.object(veScaKey as string),
          txBlock.object(veScaIds.table),
          txBlock.object(veScaIds.treasury),
          typeof scaCoin === 'string' ? txBlock.pure(scaCoin) : (scaCoin as TransactionArgument),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
    },
    renewExpiredVeSca: (veScaKey, scaCoin, newUnlockAtInSecondTimestamp) => {
      txBlock.moveCall({
        target: `${veScaIds.pkgId}::ve_sca::renew_expired_ve_sca`,
        arguments: [
          txBlock.object(veScaIds.config),
          txBlock.object(veScaKey as string),
          txBlock.object(veScaIds.table),
          txBlock.object(veScaIds.treasury),
          typeof scaCoin === 'string' ? txBlock.pure(scaCoin) : (scaCoin as TransactionArgument),
          txBlock.pure(newUnlockAtInSecondTimestamp),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
    },
    redeemSca: (veScaKey) =>
      txBlock.moveCall({
        target: `${veScaIds.pkgId}::ve_sca::redeem`,
        arguments: [
          txBlock.object(veScaIds.config),
          txBlock.object(veScaKey as string),
          txBlock.object(veScaIds.table),
          txBlock.object(veScaIds.treasury),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
      }),
    mintEmptyVeSca: () =>
      txBlock.moveCall({
        target: `${veScaIds.pkgId}::ve_sca::mint_ve_sca_placeholder_key`,
        arguments: [txBlock.object(veScaIds.config), txBlock.object(veScaIds.table)],
        typeArguments: [],
      }),
  };
};

/**
 * Generate veSCA quick methods.
 *
 * @description
 * The quick methods are the same as the normal methods, but they will automatically
 * help users organize transaction blocks, include get veSca info, and transfer
 * coins to the sender. So, they are all asynchronous methods.
 *
 * @param builder - Scallop builder instance.
 * @param txBlock - TxBlock created by SuiKit .
 * @return veSCA quick methods.
 */
export const generateQuickVeScaMethod: GenerateVeScaQuickMethod = ({ builder, txBlock }) => {
  const normalMethod = generateNormalVeScaMethod({ builder, txBlock });
  return {
    normalMethod,
    lockScaQuick: async (amountOrCoin, lockPeriodInDays, autoCheck = true) => {
      const sender = requireSender(txBlock);
      const veSca = await requireVeSca(builder, txBlock);

      let scaCoin: TransactionObjectArgument | SuiObjectArg | undefined;
      const transferObjects = [];
      if (amountOrCoin !== undefined && typeof amountOrCoin === 'number') {
        const coins = await builder.utils.selectCoinIds(amountOrCoin, SCA_COIN_TYPE, sender);
        const [takeCoin, leftCoin] = builder.utils.takeAmountFromCoins(txBlock, coins, amountOrCoin);
        scaCoin = takeCoin;
        transferObjects.push(leftCoin);
      } else {
        // With amountOrCoin is SuiObjectArg, we cannot validate the minimum sca amount for locking and topup
        scaCoin = amountOrCoin as SuiObjectArg;
      }

      const newUnlockAt = builder.utils.getUnlockAt(lockPeriodInDays, veSca?.unlockAt);
      if (autoCheck) {
        checkLockSca(amountOrCoin, lockPeriodInDays, newUnlockAt, veSca?.unlockAt);
      }
      console.log(
        new Date(newUnlockAt * 1000).toLocaleString('en-CA', {
          hour12: true,
        }),
      );

      const isInitialLock = !veSca?.unlockAt;
      const isLockExpired = !isInitialLock && veSca.unlockAt * 1000 <= new Date().getTime();
      if (isInitialLock || isLockExpired) {
        if (scaCoin) {
          if (isInitialLock) {
            const veScaKey = normalMethod.lockSca(scaCoin, newUnlockAt);
            transferObjects.push(veScaKey);
          } else {
            // user must withdraw current unlocked SCA first if any
            if (veSca.lockedScaAmount !== 0) {
              const unlockedSca = normalMethod.redeemSca(veSca.keyId);
              transferObjects.push(unlockedSca);
            }
            // enforce renew on expired
            normalMethod.renewExpiredVeSca(veSca.keyId, scaCoin, newUnlockAt);
          }
        }
      } else if (!!scaCoin && !!lockPeriodInDays) {
        normalMethod.extendLockPeriod(veSca.keyId, newUnlockAt);
        normalMethod.extendLockAmount(veSca.keyId, scaCoin);
      } else if (lockPeriodInDays) {
        normalMethod.extendLockPeriod(veSca.keyId, newUnlockAt);
      } else if (scaCoin) {
        normalMethod.extendLockAmount(veSca.keyId, scaCoin);
      }

      if (transferObjects.length > 0) {
        txBlock.transferObjects(transferObjects, sender);
      }
    },
    extendLockPeriodQuick: async (lockPeriodInDays: number, veScaKey?: SuiAddressArg, autoCheck = true) => {
      const veSca = await requireVeSca(builder, txBlock, veScaKey);

      const newUnlockAt = builder.utils.getUnlockAt(lockPeriodInDays);
      if (autoCheck) {
        checkExtendLockPeriod(lockPeriodInDays, newUnlockAt, veSca?.unlockAt);
      }

      if (veSca) {
        normalMethod.extendLockPeriod(veSca.keyId, newUnlockAt);
      }
    },
    extendLockAmountQuick: async (scaAmount: number, veScaKey?: SuiAddressArg, autoCheck = true) => {
      const sender = requireSender(txBlock);
      const veSca = await requireVeSca(builder, txBlock, veScaKey);

      if (autoCheck) {
        checkExtendLockAmount(scaAmount, veSca?.unlockAt);
      }

      if (veSca) {
        const scaCoins = await builder.utils.selectCoinIds(scaAmount, SCA_COIN_TYPE, sender);
        const [takeCoin, leftCoin] = builder.utils.takeAmountFromCoins(txBlock, scaCoins, scaAmount);

        normalMethod.extendLockAmount(veSca.keyId, takeCoin);
        txBlock.transferObjects([leftCoin], sender);
      }
    },
    renewExpiredVeScaQuick: async (
      scaAmount: number,
      lockPeriodInDays: number,
      veScaKey?: SuiAddressArg,
      autoCheck = true,
    ) => {
      const sender = requireSender(txBlock);
      const veSca = await requireVeSca(builder, txBlock, veScaKey);

      const newUnlockAt = builder.utils.getUnlockAt(lockPeriodInDays, veSca?.unlockAt);
      if (autoCheck) {
        checkRenewExpiredVeSca(scaAmount, lockPeriodInDays, veSca?.unlockAt);
      }

      if (veSca) {
        const transferObjects = [];
        if (veSca.lockedScaAmount !== 0) {
          const unlockedSca = normalMethod.redeemSca(veSca.keyId);
          transferObjects.push(unlockedSca);
        }
        const scaCoins = await builder.utils.selectCoinIds(scaAmount, SCA_COIN_TYPE, sender);
        const [takeCoin, leftCoin] = builder.utils.takeAmountFromCoins(txBlock, scaCoins, scaAmount);
        transferObjects.push(leftCoin);

        normalMethod.renewExpiredVeSca(veSca.keyId, takeCoin, newUnlockAt);
        txBlock.transferObjects(transferObjects, sender);
      }
    },
    redeemScaQuick: async (veScaKey?: SuiAddressArg) => {
      const sender = requireSender(txBlock);
      const veSca = await requireVeSca(builder, txBlock, veScaKey);

      checkVesca(veSca?.unlockAt);

      if (veSca) {
        const sca = normalMethod.redeemSca(veSca.keyId);
        txBlock.transferObjects([sca], sender);
      }
    },
  };
};
