import { getPool } from '@naviprotocol/lending';

export async function getPoolConfigByAssetId(assetId: string | number) {
  return getPool(assetId);
}
