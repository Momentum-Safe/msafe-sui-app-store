import type { AlphaFiIntentionData } from '@/apps/alphafi/types';
import type { BluefinIntentionData } from '@/apps/bluefin/types';
import type { BucketIntentionData } from '@/apps/bucket/types/helper';
import type { CetusIntentionData } from '@/apps/cetus/types';
import type { EmberIntentionData } from '@/apps/ember/types';
import type { MMTDEXIntentionData } from '@/apps/mmt-dex/types';
import type { MPayIntentionData } from '@/apps/mpay/helper';
import type { CoreIntentionData } from '@/apps/msafe-core/helper';
import type { NAVIIntentionData } from '@/apps/navi/helper';
import type { PlainTransactionData } from '@/apps/plain-transaction/helper';
import type { ScallopIntentionData } from '@/apps/scallop/helper';
import type { SpringSuiIntentionData } from '@/apps/springSui/types/intention';
import type { StSuiIntentionData } from '@/apps/stsui/types';
import type { SuilendIntentionData } from '@/apps/suilend/types/helper';
import type { TURBOSIntentionData } from '@/apps/turbos/types';
import type { VoloIntentionData } from '@/apps/volo/helper';

/**
 * Maps each registered application name to its intention data type.
 * Add new apps here when registering helpers in `src/index.ts`.
 */
export interface AppRegistry {
  alphafi: AlphaFiIntentionData;
  bluefin: BluefinIntentionData;
  bucket: BucketIntentionData;
  cetus: CetusIntentionData;
  ember: EmberIntentionData;
  'mmt-dex': MMTDEXIntentionData;
  mpay: MPayIntentionData;
  'msafe-core': CoreIntentionData;
  'msafe-plain-tx': PlainTransactionData;
  navi: NAVIIntentionData;
  scallop: ScallopIntentionData;
  SpringSui: SpringSuiIntentionData;
  stsui: StSuiIntentionData;
  Suilend: SuilendIntentionData;
  turbos: TURBOSIntentionData;
  volo: VoloIntentionData;
}

export type AppName = keyof AppRegistry;

export type AppIntentionData<K extends AppName> = AppRegistry[K];
