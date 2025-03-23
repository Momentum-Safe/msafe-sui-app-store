export type SupportCoinDecimals = Record<string, number>;

export type CoinWrappedType =
  | {
      from: string;
      type: string;
    }
  | undefined;
