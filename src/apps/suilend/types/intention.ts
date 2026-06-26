import { WalletAccount } from '@mysten/wallet-standard';
import { ObligationOwnerCap } from '@suilend/sdk/_generated/suilend/lending-market/structs';
import { Obligation } from '@suilend/sdk/_generated/suilend/obligation/structs';
import { SuilendClient } from '@suilend/sdk/index';

import { SuiClient } from '@/compat/mysten-sui-json-rpc';
import { SuiNetworks } from '@/types';

export type IntentionInput = {
  network: SuiNetworks;
  suiClient: SuiClient;
  account: WalletAccount;

  suilendClient: SuilendClient;
  obligationOwnerCap: ObligationOwnerCap<string> | undefined;
  obligation: Obligation<string> | undefined;
};
