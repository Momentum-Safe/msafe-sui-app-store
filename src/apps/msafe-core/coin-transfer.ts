import {CoreBaseIntention} from "@/apps/msafe-core/intention";
import {TransactionIntention} from "@/apps/interface";
import {CoinTransferPayload, TransactionType} from "@msafe/sui3-utils";
import {TransactionBlock} from "@mysten/sui.js/transactions"
import {WalletAccount} from "@mysten/wallet-standard";

export interface CoinTransferIntentionData {
	recipient: string;
	coinType: string;
	amount: bigint;
}

export class CoinTransferIntention extends CoreBaseIntention<CoinTransferIntentionData> {
	txType: TransactionType.Assets;
	txSubType: "coin-transfer";

	constructor(public readonly data: CoinTransferIntentionData) {
		super(data);
	}

	async build(input: {suiClient: SuiClient, account: WalletAccount}): Promise<TransactionBlock> {
		return new TransactionBlock();
  }

	static fromData(data: CoinTransferIntentionData) {
		return new CoinTransferIntention(data);
	}
}