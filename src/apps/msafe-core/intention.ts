import {TransactionIntention} from "@/apps/interface";
import {TransactionType} from "@msafe/sui3-utils";
import {TransactionBlock} from "@mysten/sui.js/transactions"

export abstract class CoreBaseIntention<D> implements TransactionIntention<D>{
	abstract txType: TransactionType;
	abstract txSubType: string;

	protected constructor(public readonly data: D) {
	}

	get application() {
		return 'msafe-core'
	}

	serialize() {
		return JSON.stringify(this.data);
	}

	abstract build(input: {suiClient: SuiClient, account: WalletAccount}): Promise<TransactionBlock>;
}
