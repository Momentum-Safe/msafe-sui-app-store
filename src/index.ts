import { CoreHelper } from '@/apps/msafe-core/helper';
import { PlainTransactionHelper } from '@/apps/plain-transaction/helper';
import { MSafeApps } from '@/apps/registry';

export const appHelpers = new MSafeApps([new CoreHelper(), new PlainTransactionHelper()]);
