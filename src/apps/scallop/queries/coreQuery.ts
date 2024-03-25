import type { SuiObjectResponse, SuiObjectData } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import BigNumber from 'bignumber.js';

import { SUPPORT_POOLS, PROTOCOL_OBJECT_ID } from '../constants';
import type { ScallopQuery } from '../models';
import {
  SupportAssetCoins,
  SupportPoolCoins,
  Obligation,
  CoinAmounts,
  MarketCoinAmounts,
  SupportMarketCoins,
  SuiAddressArg,
  ObligationQueryInterface,
} from '../types';

/**
 * Query all owned obligations.
 *
 * @param query - The Scallop query instance.
 * @param ownerAddress - The owner address.
 * @return Owned obligations.
 */
export const getObligations = async (query: ScallopQuery, ownerAddress: string) => {
  const owner = ownerAddress;
  const protocolObjectId = query.address.get('core.object') || PROTOCOL_OBJECT_ID;
  const keyObjectsResponse: SuiObjectResponse[] = [];
  let hasNextPage = false;
  let nextCursor: string | null = null;
  do {
    const paginatedKeyObjectsResponse = await query.client.getOwnedObjects({
      owner,
      filter: {
        StructType: `${protocolObjectId}::obligation::ObligationKey`,
      },
      cursor: nextCursor,
    });
    keyObjectsResponse.push(...paginatedKeyObjectsResponse.data);
    if (paginatedKeyObjectsResponse.hasNextPage && paginatedKeyObjectsResponse.nextCursor) {
      hasNextPage = true;
      nextCursor = paginatedKeyObjectsResponse.nextCursor;
    } else {
      hasNextPage = false;
    }
  } while (hasNextPage);

  const keyObjectIds: string[] = keyObjectsResponse
    .map((ref: any) => ref?.data?.objectId)
    .filter((id: any) => id !== undefined);
  const keyObjects = await query.client.multiGetObjects({ ids: keyObjectIds });
  const obligations: Obligation[] = [];
  keyObjects.forEach(async (keyObject: any) => {
    const keyId = keyObject.objectId;
    if (keyObject.content && 'fields' in keyObject.content) {
      const fields = keyObject.content.fields as any;
      const obligationId = String(fields.ownership.fields.of);
      const locked = await getObligationLocked(query, obligationId);
      obligations.push({ id: obligationId, keyId, locked });
    }
  });
  return obligations;
};

/**
 * Query obligation locked status.
 *
 * @param query - The Scallop query instance.
 * @param obligationId - The obligation id.
 * @return Obligation locked status.
 */
export const getObligationLocked = async (query: ScallopQuery, obligationId: string) => {
  const obligationObjectResponse = await query.client.getObject({
    id: obligationId,
    options: {
      showContent: true,
    },
  });
  let obligationLocked = false;
  if (
    obligationObjectResponse.data &&
    obligationObjectResponse?.data?.content?.dataType === 'moveObject' &&
    'lock_key' in obligationObjectResponse.data.content.fields
  ) {
    obligationLocked = Boolean(obligationObjectResponse.data.content.fields.lock_key);
  }

  return obligationLocked;
};

/**
 * Query all owned coin amount.
 *
 * @param query - The Scallop query instance.
 * @param assetCoinNames - Specific an array of support asset coin name.
 * @param ownerAddress - The owner address.
 * @return All owned coin amounts.
 */
