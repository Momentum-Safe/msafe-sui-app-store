import type { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { LstClient, SPRING_SUI_UPGRADE_CAP_ID } from '@suilend/springsui-sdk';

const LIQUID_STAKING_INFO = {
  id: '0x0431232199873db77a92aa645cd43521437e9cc5c6fff07fd03edb88afe0b25a',
  type: '0x2b6602099970374cf58a2a1b9d96f005fccceb81e92eb059873baf420eb6c717::x_sui::X_SUI',
  weightHookId: '0x9e35c13dbb0bc437e8ad5a95ec463622f58763e060552ae8d100db77f4904601',
};

/** Fallback if UpgradeCap lookup fails. Matches springsui-sdk PACKAGE_ID. */
const SPRING_SUI_PACKAGE_ID = '0xb0575765166030556a6eafd3b1b970eba8183ff748860680245b9edd41c716e7';

async function resolvePublishedAt(suiGrpcClient: SuiGrpcClient): Promise<string> {
  try {
    const { object } = await suiGrpcClient.getObject({
      objectId: SPRING_SUI_UPGRADE_CAP_ID,
      include: { json: true },
    });
    const publishedAt = (object?.json as { package?: string } | null | undefined)?.package;
    if (publishedAt) {
      return publishedAt;
    }
  } catch (error) {
    console.warn('Failed to resolve SpringSui package id, using SDK default', error);
  }
  return SPRING_SUI_PACKAGE_ID;
}

/**
 * springsui-sdk 1.0.29+: initialize(grpcClient, jsonRpcClient, info, options?)
 * springsui-sdk 1.0.24:  initialize(client, info, publishedAt?)
 *
 * The previous (grpcClient, grpcClient, info) call only matches 1.0.29. On 1.0.24
 * the client is treated as liquidStakingObject, mint() calls tx.object(undefined),
 * and Mysten throws: Cannot read properties of undefined (reading 'Object').
 */
async function createLstClient(suiGrpcClient: SuiGrpcClient) {
  const publishedAt = await resolvePublishedAt(suiGrpcClient);
  const initialize = LstClient.initialize as unknown as (
    ...args: unknown[]
  ) => Promise<InstanceType<typeof LstClient>>;

  if (LstClient.initialize.length >= 4) {
    return initialize(suiGrpcClient, suiGrpcClient, LIQUID_STAKING_INFO, { publishedAt });
  }

  return initialize(suiGrpcClient, LIQUID_STAKING_INFO, publishedAt);
}

const SUI_COIN_TYPE = '0x2::sui::SUI';

async function assertSufficientSpendableBalance(
  suiGrpcClient: SuiGrpcClient,
  owner: string,
  coinType: string,
  amount: bigint,
) {
  const { balance } = await suiGrpcClient.getBalance({ owner, coinType });
  const total = BigInt(balance.balance);
  if (total < amount) {
    throw new Error(
      `Not enough balance: need ${amount}, have total=${total} (coin=${balance.coinBalance}, address=${balance.addressBalance})`,
    );
  }
}

export const getStakeTxPayload = async (suiGrpcClient: SuiGrpcClient, address: string, amount: string) => {
  const stakeAmount = BigInt(amount);
  await assertSufficientSpendableBalance(suiGrpcClient, address, SUI_COIN_TYPE, stakeAmount);

  const lstClient = await createLstClient(suiGrpcClient);
  const tx = new Transaction();
  // Same source as msafe-core Send Coin: address balance first, then owned coins.
  // splitCoins(tx.gas) only sees the gas coin and fails InsufficientCoinBalance
  // when the stake amount lives in address balance (or is larger than the gas coin).
  const sui = tx.coin({
    balance: stakeAmount,
    useGasCoin: true,
  });
  const sSui = lstClient.mint(tx, sui);
  tx.transferObjects([sSui], address);

  return tx;
};

export const getUnstakeTxPayload = async (suiGrpcClient: SuiGrpcClient, address: string, amount: string) => {
  const unstakeAmount = BigInt(amount);
  await assertSufficientSpendableBalance(suiGrpcClient, address, LIQUID_STAKING_INFO.type, unstakeAmount);

  const lstClient = await createLstClient(suiGrpcClient);
  const tx = new Transaction();
  const lst = tx.coin({
    type: LIQUID_STAKING_INFO.type,
    balance: unstakeAmount,
    useGasCoin: false,
  });
  const sui = lstClient.redeem(tx, lst);
  tx.transferObjects([sui], address);

  return tx;
};
