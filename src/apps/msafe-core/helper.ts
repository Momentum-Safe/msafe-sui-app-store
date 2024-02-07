import {CoinTransferIntention, CoinTransferIntentionData} from "@/apps/msafe-core/coin-transfer";
import {SuiSignTransactionBlockInput, WalletAccount} from "@mysten/wallet-standard";
import {MSafeAppHelper} from "@/apps/interface";
import {TransactionType} from "@msafe/sui3-utils";
import {MSafeWalletContext} from "@/index";
import {SuiClient} from "@mysten/sui.js/client"
import {TransactionBlock} from "@mysten/sui.js/transactions"


export type CoreIntention = CoinTransferIntention;

export type CoreIntentionData = CoinTransferIntentionData;


export class CoreHelper implements MSafeAppHelper<CoreIntention, CoreIntentionData> {
	application: 'msafe-core';

	deserialize(input: SuiSignTransactionBlockInput): CoreIntention {
		throw new Error('not implemented')
	}

	async build(input: {
		intentionData: CoreIntentionData,
		txType: TransactionType,
		txSubType: string,
		suiClient: SuiClient,
		account: WalletAccount,
	}): Promise<TransactionBlock> {
		let intention: CoreIntention;
		switch (input.txSubType) {
		case 'coin-transfer':
			intention = CoinTransferIntention.fromData(input.intentionData);
		default:
			throw new Error('not implemented')
		}
		return intention.build({suiClient, account})
	}
}