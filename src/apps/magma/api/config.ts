import { AggregatorClient, Env } from '@magmaprotocol/aggregator-sdk';
import { MagmaClmmSDK, SdkOptions, clmmMainnet } from '@magmaprotocol/magma-clmm-sdk';
import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';

export const getClmmSdk = (account: WalletAccount) => {
  const config: SdkOptions = clmmMainnet;
  const clmmSdk = new MagmaClmmSDK(config);
  clmmSdk.senderAddress = account.address;
  return clmmSdk;
};

const aggregatorURL = 'https://app.magmafinance.io/api/router/find_routes';
export const getAggregatorSdk = (account: WalletAccount) => {
  const suiClient = new SuiClient({
    url: 'https://fullnode.mainnet.sui.io/',
  });
  const aggregatorSdk = new AggregatorClient(aggregatorURL, account.address, suiClient, Env.Mainnet);
  return aggregatorSdk;
};
