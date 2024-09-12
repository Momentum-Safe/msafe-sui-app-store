import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient as SuiClientLegacy } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelper, IAppHelperInternalLegacy, IAppHelperInternal } from '@/apps/interface';
import { SuiNetworks } from '@/types';

export class MSafeApps {
  apps: Map<string, IAppHelper<any>>;

  constructor(apps: (IAppHelperInternalLegacy<any> | IAppHelperInternal<any>)[]) {
    this.apps = new Map(
      apps.map((app) => {
        switch (app.supportSDK) {
          case '@mysten/sui.js':
            return [app.application, new SuiJsSdkAdapter(app).helper as any];
          case '@mysten/sui':
            return [app.application, new SuiSdkAdapter(app).helper as any];
          default:
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            throw new Error(`${app.application}: ${app.supportSDK} SDK not supported`);
        }
      }),
    );
  }

  getAppHelper(appName: string): IAppHelper<any> {
    const app = this.apps.get(appName);
    if (!app) {
      throw new Error(`${appName} not registered`);
    }
    return app;
  }
}

export class SuiSdkAdapter implements IAppHelper<any> {
  constructor(public helper: IAppHelperInternal<any>) {}

  application: string;

  async deserialize(
    input: SuiSignTransactionBlockInput & {
      network: SuiNetworks;
      clientUrl: string;
      account: WalletAccount;
    },
  ) {
    const client = new SuiClient({ url: input.clientUrl });
    const build = await input.transactionBlock.build();
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
  }): Promise<TransactionBlock> {
    const client = new SuiClient({ url: input.clientUrl });
    const tx = await this.helper.build({ ...input, suiClient: client });
    const bytes = await tx.build();
    return TransactionBlock.from(bytes);
  }
}

export class SuiJsSdkAdapter implements IAppHelper<any> {
  constructor(public helper: IAppHelperInternalLegacy<any>) {}

  application: string;

  async deserialize(
    input: SuiSignTransactionBlockInput & {
      network: SuiNetworks;
      clientUrl: string;
      account: WalletAccount;
    },
  ) {
    const client = new SuiClientLegacy({ url: input.clientUrl });
    return this.helper.deserialize({ ...input, transactionBlock: input.transactionBlock, suiClient: client });
  }

  async build(input: {
    intentionData: any;
    txType: TransactionType;
    txSubType: string;
    clientUrl: string;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const client = new SuiClientLegacy({ url: input.clientUrl });
    const tx = await this.helper.build({ ...input, suiClient: client });
    const bytes = await tx.build();
    return TransactionBlock.from(bytes);
  }
}
