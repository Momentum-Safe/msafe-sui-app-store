import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

const VestingConfing = {
  package_id: '0x355714a1eeb7ab1d80902da6c92001170cda1212edf524c32aa308a3ac177c31',
  published_at: '0x355714a1eeb7ab1d80902da6c92001170cda1212edf524c32aa308a3ac177c31',
  cetus_coin_type: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
};

export const getVestingRedeemTxb = async (
  txbParams: any,
  account: WalletAccount,
  network: SuiNetworks,
): Promise<Transaction> => {
  console.log('getVestingRedeemTxb txbParams: ', txbParams);
  console.log('getVestingRedeemTxb account: ', account);
  console.log('getVestingRedeemTxb network: ', network);
  const { pool, nftId, periods, CLOCK_ADDRESS } = txbParams;
  const txb = new Transaction();

  periods.forEach((period: any) => {
    txb.moveCall({
      target: `${VestingConfing.published_at}::router::redeem`,
      typeArguments: [VestingConfing.cetus_coin_type],
      arguments: [txb.object(pool), txb.object(nftId), txb.pure(period), txb.object(CLOCK_ADDRESS)],
    });
  });

  return txb;
};
