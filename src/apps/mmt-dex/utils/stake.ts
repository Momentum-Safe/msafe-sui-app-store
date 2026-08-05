import type { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { LstClient } from '@suilend/springsui-sdk';

const LIQUID_STAKING_INFO = {
  id: '0x0431232199873db77a92aa645cd43521437e9cc5c6fff07fd03edb88afe0b25a',
  type: '0x2b6602099970374cf58a2a1b9d96f005fccceb81e92eb059873baf420eb6c717::x_sui::X_SUI',
  weightHookId: '0x9e35c13dbb0bc437e8ad5a95ec463622f58763e060552ae8d100db77f4904601',
};

export const getStakeTxPayload = async (suiGrpcClient: SuiGrpcClient, address: string, amount: string) => {
  // pass gRPC client to satisfy current SDK signature.
  const lstClient = await LstClient.initialize(suiGrpcClient, suiGrpcClient as never, LIQUID_STAKING_INFO);

  const tx = new Transaction();
  const [sui] = tx.splitCoins(tx.gas, [BigInt(amount)]);
  const sSui = lstClient.mint(tx, sui);
  tx.transferObjects([sSui], address);

  return tx;
};

export const getUnstakeTxPayload = async (suiGrpcClient: SuiGrpcClient, address: string, amount: string) => {
  const lstClient = await LstClient.initialize(suiGrpcClient, suiGrpcClient as never, LIQUID_STAKING_INFO);

  const lstCoins = await suiGrpcClient.listCoins({
    owner: address,
    coinType: LIQUID_STAKING_INFO.type,
    limit: 1000,
  });

  if (lstCoins.objects.length === 0) {
    throw new Error('No lst coins found');
  }

  const tx = new Transaction();

  const lstCoin = lstCoins.objects[0]!;

  if (lstCoins.objects.length > 1) {
    tx.mergeCoins(
      lstCoin.objectId,
      lstCoins.objects.slice(1).map((c) => c.objectId),
    );
  }

  const [lst] = tx.splitCoins(lstCoin.objectId, [BigInt(amount)]);
  const sui = lstClient.redeem(tx, lst);

  tx.transferObjects([sui], address);

  return tx;
};
