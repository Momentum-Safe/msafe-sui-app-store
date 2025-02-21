import { pool } from 'navi-sdk';

export function getPoolConfigByAssetId(assetId: string | number) {
  return Object.values(pool).find((item) => String(item.assetId) === String(assetId));
}
