import { MPayAppHelper } from '@/apps/mpay/helper';
import { CoreHelper } from '@/apps/msafe-core/helper';
import { MSafeApps } from '@/apps/registry';

export const appHelpers = new MSafeApps([new CoreHelper(), new MPayAppHelper()]);
