import { MPayAppHelper } from '@/apps/mpay/helper';
import { CoreHelper } from '@/apps/msafe-core/helper';
import { NAVIAppHelper } from '@/apps/navi/helper';
import { MSafeApps } from '@/apps/registry';

import { PlainTransactionHelper } from './apps/plain-transaction/helper';
import { TURBOSAppHelper } from './apps/turbos/helper';

export const appHelpers = new MSafeApps([
  new CoreHelper(),
  new NAVIAppHelper(),
  new TURBOSAppHelper(),
  new MPayAppHelper(),
  new PlainTransactionHelper(),
  // new CetusHelper(),
  new TURBOSAppHelper(),
]);
