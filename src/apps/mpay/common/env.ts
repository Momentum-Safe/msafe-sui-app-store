import { getFullnodeUrl } from '@mysten/sui.js/client';

import * as devContractConfig from '../config/dev.json';
import * as prodContractConfig from '../config/prod.json';

export enum Env {
  dev = 'dev',
  stg = 'stg',
  prev = 'prev',
  prod = 'prod',
}

export interface EnvConfig {
  env: Env;
  rpc: SuiConfig;
  backend: BackendConfig;
  contract: ContractConfig;
}

export interface EnvConfigOptions {
  rpc?: SuiConfig;
  backend?: BackendConfig;
  contract?: ContractConfig;
}

export interface BackendConfig {
  url: string;
}

export interface SuiConfig {
  url: string;
}

export interface ContractConfig {
  contractId: string;
  roleObjId: string;
  vaultObjId: string;
  feeObjId: string;
}

export const DEV_RPC_ENDPOINT = getFullnodeUrl('testnet');
export const STG_RPC_ENDPOINT = getFullnodeUrl('testnet');
export const PREV_RPC_ENDPOINT = getFullnodeUrl('mainnet');
export const PROD_RPC_ENDPOINT = getFullnodeUrl('mainnet');

export const DEV_BE_API = 'https://bc3p6l5unl.execute-api.us-west-1.amazonaws.com/prod';
export const STG_BE_API = 'https://rolsbkota7.execute-api.us-west-1.amazonaws.com/prod';
export const PREV_BE_API = 'https://6p6mkx33ne.execute-api.us-west-1.amazonaws.com/prod';
export const PROD_BE_API = 'https://xrae3mrjv5.execute-api.us-west-1.amazonaws.com/prod';

export const CONTRACT_DEV: ContractConfig = devContractConfig;
export const CONTRACT_PROD: ContractConfig = prodContractConfig;

const ENV_CONFIG: Map<Env, EnvConfig> = new Map([
  [
    Env.dev,
    {
      env: Env.dev,
      rpc: {
        url: DEV_RPC_ENDPOINT,
      },
      backend: {
        url: DEV_BE_API,
      },
      contract: CONTRACT_DEV,
    },
  ],
  [
    Env.stg,
    {
      env: Env.stg,
      rpc: {
        url: STG_RPC_ENDPOINT,
      },
      backend: {
        url: STG_BE_API,
      },
      contract: CONTRACT_DEV,
    },
  ],
  [
    Env.prev,
    {
      env: Env.prev,
      rpc: {
        url: PREV_RPC_ENDPOINT,
      },
      backend: {
        url: PREV_BE_API,
      },
      contract: CONTRACT_PROD,
    },
  ],
  [
    Env.prod,
    {
      env: Env.prod,
      rpc: {
        url: PROD_RPC_ENDPOINT,
      },
      backend: {
        url: PROD_BE_API,
      },
      contract: CONTRACT_PROD,
    },
  ],
]);

export function getConfig(env: Env, options?: EnvConfigOptions): EnvConfig {
  const ec = ENV_CONFIG.get(env);
  if (!ec) {
    throw new Error(`Env not supported: ${env}`);
  }
  if (options && options.rpc) {
    ec.rpc = options.rpc;
  }
  if (options && options.backend) {
    ec.backend = options.backend;
  }
  if (options && options.contract) {
    ec.contract = options.contract;
  }
  return ec;
}
