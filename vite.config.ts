import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    noDiscovery: true,
    include: [],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    minify: true,
    sourcemap: true,
    rollupOptions: {
      external: [
        // ... 你的外部依赖列表 ...
        '@alphafi/alphafi-sdk',
        '@cetusprotocol/aggregator-sdk',
        '@cetusprotocol/cetus-periphery-sdk',
        '@cetusprotocol/cetus-sui-clmm-sdk',
        '@cetusprotocol/vaults-sdk',
        '@firefly-exchange/library-sui',
        '@pythnetwork/pyth-sui-js',
        '@suilend/frontend-sui',
        '@suilend/sdk',
        '@suilend/springsui-sdk',
        'axios',
        'bignumber.js',
        'bucket-protocol-sdk',
        'buffer',
      ],
    },
  },
  plugins: [
    dts({ rollupTypes: true }),
    nodePolyfills({
      globals: {
        process: true,
        Buffer: true,
      },
    }),
  ],
});
