import { Transaction } from '@mysten/sui/transactions';
import { depositCoin, pool } from 'navi-sdk';

import { Decoder } from '@/apps/navi/decoder';

describe('Navi App', () => {
  it('Test deposit deserialize', async () => {
    const tx = new Transaction();
    const amount = '10000000000';
    const [toDeposit] = tx.splitCoins(tx.gas, [amount]);
    await depositCoin(tx as any, pool.Sui, toDeposit, amount);

    const decoder = new Decoder(tx as any);
    const result = decoder.decode();

    console.log('result', result);
  });
});
