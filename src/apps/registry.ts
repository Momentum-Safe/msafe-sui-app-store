import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { toHex } from '@mysten/sui/utils';
import { SuiClient as SuiClientLegacy } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelper } from '@/apps/interface/common';
import { IAppHelperInternal } from '@/apps/interface/sui';
import { IAppHelperInternalLegacy } from '@/apps/interface/sui-js';
import { MSafeHTTPTransport } from '@/lib/MSafeHTTPTransport';
import { SuiNetworks } from '@/types';

import { PlainTransactionType } from './plain-transaction/helper';

export class MSafeApps {
  apps: Map<string, IAppHelper<any>>;

  private constructor() {
    this.apps = new Map<string, IAppHelper<any>>();
  }

  static fromHelpers(apps: (IAppHelperInternalLegacy<any> | IAppHelperInternal<any>)[]) {
    const mApps = new MSafeApps();
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      switch (app.supportSDK) {
        case '@mysten/sui.js':
          mApps.addLegacyHelper(app);
          break;
        case '@mysten/sui':
          mApps.addHelper(app);
          break;
        default:
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          throw new Error(`${app.application}: ${app.supportSDK} SDK not supported`);
      }
    }
    return mApps;
  }

  addLegacyHelper(app: IAppHelperInternalLegacy<any>) {
    this.apps.set(app.application, new SuiJsSdkAdapter(app));
  }

  addHelper(app: IAppHelperInternal<any>) {
    this.apps.set(app.application, new SuiSdkAdapter(app));
  }

  getAppHelper(appName: string): IAppHelper<any> {
    const app = this.apps.get(appName);
    if (!app) {
      throw new Error(`${appName} not registered`);
    }
    return app;
  }
}

/*
  SuiSdkAdapter adapts IAppHelperInternal with @mysten/sui to IAppHelper
  TODO: build to @mysten/sui Transaction after update sdk and api
 */
export class SuiSdkAdapter implements IAppHelper<any> {
  constructor(public helper: IAppHelperInternal<any>) {}

  async deserialize(
    input: SuiSignTransactionBlockInput & {
      network: SuiNetworks;
      clientUrl: string;
      account: WalletAccount;
    },
  ) {
    const client = new SuiClient({
      transport: new MSafeHTTPTransport({
        url: input.clientUrl,
        rpc: {
          url: input.clientUrl,
        },
      }),
    });
    const clientLegacy = new SuiClientLegacy({
      transport: new MSafeHTTPTransport({
        url: input.clientUrl,
        rpc: {
          url: input.clientUrl,
        },
      }),
    });
    const build = await input.transactionBlock.build({ client: clientLegacy });
    const tx = Transaction.from(build);
    try {
      return await this.helper.deserialize({ ...input, suiClient: client, transaction: tx });
    } catch {
      // Fallback to plain transaction
      const intention = {
        txType: TransactionType.Other,
        txSubType: PlainTransactionType,
        intentionData: { content: toHex(build) },
      };
      console.log('🚀 ~ SuiSdkAdapter ~ Fallback:', intention);
      return intention;
    }
  }

  async build(input: {
    intentionData: any;
    txType: TransactionType;
    txSubType: string;
    clientUrl: string;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const client = new SuiClient({
      transport: new MSafeHTTPTransport({
        url: input.clientUrl,
        rpc: {
          url: input.clientUrl,
        },
      }),
    });
    // fetch account sui balance, check if sui balance is greater or equal to 0.1 SUI
    const accountSuiBalance = await client.getBalance({ owner: input.account.address });
    if (Number(accountSuiBalance.totalBalance) < 100000000) {
      throw new Error('Insufficient gas fee');
    }
    const tx = await this.helper.build({ ...input, suiClient: client });
    tx.setSender(input.account.address);
    const bytes = await tx.build({ client });
    return TransactionBlock.from(bytes);
  }
}

/*
  SuiJsSdkAdapter adapts IAppHelperInternalLegacy with @mysten/sui.js to IAppHelper
  TODO: build to @mysten/sui Transaction after update sdk and api
 */
export class SuiJsSdkAdapter implements IAppHelper<any> {
  constructor(public helper: IAppHelperInternalLegacy<any>) {}

  async deserialize(
    input: SuiSignTransactionBlockInput & {
      network: SuiNetworks;
      clientUrl: string;
      account: WalletAccount;
    },
  ) {
    const client = new SuiClientLegacy({
      transport: new MSafeHTTPTransport({
        url: input.clientUrl,
        rpc: {
          url: input.clientUrl,
        },
      }),
    });

    const build = await input.transactionBlock.build({ client });

    try {
      return await this.helper.deserialize({ ...input, transactionBlock: input.transactionBlock, suiClient: client });
    } catch {
      // Fallback to plain transaction
      const intention = {
        txType: TransactionType.Other,
        txSubType: PlainTransactionType,
        intentionData: { content: toHex(build) },
      };
      console.log('🚀 ~ SuiSdkAdapter ~ Fallback:', intention);
      return intention;
    }
  }

  async build(input: {
    intentionData: any;
    txType: TransactionType;
    txSubType: string;
    clientUrl: string;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const client = new SuiClientLegacy({
      transport: new MSafeHTTPTransport({
        url: input.clientUrl,
        rpc: {
          url: input.clientUrl,
        },
      }),
    });
    // fetch account sui balance, check if sui balance is greater or equal to 0.1 SUI
    const accountSuiBalance = await client.getBalance({ owner: input.account.address });
    if (Number(accountSuiBalance.totalBalance) < 100000000) {
      throw new Error('Insufficient gas fee');
    }
    return this.helper.build({ ...input, suiClient: client });
  }
}
