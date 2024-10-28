import { SuiNetworks } from "@/types";
import { Transaction } from "@mysten/sui/transactions";
import { WalletAccount } from '@mysten/wallet-standard';
import { getBucketClient } from "./config";

export interface PsmIntentionData {
    coin: string;
    amount: string;
    isIn: boolean;
}

export const getPsmTx = async (
    txbParams: PsmIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
): Promise<Transaction> => {
    const { coin, amount, isIn } = txbParams;

    const tx = new Transaction();
    const client = getBucketClient(network, account);
    await client.getPsmTx(tx, coin, amount, isIn, account.address);

    return tx;
};
