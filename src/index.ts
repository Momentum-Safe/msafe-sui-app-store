import { TransactionType } from "@msafe/sui3-utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  SuiSignTransactionBlockInput,
  WalletAccount,
} from "@mysten/wallet-standard";
import { CoinTransferIntention, ExampleWallet } from "./app/example";

export interface MSafeWalletApi {
  /**
   * Deserilize transaction block data to human readable data struccture.
   * @param input transaction block input
   */
  deserilize(
    input: SuiSignTransactionBlockInput
  ): Promise<TransactionIntention<keyof TransactionIntentions>>;

  build(input: {
    transactionIntention: TransactionIntention<keyof TransactionIntentions>;
    account: WalletAccount;
  }): Promise<TransactionBlock>;
}

export interface TransactionIntention<T extends keyof TransactionIntentions> {
  txType: TransactionType;
  txSubType: T;
  data: TransactionIntentions[T];
}

/**
 * Support transaction intention data structure.
 * App need to add your transaction intention types here
 */
export interface TransactionIntentions {
  CoinTransfer: CoinTransferIntention;
}

export class MSafeApps {
  public example = new ExampleWallet();
}
