import type { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';

import { ScallopAddress } from './scallopAddress';
import { ScallopQuery } from './scallopQuery';
import { ScallopUtils } from './scallopUtils';
import { ADDRESSES_ID } from '../constants';
import type {
  ScallopInstanceParams,
  ScallopBuilderParams,
  ScallopTxBlock,
  SupportMarketCoins,
  SupportAssetCoins,
  SupportSCoin,
} from '../types';

/**
 * @description
 * It provides methods for operating the transaction block, making it more convenient to organize transaction combinations.
 *
 * @example
 * ```typescript
 * const scallopBuilder = new ScallopBuilder(<parameters>);
 * await scallopBuilder.init();
 * const txBlock = scallopBuilder.<builder functions>();
 * ```
 */
export class ScallopBuilder {
  public readonly params: ScallopBuilderParams;

  public readonly isTestnet: boolean;

  public address: ScallopAddress;

  public query: ScallopQuery;

  public utils: ScallopUtils;

  public client: SuiClient;

  public walletAddress: string;

  public constructor(params: ScallopBuilderParams, instance?: ScallopInstanceParams) {
    this.params = params;
    this.address =
      instance?.address ??
      new ScallopAddress({
        id: params?.addressesId || ADDRESSES_ID,
        network: params?.networkType,
      });
    this.query =
      instance?.query ??
      new ScallopQuery(params, {
        address: this.address,
      });
    this.utils =
      instance?.utils ??
      new ScallopUtils(this.params, {
        address: this.address,
        query: this.query,
      });
    this.client = params.client;
    this.walletAddress = normalizeSuiAddress(params.walletAddress);
    this.isTestnet = params.networkType ? params.networkType === 'testnet' : false;
  }

  /**
   * Request the scallop API to initialize data.
   *
   * @param force - Whether to force initialization.
   * @param address - ScallopAddress instance.
   */
  public async init(force = false, address?: ScallopAddress) {
    if (force || !this.address.getAddresses() || !address?.getAddresses()) {
      this.address.read();
    } else {
      this.address = address;
    }
    this.query.init(force, this.address);
    this.utils.init(force, this.address);
  }

  /**
   * Create a scallop txBlock instance that enhances transaction block.
   *
   * @param txBlock - Scallop txBlock, txBlock created by SuiKit, or original transaction block.
   * @return Scallop txBlock.
   */
  public createTxBlock(txBlock?: ScallopTxBlock | TransactionBlock) {
    return new TransactionBlock(txBlock);
  }

  /**
   * Specifying the sender's amount of coins to get coins args from transaction result.
   *
   * @param txBlock - Scallop txBlock or txBlock created by SuiKit .
   * @param assetCoinName - Specific support asset coin name.
   * @param amount - Amount of coins to be selected.
   * @param sender - Sender address.
   * @return Take coin and left coin.
   */
  public async selectCoin(txBlock: ScallopTxBlock, assetCoinName: SupportAssetCoins, amount: number, sender: string) {
    const coinType = this.utils.parseCoinType(assetCoinName);
    const coins = await this.utils.selectCoinIds(amount, coinType, sender);
    const [takeCoin, leftCoin] = this.utils.takeAmountFromCoins(txBlock, coins, amount);
    return { takeCoin, leftCoin };
  }

  /**
   * Specifying the sender's amount of market coins to get coins args from transaction result.
   *
   * @param txBlock - Scallop txBlock or txBlock created by SuiKit .
   * @param marketCoinName - Specific support market coin name.
   * @param amount - Amount of coins to be selected.
   * @param sender - Sender address.
   * @return Take coin and left coin.
   */
  public async selectMarketCoin(
    txBlock: TransactionBlock,
    marketCoinName: SupportMarketCoins,
    amount: number,
    sender: string,
  ) {
    const marketCoinType = this.utils.parseMarketCoinType(marketCoinName);
    const coins = await this.utils.selectCoinIds(amount, marketCoinType, sender);
    const [takeCoin, leftCoin] = this.utils.takeAmountFromCoins(txBlock, coins, amount);
    return { takeCoin, leftCoin };
  }

  /**
   * Specifying the sender's amount of sCoins to get coins args from transaction result.
   *
   * @param txBlock - Scallop txBlock or txBlock created by SuiKit .
   * @param marketCoinName - Specific support sCoin name.
   * @param amount - Amount of coins to be selected.
   * @param sender - Sender address.
   * @return Take coin and left coin.
   */
  public async selectSCoin(txBlock: TransactionBlock, sCoinName: SupportSCoin, amount: number, sender: string) {
    const sCoinType = this.utils.parseSCoinType(sCoinName);
    const coins = await this.utils.selectCoin(amount, sCoinType, sender);
    const coinIds = coins.map((coin) => coin.objectId);
    const totalAmount = coins.reduce((prev, coin) => prev + Number(coin.balance), 0);
    const [takeCoin, leftCoin] = this.utils.takeAmountFromCoins(txBlock, coinIds, Math.min(totalAmount, amount));
    return {
      takeCoin,
      leftCoin,
      totalAmount,
    };
  }
}
