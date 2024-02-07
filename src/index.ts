import {
  CoinTransferIntention,
  ObjectTransferIntention,
  TransactionType,
} from "@msafe/sui3-utils";
import { SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  SuiSignTransactionBlockInput,
  WalletAccount,
} from "@mysten/wallet-standard";
import { MSafeCoreWallet } from "./app/msafe";

export interface MSafeWalletApi {
  /**
   * Deserialize transaction block data to human readable data structure.
   * @param input transaction block input
   */
  deserialize(
    input: SuiSignTransactionBlockInput
  ): Promise<TransactionIntention<keyof TransactionIntentions>>;

  build(input: {
    transactionIntention: TransactionIntention<keyof TransactionIntentions>;
    context: MSafeWalletContext;
  }): Promise<TransactionBlock>;
}

export interface MSafeWalletContext {
  suiClient: SuiClient;
  account: WalletAccount;
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
  ObjectTransfer: ObjectTransferIntention;
}

export class MSafeApps {
  public msafeCore = new MSafeCoreWallet();
}