export const getCoinAmounts = async (
  query: ScallopQuery,
  ownerAddress: string,
  assetCoinNames?: SupportAssetCoins[],
) => {
  const updatedAssetCoinNames = assetCoinNames || [...SUPPORT_POOLS];
  const owner = ownerAddress;
  const coinObjectsResponse: SuiObjectResponse[] = [];
  let hasNextPage = false;
  let nextCursor: string | null = null;
  do {
    const paginatedCoinObjectsResponse = await query.client.getOwnedObjects({
      owner,
      filter: {
        MatchAny: updatedAssetCoinNames.map((assetCoinName) => {
          const coinType = query.utils.parseCoinType(assetCoinName);
          return { StructType: `0x2::coin::Coin<${coinType}>` };
        }),
      },
      options: {
        showType: true,
        showContent: true,
      },
      cursor: nextCursor,
    });

    coinObjectsResponse.push(...paginatedCoinObjectsResponse.data);
    if (paginatedCoinObjectsResponse.hasNextPage && paginatedCoinObjectsResponse.nextCursor) {
      hasNextPage = true;
      nextCursor = paginatedCoinObjectsResponse.nextCursor;
    } else {
      hasNextPage = false;
    }
  } while (hasNextPage);

  const coinAmounts: CoinAmounts = {};
  const coinObjects = coinObjectsResponse
    .map((response) => response.data)
    .filter((object: any) => object !== undefined && object !== null) as SuiObjectData[];
  coinObjects.forEach((coinObject) => {
    const type = coinObject.type as string;
    if (coinObject.content && 'fields' in coinObject.content) {
      const fields = coinObject.content.fields as any;
      const poolCoinName = query.utils.parseCoinNameFromType<SupportPoolCoins>(type);
      if (poolCoinName) {
        coinAmounts[poolCoinName as SupportPoolCoins] = BigNumber(coinAmounts[poolCoinName as SupportPoolCoins] ?? 0)
          .plus(fields.balance)
          .toNumber();
      }
    }
  });
  return coinAmounts;
};

/**
 * Query owned coin amount.
 *
 * @param query - The Scallop query instance.
 * @param assetCoinName - Specific support asset coin name.
 * @param ownerAddress - The owner address.
 * @return Owned coin amount.
 */
export const getCoinAmount = async (query: ScallopQuery, assetCoinName: SupportAssetCoins, ownerAddress?: string) => {
  const owner = ownerAddress;
  const coinType = query.utils.parseCoinType(assetCoinName);
  const coinObjectsResponse: SuiObjectResponse[] = [];
  let hasNextPage = false;
  let nextCursor: string | null = null;
  do {
    const paginatedCoinObjectsResponse = await query.client.getOwnedObjects({
      owner,
      filter: { StructType: `0x2::coin::Coin<${coinType}>` },
      options: {
        showContent: true,
      },
      cursor: nextCursor,
    });

    coinObjectsResponse.push(...paginatedCoinObjectsResponse.data);
    if (paginatedCoinObjectsResponse.hasNextPage && paginatedCoinObjectsResponse.nextCursor) {
      hasNextPage = true;
      nextCursor = paginatedCoinObjectsResponse.nextCursor;
    } else {
      hasNextPage = false;
    }
  } while (hasNextPage);

  let coinAmount = 0;
  const coinObjects = coinObjectsResponse
    .map((response) => response.data)
    .filter((object: any) => object !== undefined && object !== null) as SuiObjectData[];
  coinObjects.forEach((coinObject) => {
    if (coinObject.content && 'fields' in coinObject.content) {
      const fields = coinObject.content.fields as any;
      coinAmount = BigNumber(coinAmount).plus(fields.balance).toNumber();
    }
  });
  return coinAmount;
};

/**
 * Query all owned market coins (sCoin) amount.
 *
 * @param query - The Scallop query instance.
 * @param marketCoinNames - Specific an array of support market coin name.
 * @param ownerAddress - The owner address.
 * @return All owned market coins amount.
 */
