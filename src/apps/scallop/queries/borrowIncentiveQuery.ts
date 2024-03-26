import { TransactionBlock } from '@mysten/sui.js/transactions';

import { SUPPORT_BORROW_INCENTIVE_POOLS } from '../constants';
import type { ScallopQuery } from '../models';
import type {
  BorrowIncentiveAccountsQueryInterface,
  BorrowIncentiveAccounts,
  SupportBorrowIncentiveCoins,
} from '../types';
import { parseOriginBorrowIncentiveAccountData } from '../utils';

/**
 * Query borrow incentive accounts data.
 *
 * @param query - The Scallop query instance.
 * @param borrowIncentiveCoinNames - Specific an array of support borrow incentive coin name.
 * @return Borrow incentive accounts data.
 */
export const queryBorrowIncentiveAccounts = async (
  query: ScallopQuery,
  obligationId: string,
  borrowIncentiveCoinNames?: SupportBorrowIncentiveCoins[],
) => {
  const coinName = borrowIncentiveCoinNames || [...SUPPORT_BORROW_INCENTIVE_POOLS];
  const queryPkgId = query.address.get('borrowIncentive.query');
  const incentiveAccountsId = query.address.get('borrowIncentive.incentiveAccounts');
  const queryTarget =
    `${queryPkgId}::incentive_account_query::incentive_account_data` as `${string}::${string}::${string}`;
  const txBlock = new TransactionBlock();
  txBlock.moveCall({
    target: queryTarget,
    arguments: [txBlock.object(incentiveAccountsId), txBlock.object(obligationId)],
  });
  const queryResult = await query.client.devInspectTransactionBlock({
    transactionBlock: txBlock,
    sender: '',
  });
  const borrowIncentiveAccountsQueryData = queryResult.events[0].parsedJson as BorrowIncentiveAccountsQueryInterface;

  const borrowIncentiveAccounts: BorrowIncentiveAccounts = Object.values(
    borrowIncentiveAccountsQueryData.incentive_states,
  ).reduce((accounts, accountData) => {
    const parsedBorrowIncentiveAccount = parseOriginBorrowIncentiveAccountData(accountData);
    const { poolType } = parsedBorrowIncentiveAccount;
    const parsedCoinName = query.utils.parseCoinNameFromType<SupportBorrowIncentiveCoins>(poolType);
    const updateAccout = { ...accounts };
    if (coinName && coinName.includes(parsedCoinName)) {
      updateAccout[parsedCoinName] = {
        poolType,
        amount: parsedBorrowIncentiveAccount.amount,
        points: parsedBorrowIncentiveAccount.points,
        totalPoints: parsedBorrowIncentiveAccount.totalPoints,
        index: parsedBorrowIncentiveAccount.index,
      };
    }
    return updateAccout;
  }, {} as BorrowIncentiveAccounts);

  return borrowIncentiveAccounts;
};
