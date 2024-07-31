import type { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui.js/client';
import type { TransactionBlock } from '@mysten/sui.js/transactions';

import type { ScallopAddress, ScallopQuery, ScallopUtils, ScallopBuilder } from '../models';

export type NetworkType = 'testnet' | 'mainnet' | 'devnet' | 'localnet';

export type ScallopClientFnReturnType<T extends boolean> = T extends true
  ? SuiTransactionBlockResponse
  : TransactionBlock;

export type ScallopInstanceParams = {
  address?: ScallopAddress;
  query?: ScallopQuery;
  utils?: ScallopUtils;
  builder?: ScallopBuilder;
};

export type ScallopAddressParams = {
  id: string;
};

export type ScallopParams = {
  addressesId?: string;
  networkType?: NetworkType;
  client?: SuiClient;
};

export type ScallopClientParams = ScallopParams & {
  walletAddress?: string;
};

export type ScallopBuilderParams = ScallopParams & {
  walletAddress?: string;
  pythEndpoints?: string[];
};

export type ScallopQueryParams = ScallopParams;

export type ScallopUtilsParams = ScallopParams & {
  pythEndpoints?: string[];
};
