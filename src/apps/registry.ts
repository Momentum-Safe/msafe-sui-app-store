import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient as SuiClientLegacy } from '@mysten/sui.js/client';

import { toSuiClientNetwork } from '@/lib/suiNetwork';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelper } from '@/apps/interface/common';
import { IAppHelperInternal } from '@/apps/interface/sui';
import { IAppHelperInternalGrpc } from '@/apps/interface/sui-grpc';
import { IAppHelperInternalLegacy } from '@/apps/interface/sui-js';
import { MSafeHTTPTransport } from '@/lib/MSafeHTTPTransport';
import { getSuiGrpcClient } from '@/lib/suiGrpcClient';
import { SuiNetworks } from '@/types';

const SUI_COIN_TYPE = '0x2::sui::SUI';
const MIN_GAS_BALANCE = 100_000_000;

type InternalAppHelper<T> = IAppHelperInternalLegacy<T> | IAppHelperInternal<T> | IAppHelperInternalGrpc<T>;

export class MSafeApps {
  apps: Map<string, IAppHelper<any>>;

  private constructor() {
    this.apps = new Map<string, IAppHelper<any>>();
  }

  static fromHelpers(apps: InternalAppHelper<any>[]) {
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
        case '@mysten/sui-v2':
          mApps.addGrpcHelper(app);
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

  addGrpcHelper(app: IAppHelperInternalGrpc<any>) {
    this.apps.set(app.application, new SuiGrpcSdkAdapter(app));
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
      network: toSuiClientNetwork(input.network),
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
    return this.helper.deserialize({ ...input, suiClient: client, transaction: tx });
  }

  async build(input: {
    intentionData: any;
    txType: TransactionType;
    txSubType: string;
    clientUrl: string;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const client = new SuiClient({
      network: toSuiClientNetwork(input.network),
      transport: new MSafeHTTPTransport({
        url: input.clientUrl,
        rpc: {
          url: input.clientUrl,
        },
      }),
    });
    const accountSuiBalance = await client.getBalance({ owner: input.account.address });
    if (Number(accountSuiBalance.totalBalance) < MIN_GAS_BALANCE) {
      throw new Error('Insufficient gas fee');
    }
    const tx = await this.helper.build({ ...input, suiClient: client });
    tx.setSender(input.account.address);
    const bytes = await tx.build({ client });
    return Transaction.from(bytes);
  }
}

/*
  SuiGrpcSdkAdapter adapts IAppHelperInternalGrpc with @mysten/sui/grpc to IAppHelper
 */
export class SuiGrpcSdkAdapter implements IAppHelper<any> {
  constructor(public helper: IAppHelperInternalGrpc<any>) {}

  async deserialize(
    input: SuiSignTransactionBlockInput & {
      network: SuiNetworks;
      clientUrl: string;
      account: WalletAccount;
    },
  ) {
    const suiGrpcClient = getSuiGrpcClient(input.network, input.clientUrl);
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
    return this.helper.deserialize({ ...input, suiGrpcClient, transaction: tx });
  }

  async build(input: {
    intentionData: any;
    txType: TransactionType;
    txSubType: string;
    clientUrl: string;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const suiGrpcClient = getSuiGrpcClient(input.network, input.clientUrl);
    const { balance } = await suiGrpcClient.core.getBalance({
      owner: input.account.address,
      coinType: SUI_COIN_TYPE,
    });
    if (Number(balance.balance) < MIN_GAS_BALANCE) {
      throw new Error('Insufficient gas fee');
    }
    const tx = await this.helper.build({ ...input, suiGrpcClient });
    tx.setSender(input.account.address);
    const bytes = await tx.build({ client: suiGrpcClient });
    return Transaction.from(bytes);
  }
}

/*
  SuiJsSdkAdapter adapts IAppHelperInternalLegacy with @mysten/sui.js to IAppHelper
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
    return this.helper.deserialize({ ...input, transactionBlock: input.transactionBlock, suiClient: client });
  }

  async build(input: {
    intentionData: any;
    txType: TransactionType;
    txSubType: string;
    clientUrl: string;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const client = new SuiClientLegacy({
      transport: new MSafeHTTPTransport({
        url: input.clientUrl,
        rpc: {
          url: input.clientUrl,
        },
      }),
    });
    const accountSuiBalance = await client.getBalance({ owner: input.account.address });
    if (Number(accountSuiBalance.totalBalance) < MIN_GAS_BALANCE) {
      throw new Error('Insufficient gas fee');
    }
    const txb = await this.helper.build({ ...input, suiClient: client });
    const bytes = await txb.build({ client });
    return Transaction.from(bytes);
  }
}
