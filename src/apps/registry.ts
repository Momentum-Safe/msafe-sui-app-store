import { TransactionType } from '@msafe/sui3-utils';
import { Transaction, isTransaction } from '@mysten/sui/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { AppName, AppRegistry } from '@/apps/app-registry';
import { IAppHelper } from '@/apps/interface/common';
import { IAppHelperInternal } from '@/apps/interface/sui';
import { IAppHelperInternalGrpc } from '@/apps/interface/sui-grpc';
import { SuiClient, toSuiNetworkName } from '@/compat/mysten-sui-json-rpc';
import { getSuiGrpcClient } from '@/lib/suiGrpcClient';
import { SuiNetworks } from '@/types';

function createSuiClient(network: SuiNetworks, clientUrl: string) {
  return new SuiClient({
    network: toSuiNetworkName(network),
    baseUrl: clientUrl,
  });
}

const SUI_COIN_TYPE = '0x2::sui::SUI';
const MIN_GAS_BALANCE = 100_000_000;

async function toDeserializeTransaction(transactionBlock: unknown): Promise<Transaction> {
  if (isTransaction(transactionBlock)) {
    return transactionBlock as Transaction;
  }

  if (typeof transactionBlock === 'string' || transactionBlock instanceof Uint8Array) {
    return Transaction.from(transactionBlock);
  }

  // Legacy TransactionBlock: offline kind-only build (no JSON-RPC client).
  if (
    transactionBlock &&
    typeof transactionBlock === 'object' &&
    'build' in transactionBlock &&
    typeof (transactionBlock as { build: unknown }).build === 'function'
  ) {
    const build = await (
      transactionBlock as { build: (options: { onlyTransactionKind: boolean }) => Promise<Uint8Array> }
    ).build({
      onlyTransactionKind: true,
    });
    return Transaction.from(build);
  }

  throw new Error('Unsupported transaction payload for deserialize');
}

type InternalAppHelper<T> = IAppHelperInternal<T> | IAppHelperInternalGrpc<T>;

type RegisteredAppHelper = IAppHelper<AppRegistry[AppName]>;

export class MSafeApps {
  apps: Map<AppName, RegisteredAppHelper>;

  private constructor() {
    this.apps = new Map<AppName, RegisteredAppHelper>();
  }

  static fromHelpers(apps: InternalAppHelper<any>[]) {
    const mApps = new MSafeApps();
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      switch (app.supportSDK) {
        case '@mysten/sui':
          mApps.addHelper(app);
          break;
        case '@mysten/sui-v2':
          mApps.addGrpcHelper(app);
          break;
        default: {
          const unsupported = app as InternalAppHelper<unknown> & { supportSDK?: string };
          throw new Error(`${unsupported.application}: ${unsupported.supportSDK} SDK not supported`);
        }
      }
    }
    return mApps;
  }

  addHelper(app: IAppHelperInternal<any>) {
    this.setApp(app.application, new SuiSdkAdapter(app));
  }

  addGrpcHelper(app: IAppHelperInternalGrpc<any>) {
    this.setApp(app.application, new SuiGrpcSdkAdapter(app));
  }

  getAppHelper<K extends AppName>(appName: K): IAppHelper<AppRegistry[K]>;
  getAppHelper(appName: string): IAppHelper<unknown>;
  getAppHelper(appName: string): IAppHelper<unknown> {
    const app = this.apps.get(appName as AppName);
    if (!app) {
      throw new Error(`${appName} not registered`);
    }
    return app;
  }

  private setApp(appName: string, helper: RegisteredAppHelper) {
    this.apps.set(appName as AppName, helper);
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
    const client = createSuiClient(input.network, input.clientUrl);
    const tx = await toDeserializeTransaction(input.transactionBlock);
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
    const client = createSuiClient(input.network, input.clientUrl);
    const { balance } = await client.getBalance({
      owner: input.account.address,
      coinType: SUI_COIN_TYPE,
    });
    // Prefer total spendable (coin objects + address balance).
    if (Number(balance.balance) < MIN_GAS_BALANCE) {
      throw new Error('Insufficient gas fee');
    }
    const tx = await this.helper.build({ ...input, suiClient: client });
    tx.setSender(input.account.address);
    // Do not tx.build() here. Early build triggers Mysten/node doGasSelection and can
    // bake gasData.budget="0" + payment=[] for Address Balance txs. Callers (sui3-sdk
    // simulate/propose) run prepareGasFunding + build later with the correct gas policy.
    return tx;
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
    const tx = await toDeserializeTransaction(input.transactionBlock);
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
    // Prefer total spendable (coin objects + address balance).
    if (Number(balance.balance) < MIN_GAS_BALANCE) {
      throw new Error('Insufficient gas fee');
    }
    const tx = await this.helper.build({ ...input, suiGrpcClient });
    tx.setSender(input.account.address);
    // Do not tx.build() here. Early build triggers Mysten/node doGasSelection and can
    // bake gasData.budget="0" + payment=[] for Address Balance txs. Callers (sui3-sdk
    // simulate/propose) run prepareGasFunding + build later with the correct gas policy.
    return tx;
  }
}
