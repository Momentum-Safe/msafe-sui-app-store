import { TransactionType } from "@msafe/sui3-utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  SuiSignTransactionBlockInput,
  WalletAccount,
} from "@mysten/wallet-standard";
import {
  MSafeWalletApi,
  TransactionIntention,
  TransactionIntentions,
} from "..";

export interface CoinTransferIntention {
  recipient: string;
  coinType: string;
  amount: string;
}

export class ExampleWallet implements MSafeWalletApi {
  async deserilize(
    input: SuiSignTransactionBlockInput
  ): Promise<TransactionIntention<keyof TransactionIntentions>> {
    return {
      txType: TransactionType.Assets,
      txSubType: "CoinTransfer",
      data: {
        recipient: input.account.address,
        amount: "10000",
        coinType: "0x2::sui::SUI",
      },
    };
  }
  async build(input: {
    transactionIntention: TransactionIntention<keyof TransactionIntentions>;
    account: WalletAccount;
  }): Promise<TransactionBlock> {
    if (input.transactionIntention.txSubType === "CoinTransfer") {
      const intention = input.transactionIntention
        .data as CoinTransferIntention;
      const block = new TransactionBlock();
      const [coin] = block.splitCoins(block.gas, [
        block.pure(intention.amount),
      ]);
      block.transferObjects([coin], block.pure(intention.recipient));
      block.setSender(input.account.address);
      return block;
    }
    throw new Error("Method not implemented.");
  }
}
