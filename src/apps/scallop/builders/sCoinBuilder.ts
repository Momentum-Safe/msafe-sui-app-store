import { TransactionArgument } from '@mysten/sui.js/transactions';

import { GenerateSCoinNormalMethod, GenerateSCoinQuickMethod, SCoinPkgIds, sCoinTreasuryIds } from '../types';
import { SUPPORT_SCOIN } from '../constants';

export const generateSCoinNormalMethod: GenerateSCoinNormalMethod = async ({ builder, txBlock }) => {
  const sCoinPkgIds: SCoinPkgIds = {
    pkgId: await builder.address.get('scoin.id'),
  };

  const sCoinTreasuryIds: sCoinTreasuryIds = {};
  await Promise.all(
    SUPPORT_SCOIN.map(async (sCoinName) => {
      const treasuryId = await builder.utils.getSCoinTreasury(sCoinName);
      sCoinTreasuryIds[sCoinName] = treasuryId;
    }),
  );

  return {
    mintSCoin: (marketCoinName, marketCoin) =>
      txBlock.moveCall({
        target: `${sCoinPkgIds.pkgId}::s_coin_converter::mint_s_coin`,
        arguments: [
          txBlock.object(sCoinTreasuryIds[marketCoinName]),
          typeof marketCoin !== 'string' ? (marketCoin as TransactionArgument) : txBlock.pure(marketCoin),
        ],
        typeArguments: [
          builder.utils.parseSCoinType(marketCoinName),
          builder.utils.parseUnderlyingSCoinType(marketCoinName),
        ],
      }),
    burnSCoin: (sCoinName, sCoin) =>
      txBlock.moveCall({
        target: `${sCoinPkgIds.pkgId}::s_coin_converter::burn_s_coin`,
        arguments: [
          txBlock.object(sCoinTreasuryIds[sCoinName]),
          typeof sCoin !== 'string' ? (sCoin as TransactionArgument) : txBlock.pure(sCoin),
        ],
        typeArguments: [builder.utils.parseSCoinType(sCoinName), builder.utils.parseUnderlyingSCoinType(sCoinName)],
      }),
  };
};

export const generateSCoinQuickMethod: GenerateSCoinQuickMethod = async ({ builder, txBlock }) => ({
  mintSCoinQuick: async (marketCoinName, amount, walletAddress) => {
    const { leftCoin, takeCoin } = await builder.selectMarketCoin(txBlock, marketCoinName, amount, walletAddress);

    txBlock.transferObjects([leftCoin], walletAddress);
    return txBlock.mintSCoin(marketCoinName, takeCoin);
  },
  burnSCoinQuick: async (sCoinName, amount, walletAddress) => {
    const { leftCoin, takeCoin } = await builder.selectSCoin(txBlock, sCoinName, amount, walletAddress);

    txBlock.transferObjects([leftCoin], walletAddress);
    return txBlock.burnSCoin(sCoinName, takeCoin);
  },
});
