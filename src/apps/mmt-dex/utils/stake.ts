import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { LstClient } from '@suilend/springsui-sdk';

const LIQUID_STAKING_INFO = {
  id: '0x0431232199873db77a92aa645cd43521437e9cc5c6fff07fd03edb88afe0b25a',
  type: '0x2b6602099970374cf58a2a1b9d96f005fccceb81e92eb059873baf420eb6c717::x_sui::X_SUI',
  weightHookId: '0x9e35c13dbb0bc437e8ad5a95ec463622f58763e060552ae8d100db77f4904601',
};

export const getStakeTxPayload = async (suiClient: SuiClient, address: string, amount: string) => {
  const lstClient = await LstClient.initialize(suiClient, LIQUID_STAKING_INFO);

  const tx = new Transaction();
  const [sui] = tx.splitCoins(tx.gas, [BigInt(amount)]);
  const sSui = lstClient.mint(tx, sui);
  tx.transferObjects([sSui], address);

  return tx;
};

export const getUnstakeTxPayload = async (suiClient: SuiClient, address: string, amount: string) => {
  const lstClient = await LstClient.initialize(suiClient, LIQUID_STAKING_INFO);

  const lstCoins = await suiClient.getCoins({
    owner: address,
    coinType: LIQUID_STAKING_INFO.type,
    limit: 1000,
  });

  if (lstCoins.data.length === 0) {
    throw new Error('No lst coins found');
  }

  const tx = new Transaction();

  const lstCoin = lstCoins.data[0]!;

  if (lstCoins.data.length > 1) {
    tx.mergeCoins(
      lstCoin.coinObjectId,
      lstCoins.data.slice(1).map((c) => c.coinObjectId),
    );
  }

  const [lst] = tx.splitCoins(lstCoin.coinObjectId, [BigInt(amount)]);
  const sui = lstClient.redeem(tx, lst);

  tx.transferObjects([sui], address);

  return tx;
};
