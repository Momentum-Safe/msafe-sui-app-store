import { Transaction } from '@mysten/sui.js/dist/cjs/transactions';

import { Scallop } from '../models';

export class Decoder {
  protected scallop: Scallop;

  constructor(
    public readonly txb: Transaction,
    scallop: Scallop,
  ) {
    this.scallop = scallop;
  }

  protected get coreId() {
    return {
      protocolPkg: this.scallop.address.get('core.packages.protocol.id'),
      market: this.scallop.address.get('core.market'),
      version: this.scallop.address.get('core.version'),
      coinDecimalsRegistry: this.scallop.address.get('core.coinDecimalsRegistry'),
      xOracle: this.scallop.address.get('core.oracles.xOracle'),
      spoolPkg: this.scallop.address.get('spool.id'),
      borrowIncentivePkg: this.scallop.address.get('borrowIncentive.id'),
      veScaPkgId: this.scallop.address.get('vesca.id'),
      scoin: this.scallop.address.get('scoin.id'),
      referral: this.scallop.address.get('referral.id'),
    };
  }

  protected get transactions() {
    return this.txb.blockData.transactions;
  }

  protected get inputTransaction() {
    return this.txb.blockData.inputs;
  }

  protected getMoveCallTransaction(target: string) {
    return this.transactions.find((trans) => trans.kind === 'MoveCall' && trans.target === target);
  }
}