export const getMarketCoinAmounts = async (
  query: ScallopQuery,
  ownerAddress: string,
  marketCoinNames?: SupportMarketCoins[],
) => {
  const updatedMarketCoinNames =
    marketCoinNames || [...SUPPORT_POOLS].map((poolCoinName) => query.utils.parseMarketCoinName(poolCoinName));
  const owner = ownerAddress;
  const marketCoinObjectsResponse: SuiObjectResponse[] = [];
  let hasNextPage = false;
  let nextCursor: string | null = null;
  do {
    const paginatedMarketCoinObjectsResponse = await query.client.getOwnedObjects({
      owner,
      filter: {
        MatchAny: updatedMarketCoinNames.map((marketCoinName) => {
          const marketCoinType = query.utils.parseMarketCoinType(marketCoinName);
          return { StructType: `0x2::coin::Coin<${marketCoinType}>` };
        }),
      },
      options: {
        showType: true,
        showContent: true,
      },
      cursor: nextCursor,
    });

    marketCoinObjectsResponse.push(...paginatedMarketCoinObjectsResponse.data);
    if (paginatedMarketCoinObjectsResponse.hasNextPage && paginatedMarketCoinObjectsResponse.nextCursor) {
      hasNextPage = true;
      nextCursor = paginatedMarketCoinObjectsResponse.nextCursor;
    } else {
      hasNextPage = false;
    }
  } while (hasNextPage);

  const marketCoinAmounts: MarketCoinAmounts = {};
  const marketCoinObjects = marketCoinObjectsResponse
    .map((response) => response.data)
    .filter((object: any) => object !== undefined && object !== null) as SuiObjectData[];
  marketCoinObjects.forEach((marketCoinObject) => {
    const type = marketCoinObject.type as string;
    if (marketCoinObject.content && 'fields' in marketCoinObject.content) {
      const fields = marketCoinObject.content.fields as any;
      const marketCoinName = query.utils.parseCoinNameFromType<SupportMarketCoins>(type);
      if (marketCoinName) {
        marketCoinAmounts[marketCoinName as SupportMarketCoins] = BigNumber(
          marketCoinAmounts[marketCoinName as SupportMarketCoins] ?? 0,
        )
          .plus(fields.balance)
          .toNumber();
      }
    }
  });
  return marketCoinAmounts;
};

/**
 * Query owned market coin (sCoin) amount.
 *
 * @param query - The Scallop query instance.
 * @param marketCoinNames - Specific support market coin name.
 * @param ownerAddress - The owner address.
 * @return Owned market coin amount.
 */
export const getMarketCoinAmount = async (
  query: ScallopQuery,
  marketCoinName: SupportMarketCoins,
  ownerAddress: string,
) => {
  const owner = ownerAddress;
  const marketCoinType = query.utils.parseMarketCoinType(marketCoinName);
  const marketCoinObjectsResponse: SuiObjectResponse[] = [];
  let hasNextPage = false;
  let nextCursor: string | null = null;
  do {
    const paginatedMarketCoinObjectsResponse = await query.client.getOwnedObjects({
      owner,
      filter: { StructType: `0x2::coin::Coin<${marketCoinType}>` },
      options: {
        showContent: true,
      },
      cursor: nextCursor,
    });

    marketCoinObjectsResponse.push(...paginatedMarketCoinObjectsResponse.data);
    if (paginatedMarketCoinObjectsResponse.hasNextPage && paginatedMarketCoinObjectsResponse.nextCursor) {
      hasNextPage = true;
      nextCursor = paginatedMarketCoinObjectsResponse.nextCursor;
    } else {
      hasNextPage = false;
    }
  } while (hasNextPage);

  let marketCoinAmount = 0;
  const marketCoinObjects = marketCoinObjectsResponse
    .map((response) => response.data)
    .filter((object: any) => object !== undefined && object !== null) as SuiObjectData[];
  marketCoinObjects.forEach((marketCoinObject) => {
    if (marketCoinObject.content && 'fields' in marketCoinObject.content) {
      const fields = marketCoinObject.content.fields as any;
      marketCoinAmount = BigNumber(marketCoinAmount).plus(fields.balance).toNumber();
    }
  });
  return marketCoinAmount;
};

/**
 * Query obligation data.
 *
 * @description
 * Use inspectTxn call to obtain the data provided in the scallop contract query module.
 *
 * @param query - The Scallop query instance.
 * @param obligationId - The obligation id.
 * @return Obligation data.
 */
export const queryObligation = async (query: ScallopQuery, obligationId: SuiAddressArg) => {
  const packageId = query.address.get('core.packages.query.id');
  const queryTarget = `${packageId}::obligation_query::obligation_data` as `${string}::${string}::${string}`;
  const txBlock = new TransactionBlock();
  txBlock.moveCall({
    target: queryTarget,
    arguments: [txBlock.object(obligationId as string)],
  });
  const queryResult = await query.client.devInspectTransactionBlock({
    transactionBlock: txBlock,
    sender: query.walletAddress,
  });
  return queryResult.events[0].parsedJson as ObligationQueryInterface;
};
