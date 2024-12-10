import { SuiNetworks } from "@/types";
import { Transaction } from "@mysten/sui/transactions";
import { WalletAccount } from '@mysten/wallet-standard';
import { buildPsmTx } from "bucket-protocol-sdk";
import { getBucketClient } from "./config";

export interface PsmIntentionData {
    coinType: string;
    amount: string;
    buckToCoin: boolean;
}

export const getPsmTx = async (
    txbParams: PsmIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
): Promise<Transaction> => {
    const { coinType, amount, buckToCoin } = txbParams;

    const tx = new Transaction();
    const client = getBucketClient(network, account);
    await buildPsmTx(client, tx, coinType, amount, buckToCoin, account.address);

    return tx;
};
