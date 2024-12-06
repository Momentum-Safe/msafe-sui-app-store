import { TransactionType } from '@msafe/sui3-utils';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient as SuiClientLegacy } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { IAppHelperInternalLegacy } from '@/apps/interface/sui-js';
import { SuiNetworks } from '@/types';

export const SuiNetworkUrls: Record<SuiNetworks, string> = {
  'sui:devnet': getFullnodeUrl('devnet'),
  'sui:testnet': getFullnodeUrl('testnet'),
  'sui:localnet': getFullnodeUrl('localnet'),
  'sui:mainnet': getFullnodeUrl('mainnet'),
};

export interface Intention<T> {
  txType: TransactionType;
  txSubType: string;
  intentionData: T;
}

// TestSuite used for @mysten/sui.js packages
export class TestSuiteLegacy<IntentionData> {
  pendingIntention?: Intention<IntentionData>;

  constructor(
    public readonly testWalletAddress: WalletAccount,
    public readonly network: SuiNetworks,
    public readonly appHelper: IAppHelperInternalLegacy<IntentionData>,
  ) {}

  // Mock signAndSubmitTransaction from dApp.
  async signAndSubmitTransaction(input: { txb: TransactionBlock; appContent?: any }): Promise<{ result: string }> {
    this.pendingIntention = await this.appHelper.deserialize({
      transactionBlock: input.txb,
      appContext: input.appContent,
      chain: this.network,
      network: this.network,
      suiClient: new SuiClientLegacy({ url: SuiNetworkUrls[this.network] }),
      account: this.testWalletAddress,
    });
    return {
      result: 'Transaction has been proposed in MSafe application, and pendingIntention is saved in msafe database',
    };
  }

  setIntention(intention: Intention<IntentionData>) {
    this.pendingIntention = intention;
  }

  // Mock the behavior other users vote for the transaction, and submit to blockchain
  async voteAndExecuteIntention(): Promise<{
    txb: TransactionBlock;
    result: string;
  }> {
    if (!this.pendingIntention) {
      throw new Error('No pending intention');
    }
    const txb = await this.appHelper.build({
      ...this.pendingIntention,
      network: this.network,
      suiClient: new SuiClientLegacy({ url: SuiNetworkUrls[this.network] }),
      account: this.testWalletAddress,
    });
    txb.setSender(this.testWalletAddress.address);

    return {
      txb,
      result: 'Transaction has been submitted to blockchain',
    };
  }
}

// TestSuite used for @mysten/sui packages
export class TestSuite<IntentionData> {
  pendingIntention?: Intention<IntentionData>;

  constructor(
    public readonly testWalletAddress: WalletAccount,
    public readonly network: SuiNetworks,
    private readonly appHelper: IAppHelperInternal<IntentionData>,
  ) {}

  // Mock signAndSubmitTransaction from dApp.
  async signAndSubmitTransaction(input: { txb: Transaction; appContent?: any }): Promise<{ result: string }> {
    this.pendingIntention = await this.appHelper.deserialize({
      transaction: input.txb,
      appContext: input.appContent,
      chain: this.network,
      network: this.network,
      suiClient: new SuiClient({ url: SuiNetworkUrls[this.network] }),
      account: this.testWalletAddress,
    });
    return {
      result: 'Transaction has been proposed in MSafe application, and pendingIntention is saved in msafe database',
    };
  }

  setIntention(intention: Intention<IntentionData>) {
    this.pendingIntention = intention;
  }

  // Mock the behavior other users vote for the transaction, and submit to blockchain
  async voteAndExecuteIntention(): Promise<{
    tx: Transaction;
    result: string;
  }> {
    if (!this.pendingIntention) {
      throw new Error('No pending intention');
    }
    const tx = await this.appHelper.build({
      ...this.pendingIntention,
      network: this.network,
      suiClient: new SuiClient({ url: SuiNetworkUrls[this.network] }),
      account: this.testWalletAddress,
    });
    tx.setSender(this.testWalletAddress.address);

    return {
      tx,
      result: 'Transaction has been submitted to blockchain',
    };
  }
}
