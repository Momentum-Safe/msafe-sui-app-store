import { normalizeStructTag } from '@mysten/sui/utils';

const SEND_POINTS_COINTYPE =
  '0x34fe4f3c9e450fed4d0a3c587ed842eec5313c30c3cc3c0841247c49425e246b::suilend_point::SUILEND_POINT';
export const NORMALIZED_SEND_POINTS_COINTYPE = normalizeStructTag(SEND_POINTS_COINTYPE);

export const isSendPoints = (coinType: string) => normalizeStructTag(coinType) === NORMALIZED_SEND_POINTS_COINTYPE;
