type SharedObjectRef = {
  objectId: string;
  initialSharedVersion: string;
  mutable: boolean;
};
export const DeepBookPools = {
  id: '0x000000000000000000000000000000000000000000000000000000000000dee9',
  pools: {
    sui2usdc: {
      object: {
        objectId: '0x4405b50d791fd3346754e8171aaab6bc2ed26c2c46efdd033c14b30ae507ac33',
        initialSharedVersion: '32079148',
        mutable: true,
      } as SharedObjectRef,
      lotsize: 100000000,
    },
    usdt2usdc: {
      object: {
        objectId: '0xd1f0a9baacc1864ab19534e2d4c5d6c14f2e071a1f075e8e7f9d51f2c17dc238',
        initialSharedVersion: '32079148',
        mutable: true,
      } as SharedObjectRef,
      lotsize: 100000,
    },
    wusdc2usdc: {
      object: {
        objectId: '0x39f2f7c126189b9b5cda6b770ab34031dde22307d19842e95ab576873c77fa14',
        initialSharedVersion: '82838334',
        mutable: true,
      } as SharedObjectRef,
      lotsize: 100000,
    },
  },
} as const;

export const DeepBookContract = {
  id: '0x000000000000000000000000000000000000000000000000000000000000dee9',
};

export const DeepBookHelperContract = {
  id: '0x2c6c36393db063a9534885d22a47caead720272475336470736be28f119971f3',
};

export const DeepBookModuleAndMethod = {
  clob_v2: {
    swap_exact_quote_for_base: 'clob_v2::swap_exact_quote_for_base' as `${string}::${string}`,
    swap_exact_base_for_quote: 'clob_v2::swap_exact_base_for_quote' as `${string}::${string}`,
    create_account: 'clob_v2::create_account' as `${string}::${string}`,
  },
};
