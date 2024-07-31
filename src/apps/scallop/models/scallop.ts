import { ScallopAddress } from './scallopAddress';
import { ScallopBuilder } from './scallopBuilder';
import { ScallopClient } from './scallopClient';
import { ScallopQuery } from './scallopQuery';
import { ScallopUtils } from './scallopUtils';
import { ADDRESSES_ID } from '../constants';
import type { ScallopParams } from '../types';

/**
 * @argument params - The parameters for the Scallop instance.
 * @argument cacheOptions - The cache options for the QueryClient.
 *
 * @description
 * The main instance that controls interaction with the Scallop contract.
 *
 * @example
 * ```typescript
 * const sdk = new Scallop(<parameters>);
 * const scallopAddress = await sdk.getScallopAddress();
 * const scallopBuilder = await sdk.createScallopBuilder();
 * const scallopClient = await sdk.createScallopClient();
 * const scallopIndexer= await sdk.createScallopIndexer();
 * const scallopUtils= await sdk.createScallopUtils();
 * ```
 */
export class Scallop {
  public params: ScallopParams;

  public client: ScallopClient;

  public builder: ScallopBuilder;

  public query: ScallopQuery;

  public utils: ScallopUtils;

  public address: ScallopAddress;

  public constructor(params: ScallopParams) {
    this.params = params;
    this.address = params.address;
  }

  public async init() {
    if (!this.address) {
      this.address = new ScallopAddress({
        id: ADDRESSES_ID,
      });
    }
    await this.address.read();
    this.client = new ScallopClient(this.params, this.address);

    const { builder, query, utils } = this.client;
    this.builder = builder;
    this.query = query;
    this.utils = utils;
  }
}
