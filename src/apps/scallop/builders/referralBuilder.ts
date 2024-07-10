import { TransactionObjectArgument } from '@mysten/sui.js/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';

import { SUPPORT_POOLS } from '../constants';
import {
  SupportCoins,
  SupportPoolCoins,
  GenerateReferralNormalMethod,
  GenerateReferralQuickMethod,
  ReferralIds,
  SuiObjectArg,
} from '../types';

export const generateReferralNormalMethod: GenerateReferralNormalMethod = ({ builder, txBlock }) => {
  const referralIds: ReferralIds = {
    referralPgkId: builder.address.get('referral.id'),
    referralBindings: builder.address.get('referral.referralBindings'),
    referralRevenuePool: builder.address.get('referral.referralRevenuePool'),
    authorizedWitnessList: builder.address.get('referral.authorizedWitnessList'),
    referralTiers: builder.address.get('referral.referralTiers'),
    version: builder.address.get('referral.version'),
  };

  const veScaTable = builder.address.get('vesca.table');

  return {
    bindToReferral: (veScaKeyId: string) =>
      txBlock.moveCall({
        target: `${referralIds.referralPgkId}::referral_bindings::bind_ve_sca_referrer`,
        arguments: [referralIds.referralBindings, txBlock.pure(veScaKeyId), veScaTable, SUI_CLOCK_OBJECT_ID],
        typeArguments: [],
      }),
    claimReferralTicket: (poolCoinName: SupportCoins) => {
      const coinType = builder.utils.parseCoinType(poolCoinName);
      return txBlock.moveCall({
        target: `${referralIds.referralPgkId}::scallop_referral_program::claim_ve_sca_referral_ticket`,
        arguments: [
          txBlock.object(referralIds.version),
          txBlock.object(veScaTable),
          txBlock.object(referralIds.referralBindings),
          txBlock.object(referralIds.authorizedWitnessList),
          txBlock.object(referralIds.referralTiers),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [coinType],
      });
    },
    burnReferralTicket: (ticket: SuiObjectArg, poolCoinName: SupportCoins) => {
      const coinType = builder.utils.parseCoinType(poolCoinName);
      return txBlock.moveCall({
        target: `${referralIds.referralPgkId}::scallop_referral_program::burn_ve_sca_referral_ticket`,
        arguments: [
          txBlock.object(referralIds.version),
          txBlock.object(ticket as string),
          txBlock.object(referralIds.referralRevenuePool),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [coinType],
      });
    },
    claimReferralRevenue: (veScaKey: SuiObjectArg, poolCoinName: SupportCoins) => {
      const coinType = builder.utils.parseCoinType(poolCoinName);
      return txBlock.moveCall({
        target: `${referralIds.referralPgkId}::referral_revenue_pool::claim_revenue_with_ve_sca_key`,
        arguments: [
          txBlock.object(referralIds.version),
          txBlock.object(referralIds.referralRevenuePool),
          txBlock.object(veScaKey as string),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [coinType],
      });
    },
  };
};

export const generateReferralQuickMethod: GenerateReferralQuickMethod = ({ builder, txBlock }) => ({
  claimReferralRevenueQuick: async (
    veScaKey: SuiObjectArg,
    walletAddress: string,
    coinNames: SupportPoolCoins[] = [...SUPPORT_POOLS],
  ) => {
    const objToTransfer: SuiObjectArg[] = [];
    for (let i = 0; i < coinNames.length; i++) {
      if (coinNames[i] === 'sui') {
        const rewardCoin = txBlock.claimReferralRevenue(veScaKey, coinNames[i]);
        objToTransfer.push(rewardCoin);
      } else {
        const rewardCoin = txBlock.claimReferralRevenue(veScaKey, coinNames[i]);
        try {
          // get the matching user coin if exists
          const coins = await builder.utils.selectCoinIds(
            Infinity,
            builder.utils.parseCoinType(coinNames[i]),
            walletAddress,
          );
          txBlock.mergeCoins(rewardCoin, coins.slice(0, 500));
        } catch (e) {
          // ignore
        } finally {
          objToTransfer.push(rewardCoin);
        }
      }
    }
    if (objToTransfer.length > 0) {
      txBlock.transferObjects(objToTransfer as (string | TransactionObjectArgument)[], walletAddress);
    }
  },
});
