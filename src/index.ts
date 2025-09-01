import { AlphaFiHelper } from '@/apps/alphafi/helper';
import { BucketHelper } from '@/apps/bucket/helper';
import { CetusHelper } from '@/apps/cetus/helper';
import { MPayAppHelper } from '@/apps/mpay/helper';
import { CoreHelper } from '@/apps/msafe-core/helper';
import { NAVIAppHelper } from '@/apps/navi/helper';
import { PlainTransactionHelper } from '@/apps/plain-transaction/helper';
import { MSafeApps } from '@/apps/registry';
import { ScallopAppHelper } from '@/apps/scallop/helper';
import { SpringSuiAppHelper } from '@/apps/springSui/helper';
import { StSuiHelper } from '@/apps/stsui/helper';
import { SuilendAppHelper } from '@/apps/suilend/helper';
import { TURBOSAppHelper } from '@/apps/turbos/helper';
import { VoloAppHelper } from '@/apps/volo/helper';

import { BluefinHelper } from './apps/bluefin/helper';
import { MMTDEXAppHelper } from './apps/mmt-dex/helper';
import { NemoHelper } from './apps/nemo/helper';

export const appHelpers = MSafeApps.fromHelpers([
  new CoreHelper(),
  new NAVIAppHelper(),
  new MPayAppHelper(),
  new PlainTransactionHelper(),
  new CetusHelper(),
  new TURBOSAppHelper(),
  new MMTDEXAppHelper(),
  new ScallopAppHelper(),
  new VoloAppHelper(),
  new BucketHelper(),
  new SuilendAppHelper(),
  new SpringSuiAppHelper(),
  new AlphaFiHelper(),
  new BluefinHelper(),
  new StSuiHelper(),
  new NemoHelper(),
]);
