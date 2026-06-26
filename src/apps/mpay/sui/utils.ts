import { normalizeStructTag } from '@mysten/sui/utils';

export function isSameCoinType(type1: string, type2: string) {
  return normalizeStructTag(type1) === normalizeStructTag(type2);
}

export function isSameTarget(target1: string, target2: string): boolean {
  return normalizeStructTag(target1) === normalizeStructTag(target2);
}

export function getMoveCallTarget(command: {
  $kind: string;
  MoveCall?: { package: string; module: string; function: string };
}): string | null {
  if (command.$kind !== 'MoveCall' || !command.MoveCall) {
    return null;
  }
  const { package: pkg, module, function: fn } = command.MoveCall;
  return `${pkg}::${module}::${fn}`;
}
