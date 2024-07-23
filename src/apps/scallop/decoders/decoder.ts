import { TransactionBlock } from '@mysten/sui.js/dist/cjs/transactions';

import { ScallopBuilder } from '../models';

export class Decoder {
  protected _builder: ScallopBuilder;

  constructor(
    public readonly txb: TransactionBlock,
    builder: ScallopBuilder,
  ) {
    this._builder = builder;
  }

  protected get coreId() {
    return {
      protocolPkg: this._builder.address.get('core.packages.protocol.id'),
      market: this._builder.address.get('core.market'),
      version: this._builder.address.get('core.version'),
      coinDecimalsRegistry: this._builder.address.get('core.coinDecimalsRegistry'),
      xOracle: this._builder.address.get('core.oracles.xOracle'),
      spoolPkg: this._builder.address.get('spool.id'),
      borrowIncentivePkg: this._builder.address.get('borrowIncentive.id'),
      veScaPkgId: this._builder.address.get('vesca.id'),
      scoin: this._builder.address.get('scoin.id'),
      referral: this._builder.address.get('referral.id'),
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
