import { TransactionBlock } from '@mysten/sui.js/transactions';
import { normalizeSuiObjectId } from '@mysten/sui.js/utils';
import { TurbosSdk } from 'turbos-clmm-sdk';

import { deepbookConfig } from '../config';
import { SuiKit } from '../utils/sui-kit';

const client_order_id = 89;
const gasBudget = 1_000_000;

interface SwapExactOptions {
  token1: string;
  token2: string;
  poolId: string;
  amountIn: number;
  turbosSdk: TurbosSdk;
  currentAddress: string;
}

export const swap_exact_quote_for_base = async (options: SwapExactOptions) => {
  const { token1, token2, poolId, amountIn, currentAddress, turbosSdk } = options;
  const txb = new TransactionBlock();

  const suiKit = new SuiKit(turbosSdk);
  // get token objectId
  const coinsData = await suiKit.getCoinsData(currentAddress, token2, amountIn);
  const [sendCoin, mergeCoin] = suiKit.splitAndMergeCoin(coinsData, amountIn, txb);
  if (!sendCoin) {
    throw new Error(`Not enough balance: ${token2}`);
  }

  // get accountCap id
  const currentAccountCap = await suiKit.IsAccountCap(currentAddress);
  const accountCap = !currentAccountCap ? suiKit.createAccount(txb) : txb.object(currentAccountCap);

  const [base_coin_ret, quote_coin_ret, _amount] = txb.moveCall({
    typeArguments: [token1, token2],
    target: `${deepbookConfig.PackageId}::clob_v2::swap_exact_quote_for_base`,
    arguments: [
      txb.object(String(poolId)),
      txb.pure(client_order_id),
      accountCap,
      txb.pure(amountIn),
      txb.object(normalizeSuiObjectId('0x6')),
      sendCoin,
    ],
  });

  if (mergeCoin) {
    txb.transferObjects([mergeCoin], txb.pure(currentAddress));
  }

  txb.transferObjects([base_coin_ret!], txb.pure(currentAddress));
  txb.transferObjects([quote_coin_ret!], txb.pure(currentAddress));

  if (!currentAccountCap) {
    txb.transferObjects([accountCap], txb.pure(currentAddress));
  }

  txb.setSenderIfNotSet(currentAddress);
  txb.setGasBudget(gasBudget);

  return txb;
};

export const swap_exact_base_for_quote = async (options: SwapExactOptions) => {
  const { token1, token2, poolId, amountIn, currentAddress, turbosSdk } = options;
  const txb = new TransactionBlock();

  const suiKit = new SuiKit(turbosSdk);
  // get token objectId
  const coinsData = await suiKit.getCoinsData(currentAddress, token1, amountIn);
  const [sendCoin, mergeCoin] = suiKit.splitAndMergeCoin(coinsData, amountIn, txb);

  if (!sendCoin) {
    throw new Error(`Not enough balance: ${token1}`);
  }

  // get accountCap id
  const currentAccountCap = await suiKit.IsAccountCap(currentAddress);
  const accountCap = !currentAccountCap ? suiKit.createAccount(txb) : txb.object(currentAccountCap);

  const zero = suiKit.zero(token2, txb);

  const [base_coin_ret, quote_coin_ret, _amount] = txb.moveCall({
    typeArguments: [token1, token2],
    target: `${deepbookConfig.PackageId}::clob_v2::swap_exact_base_for_quote`,
    arguments: [
      txb.object(String(poolId)),
      txb.pure(client_order_id),
      accountCap,
      txb.pure(amountIn),
      sendCoin,
      zero,
      txb.object(normalizeSuiObjectId('0x6')),
    ],
  });
  if (mergeCoin) {
    txb.transferObjects([mergeCoin], txb.pure(currentAddress));
  }

  txb.transferObjects([base_coin_ret!], txb.pure(currentAddress));
  txb.transferObjects([quote_coin_ret!], txb.pure(currentAddress));

  if (!currentAccountCap) {
    txb.transferObjects([accountCap], txb.pure(currentAddress));
  }

  txb.setSenderIfNotSet(currentAddress);
  txb.setGasBudget(gasBudget);

  return txb;
};
