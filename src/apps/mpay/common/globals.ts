import { SuiClient } from '@mysten/sui.js/client';

import { EnvConfig, Env, EnvConfigOptions, getConfig } from './env';
import { NoBackendError } from '../error/NoBackendError';
import { WalletNotConnectedError } from '../error/WalletNotConnectedError';
import { Backend } from '../stream/backend';
import { IBackend } from '../types/backend';
import { IWallet, WalletType } from '../types/wallet';

export class Globals {
  public signer: IWallet | undefined;

  public readonly suiClient: SuiClient;

  public readonly envConfig: EnvConfig;

  public _backend?: IBackend;

  constructor(envConfig: EnvConfig) {
    this.envConfig = envConfig;
    this.suiClient = new SuiClient({ url: envConfig.rpc.url });
    if (envConfig.backend) {
      this._backend = new Backend(envConfig.backend.url);
    }
  }

  static new(env: Env, options?: EnvConfigOptions) {
    const ec = getConfig(env, options);
    return new Globals(ec);
  }

  get walletType(): WalletType | 'disconnected' {
    if (!this.wallet) {
      return 'disconnected';
    }
    return this.wallet.type;
  }

  get backend(): IBackend {
    if (!this._backend) {
      throw new NoBackendError();
    }
    return this._backend;
  }

  // Used for test cases
  set backend(b: IBackend) {
    this._backend = b;
  }

  connectWallet(wallet: IWallet) {
    this.signer = wallet;
  }

  disconnect() {
    this.signer = undefined;
  }

  get wallet(): IWallet {
    if (!this.signer) {
      throw new WalletNotConnectedError();
    }
    return this.signer;
  }

  async walletAddress() {
    return this.wallet.address();
  }
}
