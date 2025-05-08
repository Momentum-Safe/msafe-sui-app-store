/* eslint-disable no-restricted-syntax */
import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { CoinStruct, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

export const suiCoinType = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI';

export const normalizeSuiCoinType = (coinType: string) => {
  if (coinType !== '0x2::sui::SUI') {
    return coinType;
  }
  return '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI';
};

export const getUserCoins = async ({
  suiClient,
  address,
  type,
}: {
  suiClient: SuiClient;
  address: string;
  type: string;
}) => {
  let cursor;
  let coins: CoinStruct[] = [];
  let iter = 0;
  do {
    try {
      const res = await suiClient.getCoins({
        owner: address,
        coinType: type,
        cursor,
        limit: 50,
      });
      coins = coins.concat(res.data);
      cursor = res.nextCursor;
      if (!res.hasNextPage || iter === 8) {
        cursor = null;
      }
    } catch (error) {
      console.log(error);
      cursor = null;
    }
    iter++;
  } while (cursor !== null);
  return coins;
};

const getCoinsGreaterThanAmount = (amount: bigint, coins: { balance: bigint; objectId: string }[]) => {
  const coinsWithBalance: string[] = [];
  let collectedAmount = BigInt(0);
  for (const coin of coins) {
    if (collectedAmount < amount && !coinsWithBalance.includes(coin.objectId)) {
      coinsWithBalance.push(coin.objectId);
      collectedAmount += BigInt(coin.balance);
    }
    if (coin.balance === BigInt(0) && !coinsWithBalance.includes(coin.objectId)) {
      coinsWithBalance.push(coin.objectId);
    }
  }
  if (collectedAmount >= amount) {
    return coinsWithBalance;
  }
  throw new Error('Insufficient balance');
};

export const getExactCoinByAmountInner = (
  coinType: string,
  coins: { balance: bigint; objectId: string }[],
  amount: bigint,
  txb: Transaction,
) => {
  if (coinType === suiCoinType) {
    const [coinA] = txb.splitCoins(txb.gas, [txb.pure.u64(amount)]);
    return coinA;
    // eslint-disable-next-line no-else-return
  } else {
    const coinsX = getCoinsGreaterThanAmount(amount, coins);
    if (coinsX.length > 1) {
      txb.mergeCoins(
        txb.object(coinsX[0]),
        coinsX.slice(1).map((coin) => txb.object(coin)),
      );
    }
    const [coinA] = txb.splitCoins(txb.object(coinsX[0]), [txb.pure.u64(amount)]);
    return coinA;
  }
};

export async function getExactCoinByAmount(
  mmtSdk: MmtSDK,
  address: string,
  coinType: string,
  amount: bigint,
  tx: Transaction,
) {
  const userCoins = await getUserCoins({
    suiClient: mmtSdk.rpcClient,
    address,
    type: coinType,
  });

  const coin = getExactCoinByAmountInner(
    normalizeSuiCoinType(coinType),
    userCoins.map((item) => ({
      balance: BigInt(item.balance),
      objectId: item.coinObjectId,
    })),
    amount,
    tx,
  );

  return coin;
}
