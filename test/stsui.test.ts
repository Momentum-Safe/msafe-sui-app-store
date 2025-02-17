import { mint, redeem } from '@alphafi/stsui-sdk';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

import { StSuiHelper } from '@/apps/stsui/helper';
import { MintIntention } from '@/apps/stsui/intentions/mint';
import { RedeemIntention } from '@/apps/stsui/intentions/redeem';

describe('StSui App', () => {
  it('Test StSui Mint intention serialization', () => {
    const intention = MintIntention.fromData({
      amount: '10000000',
    });

    expect(intention.serialize()).toBe('{"amount":"10000000"}');
  });

  it('Test StSui Redeem intention serialization', () => {
    const intention = RedeemIntention.fromData({
      amount: '10000000',
    });

    expect(intention.serialize()).toBe('{"amount":"10000000"}');
  });

  describe('Deserialization', () => {
    const helper = new StSuiHelper();
    const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io/' });

    it('Deserialize withdraw BLUEFIN-SUI-USDC transaction', async () => {
      const unresolvedTx = await mint('10000000', {
        address: '0xe136f0b6faf27ee707725f38f2aeefc51c6c31cc508222bee5cbc4f5fcf222c3',
      });

      const resolvedTx = Transaction.from(await unresolvedTx.build({ client }));
      const data = await helper.deserialize({ transaction: resolvedTx, suiClient: client } as any);

      expect(JSON.stringify(data)).toBe(`{"txType":"Other","txSubType":"mint","intentionData":{"amount":"10000000"}}`);
    });
  });

  describe('Deserialization', () => {
    const helper = new StSuiHelper();
    const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io/' });

    it('Deserialize withdraw BLUEFIN-SUI-USDC transaction', async () => {
      const unresolvedTx = await redeem('10000000', {
        address: '0xe136f0b6faf27ee707725f38f2aeefc51c6c31cc508222bee5cbc4f5fcf222c3',
      });

      const resolvedTx = Transaction.from(await unresolvedTx.build({ client }));
      const data = await helper.deserialize({ transaction: resolvedTx, suiClient: client } as any);

      expect(JSON.stringify(data)).toBe(
        `{"txType":"Other","txSubType":"redeem","intentionData":{"amount":"10000000"}}`,
      );
    });
  });
});
