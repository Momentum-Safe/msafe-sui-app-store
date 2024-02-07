import {
  MSafeWalletApi,
  MSafeWalletContext,
  TransactionIntention,
  TransactionIntentions,
} from "@/index";
import {
  CoinTransferIntention,
  ObjectTransferIntention,
  buildCoinTransferTxb,
  buildObjectTransferTxb,
} from "@msafe/sui3-utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiSignTransactionBlockInput } from "@mysten/wallet-standard";

export class MSafeCoreWallet implements MSafeWalletApi {
  async deserialize(
    input: SuiSignTransactionBlockInput
  ): Promise<TransactionIntention<keyof TransactionIntentions>> {
    throw new Error(
      "MSafe core transaction intention should be build from API"
    );
  }
  async build(input: {
    transactionIntention: TransactionIntention<keyof TransactionIntentions>;
    context: MSafeWalletContext;
  }): Promise<TransactionBlock> {
    const { transactionIntention, context } = input;
    switch (transactionIntention.txSubType) {
      case "CoinTransfer":
        return buildCoinTransferTxb(
          context.suiClient,
          transactionIntention.data as CoinTransferIntention,
          context.account.address
        );
      case "ObjectTransfer":
        return buildObjectTransferTxb(
          context.suiClient,
          transactionIntention.data as ObjectTransferIntention,
          context.account.address
        );
      default:
        throw new Error("Unsupported transaction type");
    }
  }
}
