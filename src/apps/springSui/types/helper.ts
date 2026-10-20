import { TransactionType } from '@msafe/sui3-utils';
import { WalletAccount } from '@mysten/wallet-standard';
import { LiquidStakingObjectInfo } from '@suilend/springsui-sdk/client';
import { API_URL } from '@suilend/sui-fe';

import { SpringSuiIntentionData } from '@/apps/springSui/types/intention';
import { SuiClient } from '@/compat/mysten-sui-json-rpc';
import { SuiNetworks } from '@/types';

import { getUtils as getSuilendUtils, Utils as SuilendUtils } from '../../suilend/helper';

export enum TransactionSubType {
  STAKE = 'stake',
  STAKE_AND_DEPOSIT = 'stakeAndDeposit',
  CONVERT = 'convert',
  CONVERT_AND_DEPOSIT = 'convertAndDeposit',
  UNSTAKE = 'unstake',
}

export type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: SpringSuiIntentionData;
};

export type Utils = {
  LIQUID_STAKING_INFO_MAP: Record<string, LiquidStakingObjectInfo>;
} & SuilendUtils;

export const getUtils = async (suiClient: SuiClient, account: WalletAccount): Promise<Utils> => {
  const suilendUtils = await getSuilendUtils(suiClient, account);

  const lstInfoRes = await fetch(`${API_URL}/springsui/lst-info`, {
    signal: AbortSignal.timeout(30_000),
  });
  // Fetch Response uses status, not Node's statusCode, so a 500 used to be parsed as LST data.
  if (!lstInfoRes.ok) {
    throw new Error(`Failed to fetch SpringSui LST data: ${lstInfoRes.status}`);
  }

  const lstInfoJson: unknown = await lstInfoRes.json();
  if (!lstInfoJson || typeof lstInfoJson !== 'object') {
    throw new Error('SpringSui LST data is missing');
  }

  const LIQUID_STAKING_INFO_MAP = Object.fromEntries(
    Object.values(lstInfoJson as Record<string, unknown>).map((info) => {
      const stakingInfo = (info as { LIQUID_STAKING_INFO?: LiquidStakingObjectInfo } | null)?.LIQUID_STAKING_INFO;
      if (!stakingInfo?.type) {
        throw new Error('SpringSui LST info is missing LIQUID_STAKING_INFO');
      }
      return [stakingInfo.type, stakingInfo];
    }),
  );

  return { ...suilendUtils, LIQUID_STAKING_INFO_MAP };
};

export type IntentionInput = {
  network: SuiNetworks;
  suiClient: SuiClient;
  account: WalletAccount;

  suilendClient: Utils['suilendClient'];
  LIQUID_STAKING_INFO_MAP: Utils['LIQUID_STAKING_INFO_MAP'];
  obligationOwnerCap: Utils['obligationOwnerCaps'][0] | undefined;
  obligation: Utils['obligations'][0] | undefined;
};
