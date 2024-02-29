import { MSafeAppHelper } from '@/apps/interface';

export class MSafeApps {
  apps: Map<string, MSafeAppHelper<any>>;

  constructor(apps: MSafeAppHelper<any>[]) {
    this.apps = new Map(apps.map((app) => [app.application, app]));
  }

  getAppHelper(appName: string): MSafeAppHelper<any> {
    const app = this.apps.get(appName);
    if (!app) {
      throw new Error(`${appName} not registered`);
    }
    return app;
  }
}
