import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { MSafeAppHelper } from '@/apps/interface';
import { SuiNetworks } from '@/types';

export class MSafeApps {
  apps: Map<string, MSafeAppHelper<any>>;

  constructor(apps: MSafeAppHelper<any>[]) {
    this.apps = new Map(apps.map((app) => [app.application, app]));
  }

  getAppHelper(appName: string): MSafeAppHelper<any> {
    const app = this.apps.get(appName);
    if (!app) {
      throw new Error(`${appName} not registered`);
    }
    return app;
  }

  deserialize(appName: string, input: SuiSignTransactionBlockInput) {
    return this.getAppHelper(appName).deserialize(input);
  }

  build(
    appName: string,
    input: {
      network: SuiNetworks;
      intentionData: any;
      txType: TransactionType;
      txSubType: string;
      suiClient: SuiClient;
      account: WalletAccount;
    },
  ) {
    return this.getAppHelper(appName).build(input);
  }
}
