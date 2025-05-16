import { normalizeStructTag, SUI_CLOCK_OBJECT_ID, SUI_TYPE_ARG } from '@mysten/sui/utils';
import { ScallopQuery, ScallopTxBlock } from '@scallop-io/sui-scallop-sdk';

export const isObligationMigrated = async (query: ScallopQuery, obligationId: string) => {
  const obligation = await query.scallopSuiKit.client.getObject({
    id: obligationId,
    options: {
      showContent: true,
    },
  });

  if (obligation?.data?.content?.dataType !== 'moveObject') {
    return false;
  }
  const fields = obligation.data.content.fields as any;
  const lockKey = fields.lock_key?.fields.name as string;
  if (!lockKey) {
    return false;
  }
  const borrowIncentiveObjectId = query.address.get('borrowIncentive.object');
  return lockKey === `${borrowIncentiveObjectId.slice(2)}::incentive_account::IncentiveProgramLockKey`;
};

const OldBorrowIncentiveContract = {
  id: '0xc63072e7f5f4983a2efaf5bdba1480d5e7d74d57948e1c7cc436f8e22cbeb410',
  incentivePools: '0x64972b713ccec45ec3964809e477cea6f97350c0c50ca3aec85bb631639266ec',
  incentiveAccounts: '0x3c0b707068bdcea8bb859d751ad3e2149a9f83c13fcf4054ef91372a00bccdd3',
} as const;

export const OldBorrowIncentiveTxBuilder = {
  unstakeObligation: (tx: ScallopTxBlock, obligationKey: string, obligationId: string) =>
    tx.moveCall(
      `${OldBorrowIncentiveContract.id}::user::unstake`,
      [
        OldBorrowIncentiveContract.incentivePools,
        OldBorrowIncentiveContract.incentiveAccounts,
        tx.object(obligationKey),
        tx.object(obligationId),
        SUI_CLOCK_OBJECT_ID,
      ],
      [normalizeStructTag(SUI_TYPE_ARG)],
    ),
  redeem_rewards: (tx: ScallopTxBlock, obligationKey: string, obligationId: string, rewardType: string) =>
    tx.moveCall(
      `${OldBorrowIncentiveContract.id}::user::redeem_rewards`,
      [
        OldBorrowIncentiveContract.incentivePools,
        OldBorrowIncentiveContract.incentiveAccounts,
        tx.object(obligationKey),
        tx.object(obligationId),
        SUI_CLOCK_OBJECT_ID,
      ],
      [normalizeStructTag(rewardType)],
    ),
} as const;
