export enum WalletType {
  single = 'single',
  msafe = 'msafe',
}

export const GAS_OBJECT_SPEC = 'txn.gas';

/**
 * IWallet is the adapted interface of wallet. Supports both single wallet and msafe.
 */
export interface IWallet {
  type: WalletType;

  address(): Promise<string>;

  requestCoins(reqs: CoinRequest[]): Promise<CoinRequestResponse[]>;
}

/**
 * ISingleWallet is the raw interface of msafe account.
 * Need to adapt to IWallet interface
 */
export interface IMSafeAccount {
  address(): Promise<string>;

  // return coin objects by amount.
  requestCoins(reqs: CoinRequest[]): Promise<CoinRequestResponse[]>;
}

/**
 * ISingleWallet is the raw interface of single signer wallet.
 * Need to adapt to IWallet interface
 */
export interface ISingleWallet {
  address(): Promise<string>;
}

export interface CoinRequest {
  coinType: string;
  amount: bigint;
}

export interface CoinRequestResponse {
  primaryCoin: string;
  mergedCoins?: string[];
}
