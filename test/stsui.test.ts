import { LST, LstParams } from '@alphafi/stsui-sdk';
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
      const lstParams: LstParams = {
        lstInfo: '0x1adb343ab351458e151bc392fbf1558b3332467f23bda45ae67cd355a57fd5f5',
        lstCointype: '0xd1b72982e40348d069bb1ff701e634c117bb5f741f44dff91e472d3b01461e55::stsui::STSUI',
      };
      const lst = new LST(lstParams);
      const unresolvedTx = await lst.mint(
        '10000000',
        '0xe136f0b6faf27ee707725f38f2aeefc51c6c31cc508222bee5cbc4f5fcf222c3',
      );

      const resolvedTx = Transaction.from(await unresolvedTx.build({ client }));
      const data = await helper.deserialize({ transaction: resolvedTx, suiClient: client } as any);

      expect(JSON.stringify(data)).toBe(`{"txType":"Other","txSubType":"mint","intentionData":{"amount":"10000000"}}`);
    });
  });

  describe('Deserialization', () => {
    const helper = new StSuiHelper();
    const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io/' });

    it('Deserialize withdraw BLUEFIN-SUI-USDC transaction', async () => {
      const lstParams: LstParams = {
        lstInfo: '0x1adb343ab351458e151bc392fbf1558b3332467f23bda45ae67cd355a57fd5f5',
        lstCointype: '0xd1b72982e40348d069bb1ff701e634c117bb5f741f44dff91e472d3b01461e55::stsui::STSUI',
      };
      const lst = new LST(lstParams);
      const unresolvedTx = await lst.redeem(
        '10000000',
        '0xe136f0b6faf27ee707725f38f2aeefc51c6c31cc508222bee5cbc4f5fcf222c3',
      );

      const resolvedTx = Transaction.from(await unresolvedTx.build({ client }));
      const data = await helper.deserialize({ transaction: resolvedTx, suiClient: client } as any);

      expect(JSON.stringify(data)).toBe(
        `{"txType":"Other","txSubType":"redeem","intentionData":{"amount":"10000000"}}`,
      );
    });
  });
});
