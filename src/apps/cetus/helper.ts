import { TransactionType } from '@msafe/sui3-utils';
import { MSafeAppHelper } from '@/apps/interface';
import { SuiClient } from '@mysten/sui.js/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { CetusIntention, CetusIntentionData } from './intention'

export class CetusHelper implements MSafeAppHelper<CetusIntentionData> {
  application = 'cetus'

  deserialize(): Promise<{ txType: TransactionType; txSubType: string; intentionData: CetusIntentionData }> {
    throw new Error('MSafe core transaction intention should be build from API');
  }

  async build(input: {
    intentionData: CetusIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    const intention = CetusIntention.fromData(input.intentionData)
    return intention.build({ suiClient, account });
  }
}