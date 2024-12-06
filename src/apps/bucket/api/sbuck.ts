import { SuiNetworks } from "@/types";
import { Transaction } from "@mysten/sui/transactions";
import { WalletAccount } from '@mysten/wallet-standard';
import { buildSBUCKClaimTx, buildSBUCKDepositTx, buildSBUCKUnstakeTx, buildSBUCKWithdrawTx, UserLpProof } from "bucket-protocol-sdk";
import { getBucketClient } from "./config";

export interface SBUCKDepositIntentionData {
    coinType: string;
    amount: string;
    isStaked: boolean;
}

export interface SBUCKUnstakeIntentionData {
    stakeProofs: string[];
    amount: string;
    isStaked: boolean;
    toBuck: boolean;
}

export interface SBUCKWithdrawIntentionData {
    amount: string;
}

export interface SBUCKClaimIntentionData {
    stakeProofs: string[];
}


export const getSBUCKDepositTx = async (
    txbParams: SBUCKDepositIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
): Promise<Transaction> => {
    const { coinType, amount, isStaked } = txbParams;

    const tx = new Transaction();
    const client = getBucketClient(network, account);
    await buildSBUCKDepositTx(client, tx, coinType, amount, account.address, isStaked);

    return tx;
};

export const getSBUCKUnstakeTx = async (
    txbParams: SBUCKUnstakeIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
): Promise<Transaction> => {
    const { stakeProofs, amount, isStaked, toBuck } = txbParams;

    const tx = new Transaction();
    const client = getBucketClient(network, account);
    await buildSBUCKUnstakeTx(client, tx, stakeProofs, amount, account.address, isStaked, toBuck);

    return tx;
};

export const getSBUCKWithdrawTx = async (
    txbParams: SBUCKWithdrawIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
): Promise<Transaction> => {
    const { amount } = txbParams;

    const tx = new Transaction();
    const client = getBucketClient(network, account);
    await buildSBUCKWithdrawTx(client, tx, amount, account.address);

    return tx;
};

export const getSBUCKClaimTx = async (
    txbParams: SBUCKClaimIntentionData,
    account: WalletAccount,
    network: SuiNetworks,
): Promise<Transaction> => {
    const { stakeProofs } = txbParams;

    const tx = new Transaction();
    const client = getBucketClient(network, account);
    await buildSBUCKClaimTx(client, tx, stakeProofs, account.address);

    return tx;
};
