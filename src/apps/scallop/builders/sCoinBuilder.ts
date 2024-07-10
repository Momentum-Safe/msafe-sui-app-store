import { GenerateSCoinNormalMethod, GenerateSCoinQuickMethod, SCoinPkgIds } from '../types';

export const generateSCoinNormalMethod: GenerateSCoinNormalMethod = ({ builder, txBlock }) => {
  const sCoinPkgIds: SCoinPkgIds = {
    pkgId: builder.address.get('scoin.id'),
  };

  return {
    mintSCoin: (marketCoinName, marketCoin) =>
      txBlock.moveCall({
        target: `${sCoinPkgIds.pkgId}::s_coin_converter::mint_s_coin`,
        arguments: [builder.utils.getSCoinTreasury(marketCoinName), marketCoin],
        typeArguments: [
          builder.utils.parseSCoinType(marketCoinName),
          builder.utils.parseUnderlyingSCoinType(marketCoinName),
        ],
      }),
    burnSCoin: (sCoinName, sCoin) =>
      txBlock.moveCall({
        target: `${sCoinPkgIds.pkgId}::s_coin_converter::burn_s_coin`,
        arguments: [builder.utils.getSCoinTreasury(sCoinName), sCoin],
        typeArguments: [builder.utils.parseSCoinType(sCoinName), builder.utils.parseUnderlyingSCoinType(sCoinName)],
      }),
  };
};

export const generateSCoinQuickMethod: GenerateSCoinQuickMethod = ({ builder, txBlock }) => ({
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
