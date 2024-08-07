import type { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

import { ScallopAddress } from './scallopAddress';
import { ScallopQuery } from './scallopQuery';
import { ScallopUtils } from './scallopUtils';
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

  public constructor(params: ScallopBuilderParams, instance: Omit<ScallopInstanceParams, 'builder'>) {
    this.params = params;
    this.client = params.client;

    const { address, query, utils } = instance;
    this.address = address;
    this.query = query;
    this.utils = utils;
    this.isTestnet = params.networkType ? params.networkType === 'testnet' : false;
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
  public async selectCoin(
    txBlock: ScallopTxBlock,
    assetCoinName: SupportAssetCoins,
    amount: number,
    sender: string = this.params.walletAddress,
  ) {
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
    sender: string = this.params.walletAddress,
  ) {
    const marketCoinType = this.utils.parseMarketCoinType(marketCoinName);
    const coins = await this.utils.selectCoins(amount, marketCoinType, sender);
    const totalAmount = coins.reduce((prev, coin) => {
      // eslint-disable-next-line no-param-reassign
      prev += Number(coin.balance);
      return prev;
    }, 0);
    const coinIds = coins.map((value) => value.objectId);
    const [takeCoin, leftCoin] = this.utils.takeAmountFromCoins(txBlock, coinIds, Math.min(amount, totalAmount));
    return { takeCoin, leftCoin, totalAmount };
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
  public async selectSCoin(
    txBlock: TransactionBlock,
    sCoinName: SupportSCoin,
    amount: number,
    sender: string = this.params.walletAddress,
  ) {
    const sCoinType = this.utils.parseSCoinType(sCoinName);
    const coins = await this.utils.selectCoins(amount, sCoinType, sender);
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
