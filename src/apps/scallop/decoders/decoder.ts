import { DevInspectResults } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { parseStructTag } from '@mysten/sui/utils';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { MoveCallCommand, TransactionCommand, TransactionCommands, TransactionInputs } from '../types/sui';

export class Decoder {
  protected inputs: TransactionInputs;

  protected commands: TransactionCommands;

  protected movecallsAsSet: Set<string>;

  constructor(
    public readonly transaction: Transaction,
    protected scallopClient: ScallopClient,
    protected devInspectResult: DevInspectResults,
  ) {
    this.scallopClient = scallopClient;
    this.inputs = transaction.getData().inputs;
    this.commands = transaction.getData().commands;
    this.movecallsAsSet = new Set(
      this.commands
        .filter(this.isMoveCall)
        .map((command) => `${command.MoveCall!.package}::${command.MoveCall!.module}::${command.MoveCall!.function}`),
    );
  }

  get address() {
    return this.scallopClient.address;
  }

  get utils() {
    return this.scallopClient.utils;
  }

  protected get coreId() {
    return {
      protocolPkg: this.address.get('core.packages.protocol.id'),
      market: this.address.get('core.market'),
      version: this.address.get('core.version'),
      coinDecimalsRegistry: this.address.get('core.coinDecimalsRegistry'),
      xOracle: this.address.get('core.oracles.xOracle'),
      spoolPkg: this.address.get('spool.id'),
      borrowIncentivePkg: this.address.get('borrowIncentive.id'),
      veScaPkgId: this.address.get('vesca.id'),
      scoin: this.address.get('scoin.id'),
      referral: this.address.get('referral.id'),
    };
  }

  protected matchMoveCallCommand(moveCall: MoveCallCommand, target: string) {
    const { address, module, name } = parseStructTag(target);
    if (!moveCall) {
      return false;
    }
    return moveCall.package === address && moveCall.module === module && moveCall.function === name;
  }

  private isMoveCall(
    command: TransactionCommand,
  ): command is typeof command & NonNullable<{ MoveCall: MoveCallCommand }> {
    return command.$kind === 'MoveCall' && !!command.MoveCall;
  }

  protected filterMoveCallCommands(command: TransactionCommand, target: string) {
    return this.isMoveCall(command) && this.matchMoveCallCommand(command.MoveCall, target);
  }

  protected getMoveCallCommands(targets: string[]): MoveCallCommand[] {
    const targetSet = new Set(targets);
    const targetToIdxMap = targets.reduce(
      (acc, target, idx) => {
        acc[target] = idx;
        return acc;
      },
      {} as Record<string, number>,
    );

    const moveCallCommands: MoveCallCommand[] = [];
    this.commands.forEach((command) => {
      if (this.isMoveCall(command) && command.MoveCall && targetSet.has(command.MoveCall.package)) {
        moveCallCommands[targetToIdxMap[command.MoveCall.package]] = command.MoveCall;
      }
    });

    return moveCallCommands;
  }

  protected hasMoveCallCommand(target: string) {
    return this.movecallsAsSet.has(target);
  }
}
