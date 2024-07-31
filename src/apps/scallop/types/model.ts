import type { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui.js/client';
import type { TransactionBlock } from '@mysten/sui.js/transactions';

import type { ScallopAddress, ScallopQuery, ScallopUtils, ScallopBuilder } from '../models';

export type NetworkType = 'testnet' | 'mainnet' | 'devnet' | 'localnet';

export type ScallopClientFnReturnType<T extends boolean> = T extends true
  ? SuiTransactionBlockResponse
  : TransactionBlock;

export type ScallopInstanceParams = {
  address: ScallopAddress;
  query: ScallopQuery;
  utils: ScallopUtils;
  builder: ScallopBuilder;
};

export type ScallopAddressParams = {
  id: string;
};

export type ScallopParams = {
  client: SuiClient;
  walletAddress: string;
  address?: ScallopAddress;
  networkType?: NetworkType;
};

export type ScallopClientParams = ScallopParams;

export type ScallopBuilderParams = ScallopParams & {
  pythEndpoints?: string[];
};

export type ScallopQueryParams = ScallopParams;

export type ScallopUtilsParams = ScallopParams & {
  pythEndpoints?: string[];
};
