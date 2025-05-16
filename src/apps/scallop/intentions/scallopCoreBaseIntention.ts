import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient, ScallopTxBlock } from '@scallop-io/sui-scallop-sdk';
import sortKeys from 'sort-keys-recursive';

import { BaseIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { SuiObjectArg } from '../types';

export abstract class ScallopCoreBaseIntention<D> implements BaseIntention<D> {
  abstract txType: TransactionType;

  abstract txSubType: string;

  protected constructor(public readonly data: D) {}

  get application() {
    return 'msafe-core';
  }

  serialize() {
    return JSON.stringify(sortKeys(this.data));
  }

  private isObligationLocked = async (suiClient: SuiClient, obligationId: SuiObjectArg) => {
    const obligationObjectData = await suiClient.getObject({
      id: typeof obligationId === 'string' ? obligationId : obligationId.objectId,
      options: {
        showContent: true,
      },
    });
    let obligationLocked = false;
    if (
      obligationObjectData &&
      obligationObjectData?.data.content?.dataType === 'moveObject' &&
      'lock_key' in obligationObjectData.data.content.fields
    ) {
      obligationLocked = Boolean(obligationObjectData.data.content.fields.lock_key);
    }

    return obligationLocked;
  };

  protected async buildTxWithRefreshObligation(
    client: ScallopClient,
    input: {
      walletAddress: string;
      obligationId: string;
      obligationKey: string;
      veScaKey?: string;
    },
    callback: (
      client: ScallopClient,
      txBlock: ScallopTxBlock,
      args: {
        walletAddress: string;
        obligationId: string;
        obligationKey: string;
        veScaKey?: string;
      },
    ) => Promise<void>,
  ) {
    const txb = client.builder.createTxBlock();
    txb.setSender(input.walletAddress);

    const { obligationId, obligationKey } = input;

    // unstake obligation if it is locked
    const locked = await this.isObligationLocked(client.scallopSuiKit.client, obligationId);
    if (locked) {
      await txb.unstakeObligationQuick(obligationId, obligationKey);
      await callback(client, txb, input);
      await txb.stakeObligationWithVeScaQuick(obligationId, obligationKey, input.veScaKey);
    } else {
      await callback(client, txb, input);
    }

    return txb;
  }

  abstract build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction>;
}
