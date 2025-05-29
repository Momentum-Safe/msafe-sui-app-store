import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { LiquidStakingInfo } from '@suilend/springsui-sdk/_generated/liquid_staking/liquid-staking/structs';
import { WeightHook } from '@suilend/springsui-sdk/_generated/liquid_staking/weight/structs';
import { LiquidStakingObjectInfo } from '@suilend/springsui-sdk/client';
import { API_URL } from '@suilend/sui-fe';

import { SpringSuiIntentionData } from '@/apps/springSui/types/intention';
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

  const lstInfoRes = await fetch(`${API_URL}/springsui/lst-info`);
  const lstInfoJson: Record<
    string,
    {
      LIQUID_STAKING_INFO: LiquidStakingObjectInfo;
      liquidStakingInfo: LiquidStakingInfo<string>;
      weightHook: WeightHook<string>;
      apy: string;
    }
  > = await lstInfoRes.json();
  if ((lstInfoRes as any)?.statusCode === 500) {
    throw new Error('Failed to fetch SpringSui LST data');
  }

  const lstInfoMap = lstInfoJson;

  const LIQUID_STAKING_INFO_MAP = Object.fromEntries(
    Object.values(lstInfoMap).map((info) => [info.LIQUID_STAKING_INFO.type, info.LIQUID_STAKING_INFO]),
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
