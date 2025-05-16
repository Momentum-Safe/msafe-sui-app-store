import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient, ScallopTxBlock } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks, TransactionSubType } from '../../types';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

/**
 * Represents possible actions in the system
 */
type Action = 'stake' | 'unstake' | 'deactivate';

/**
 * Type mapping from Action to its required arguments
 */
type Args<T extends Action> = T extends 'stake'
  ? StakeArgs
  : T extends 'unstake'
    ? UnstakeArgs
    : T extends 'deactivate'
      ? DeactivateArgs
      : never;

/**
 * Arguments required for the 'stake' action
 */
interface StakeArgs {
  veScaKey: string;
  obligationId: string;
  obligationKey: string;
}

/**
 * Arguments required for the 'unstake' action
 */
interface UnstakeArgs {
  obligationId: string;
  obligationKey: string;
}

/**
 * Arguments required for the 'deactivate' action
 */
interface DeactivateArgs {
  veScaKey: string;
  obligationId: string;
}

type BindingDatas =
  | { action: 'deactivate'; args: Args<'deactivate'> }
  | { action: 'stake'; args: Args<'stake'> }
  | { action: 'unstake'; args: Args<'unstake'> };

export interface VeScaObligationBindingsIntentData {
  bindingDatas: BindingDatas[];
}

export class VeScaObligationBindingsIntention extends ScallopCoreBaseIntention<VeScaObligationBindingsIntentData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.VeScaObligationBindings;

  constructor(public readonly data: VeScaObligationBindingsIntentData) {
    super(data);
  }

  private handleAction(tx: ScallopTxBlock, { action, args }: BindingDatas) {
    switch (action) {
      case 'deactivate':
        return tx.deactivateBoost(args.obligationId, args.veScaKey);
      case 'stake':
        return tx.stakeObligationWithVesca(args.obligationId, args.obligationKey, args.veScaKey);
      case 'unstake':
        return tx.unstakeObligation(args.obligationId, args.obligationKey);
      default:
        throw new Error(`Invalid action`);
    }
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    const {
      scallopClient,
      account: { address: sender },
    } = input;

    const tx = scallopClient.builder.createTxBlock();
    tx.setSender(sender);

    const { bindingDatas } = this.data;

    bindingDatas.forEach((data) => this.handleAction(tx, data));

    return tx.txBlock;
  }

  static fromData(data: VeScaObligationBindingsIntentData): VeScaObligationBindingsIntention {
    return new VeScaObligationBindingsIntention(data);
  }
}
