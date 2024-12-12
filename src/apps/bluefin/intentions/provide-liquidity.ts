// import { TransactionType } from '@msafe/sui3-utils';
// import { SuiClient } from '@mysten/sui.js/client';
// import { TransactionBlock } from '@mysten/sui.js/transactions';
// import { WalletAccount } from '@mysten/wallet-standard';

// import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

// import TxBuilder from '../tx-builder';
// import { SuiNetworks, TransactionSubType, BluefinIntentionData } from '../types';

// export class ProvideLiquidity extends BaseIntentionLegacy<BluefinIntentionData> {
//   txType = TransactionType.Other;

//   txSubType = TransactionSubType.ProvideLiquidity;

//   constructor(public readonly data: BluefinIntentionData) {
//     super(data);
//   }

//   async build(input: {
//     network: SuiNetworks;
//     suiClient: SuiClient;
//     account: WalletAccount;
//   }): Promise<TransactionBlock> {
//     const { account, network } = input;
//     const { txbParams } = this.data;
//     return TxBuilder.provideLiquidity(txbParams, account, network);
//   }

//   static fromData(data: BluefinIntentionData) {
//     return new ProvideLiquidity(data);
//   }
// }
