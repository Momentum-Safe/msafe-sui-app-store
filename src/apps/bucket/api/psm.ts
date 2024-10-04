import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';
import { getBucketClient } from './config';

export const getPsmInTxb = async (
    txbParams: any,
    account: WalletAccount,
    network: SuiNetworks,
): Promise<Transaction> => {
    const bucketClient = getBucketClient(network);

    let txb = new Transaction();

    bucketClient.getPsmTx(
        txb,
        txbParams.coinType,
        txbParams.amount,
        false,
        account.address,
    );
    return txb;
};

export const getPsmOutTxb = async (
    txbParams: any,
    account: WalletAccount,
    network: SuiNetworks,
): Promise<Transaction> => {
    const bucketClient = getBucketClient(network);

    let txb = new Transaction();

    bucketClient.getPsmTx(
        txb,
        txbParams.coinType,
        txbParams.amount,
        true,
        account.address,
    );
    return txb;
};