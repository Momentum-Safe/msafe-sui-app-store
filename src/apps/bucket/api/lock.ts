import { SuiNetworks } from "@/types";
import { Transaction } from "@mysten/sui/transactions";
import { WalletAccount } from '@mysten/wallet-standard';
import { buildLockedClaimTx } from "bucket-protocol-sdk";
import { getBucketClient } from "./config";

export interface LockClaimIntentionData {
    coinType: string;
    lockedCount: number;
}

export const getLockClaimTx = async (
    txbParams: LockClaimIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
): Promise<Transaction> => {
    const { coinType, lockedCount } = txbParams;

    const tx = new Transaction();
    const client = getBucketClient(network, account);
    await buildLockedClaimTx(client, tx, coinType, lockedCount, account.address);

    return tx;
};
