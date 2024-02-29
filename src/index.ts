import { MPayAppHelper } from '@/apps/mpay/helper';
import { CoreHelper } from '@/apps/msafe-core/helper';
import { MSafeApps } from '@/apps/registry';

import { PlainTransactionHelper } from './apps/plain-transaction/helper';

export const appHelpers = new MSafeApps([new CoreHelper(), new MPayAppHelper(), new PlainTransactionHelper()]);
