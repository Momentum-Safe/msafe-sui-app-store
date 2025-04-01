import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { fetchRegistryLiquidStakingInfoMap, LiquidStakingObjectInfo } from '@suilend/springsui-sdk/client';

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

  const LIQUID_STAKING_INFO_MAP = await fetchRegistryLiquidStakingInfoMap(suiClient);

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
