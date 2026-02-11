import { CoinType, type Pool } from './types';

let updated = false;

const config = {
  ProtocolPackage: '0x1e4a13a0494d5facdbe8473e74127b838c2d446ecec0ce262e2eddafa77259cb',
  StorageId: '0xbb4e2f4b6205c2e2a2db47aeb4f830796ec7c005f88537ee775986639bc442fe',
  Incentive: '0xaaf735bf83ff564e1b219a0d644de894ef5bdc4b2250b126b2a46dd002331821',
  IncentiveV2: '0xf87a8acb8b81d14307894d12595541a73f19933f88e1326d5be349c7a6f7559c', // The new incentive version: V2
  gasBudget: 50_000_000,
  PriceOracle: '0x1568865ed9a0b5ec414220e8f79b3d04c77acc82358f6e5ae4635687392ffbef',
  ReserveParentId: '0xe6d4c6610b86ce7735ea754596d71d72d10c7980b5052fc3c8cdf8d09fea9b4b', // get it from storage object id. storage.reserves
  pool: {
    sui: {
      name: 'SUI',
      assetId: 0,
      poolId: '0x96df0fce3c471489f4debaaa762cf960b3d97820bd1f3f025ff8190730e958c5',
      fondPoolId: '0xf975bc2d4cca10e3ace8887e20afd77b46c383b4465eac694c4688344955dea4',
      type: '0x2::sui::SUI',
      coinType: CoinType.sui,
      reserveObjectId: '0xab644b5fd11aa11e930d1c7bc903ef609a9feaf9ffe1b23532ad8441854fbfaf',
      borrowBalanceParentId: '0xe7ff0daa9d090727210abe6a8b6c0c5cd483f3692a10610386e4dc9c57871ba7',
      supplyBalanceParentId: '0x589c83af4b035a3bc64c40d9011397b539b97ea47edf7be8f33d643606bf96f8',
    },
    wusdc: {
      name: 'wUSDC',
      assetId: 1,
      coinType: CoinType.wusdc,
      poolId: '0xa02a98f9c88db51c6f5efaaf2261c81f34dd56d86073387e0ef1805ca22e39c8',
      type: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
      reserveObjectId: '0xeb3903f7748ace73429bd52a70fff278aac1725d3b58afa781f25ce3450ac203',
      borrowBalanceParentId: '0x8a3aaa817a811131c624658f6e77cba04ab5829293d2c49c1a9cce8ac9c8dec4',
      supplyBalanceParentId: '0x8d0a4467806458052d577c8cd2be6031e972f2b8f5f77fce98aa12cd85330da9',
    },
    usdt: {
      name: 'USDT',
      coinType: CoinType.usdt,
      assetId: 2,
      poolId: '0x0e060c3b5b8de00fb50511b7a45188c8e34b6995c01f69d98ea5a466fe10d103',
      type: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
      reserveObjectId: '0xb8c5eab02a0202f638958cc79a69a2d30055565caad1684b3c8bbca3bddcb322',
      borrowBalanceParentId: '0xc14d8292a7d69ae31164bafab7ca8a5bfda11f998540fe976a674ed0673e448f',
      supplyBalanceParentId: '0x7e2a49ff9d2edd875f82b76a9b21e2a5a098e7130abfd510a203b6ea08ab9257',
    },
    weth: {
      name: 'WETH',
      coinType: CoinType.weth,
      assetId: 3,
      poolId: '0x71b9f6e822c48ce827bceadce82201d6a7559f7b0350ed1daa1dc2ba3ac41b56',
      type: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN',
      reserveObjectId: '0xafecf4b57899d377cc8c9de75854c68925d9f512d0c47150ca52a0d3a442b735',
      borrowBalanceParentId: '0x7568d06a1b6ffc416a36c82791e3daf0e621cf19d4a2724fc6f74842661b6323',
      supplyBalanceParentId: '0xa668905b1ad445a3159b4d29b1181c4a62d864861b463dd9106cc0d97ffe8f7f',
    },
    cetus: {
      name: 'CETUS',
      coinType: CoinType.cetus,
      assetId: 4,
      poolId: '0x3c376f857ec4247b8ee456c1db19e9c74e0154d4876915e54221b5052d5b1e2e',
      type: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
      reserveObjectId: '0x66a807c06212537fe46aa6719a00e4fa1e85a932d0b53ce7c4b1041983645133',
      borrowBalanceParentId: '0x4c3da45ffff6432b4592a39cdb3ce12f4a28034cbcb804bb071facc81fdd923d',
      supplyBalanceParentId: '0x6adc72faf2a9a15a583c9fb04f457c6a5f0b456bc9b4832413a131dfd4faddae',
    },
    voloSui: {
      name: 'VoloSui',
      coinType: CoinType.voloSui,
      assetId: 5,
      poolId: '0x9790c2c272e15b6bf9b341eb531ef16bcc8ed2b20dfda25d060bf47f5dd88d01',
      fondPoolId: '0xe2b5ada45273676e0da8ae10f8fe079a7cec3d0f59187d3d20b1549c275b07ea',
      type: '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT',
      reserveObjectId: '0xd4fd7e094af9819b06ea3136c13a6ae8da184016b78cf19773ac26d2095793e2',
      borrowBalanceParentId: '0x8fa5eccbca2c4ba9aae3b87fd44aa75aa5f5b41ea2d9be4d5321379384974984',
      supplyBalanceParentId: '0xe6457d247b6661b1cac123351998f88f3e724ff6e9ea542127b5dcb3176b3841',
    },
    haSui: {
      name: 'HaedalSui',
      coinType: CoinType.haSui,
      assetId: 6,
      poolId: '0x6fd9cb6ebd76bc80340a9443d72ea0ae282ee20e2fd7544f6ffcd2c070d9557a',
      fondPoolId: '0xa20e18085ce04be8aa722fbe85423f1ad6b1ae3b1be81ffac00a30f1d6d6ab51',
      type: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI',
      reserveObjectId: '0x0c9f7a6ca561dc566bd75744bcc71a6af1dc3caf7bd32c099cd640bb5f3bb0e3',
      borrowBalanceParentId: '0x01f36898e020be6c3423e5c95d9f348868813cd4d0be39b0c8df9d8de4722b00',
      supplyBalanceParentId: '0x278b8e3d09c3548c60c51ed2f8eed281876ea58c392f71b7ff650cc9286d095b',
    },
    navx: {
      name: 'NAVX',
      coinType: CoinType.navx,
      assetId: 7,
      poolId: '0xc0e02e7a245e855dd365422faf76f87d9f5b2148a26d48dda6e8253c3fe9fa60',
      fondPoolId: '0x9dae0cf104a193217904f88a48ce2cf0221e8cd9073878edd05101d6b771fa09',
      type: '0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX',
      reserveObjectId: '0x2e13b2f1f714c0c5fa72264f147ef7632b48ec2501f810c07df3ccb59d6fdc81',
      borrowBalanceParentId: '0xa5bf13075aa400cbdd4690a617c5f008e1fae0511dcd4f7121f09817df6c8d8b',
      supplyBalanceParentId: '0x59dedca8dc44e8df50b190f8b5fe673098c1273ac6168c0a4addf3613afcdee5',
    },
    wbtc: {
      name: 'WBTC',
      coinType: CoinType.wbtc,
      assetId: 8,
      poolId: '0xd162cbe40f8829ce71c9b3d3bf3a83859689a79fa220b23d70dc0300b777ae6e',
      type: '0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN',
      reserveObjectId: '0x8b4d81f004e4e9faf4540951a896b6d96e42598a270e6375f598b99742db767e',
      borrowBalanceParentId: '0x55e1f3c9e6e5cf9fff563bdd61db07a3826458c56ef72c455e049ab3b1b0e99c',
      supplyBalanceParentId: '0x821e505a0091b089edba94deaa14c2f2230d026bbaa7b85680554441aad447e0',
    },
    ausd: {
      name: 'AUSD',
      coinType: CoinType.ausd,
      assetId: 9,
      poolId: '0xc9208c1e75f990b2c814fa3a45f1bf0e85bb78404cfdb2ae6bb97de58bb30932',
      type: '0x2053d08c1e2bd02791056171aab0fd12bd7cd7efad2ab8f6b9c8902f14df2ff2::ausd::AUSD',
      reserveObjectId: '0x918889c6a9d9b93108531d4d59a4ebb9cc4d41689798ffc1d4aed6e1ae816ec0',
      borrowBalanceParentId: '0x551300b9441c9a3a16ca1d7972c1dbb4715e15004ccd5f001b2c2eee22fd92c1',
      supplyBalanceParentId: '0xe151af690355de8be1c0281fbd0d483c099ea51920a57c4bf8c9666fd36808fd',
    },
    nusdc: {
      name: 'USDC',
      assetId: 10,
      coinType: CoinType.nusdc,
      poolId: '0xa3582097b4c57630046c0c49a88bfc6b202a3ec0a9db5597c31765f7563755a8',
      type: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      reserveObjectId: '0x4c8a2c72a22ae8da803a8519798d312c86e74a9e0d6ec0eec2bfcf7e4b3fef5e',
      borrowBalanceParentId: '0xb0b0c7470e96cabbb4f1e8d06bef2fbea65f4dbac52afae8635d9286b1ea9a09',
      supplyBalanceParentId: '0x08b5ce8574ac3bc9327e66ad5decd34d07ee798f724ad01058e8855ac9acb605',
    },
    eth: {
      name: 'ETH',
      assetId: 11,
      coinType: CoinType.eth,
      poolId: '0x78ba01c21d8301be15690d3c30dc9f111871e38cfb0b2dd4b70cc6052fba41bb',
      type: '0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH',
      reserveObjectId: '0x376faea6dfbffab9ea808474cb751d91222b6d664f38c0f1d23de442a8edb1ce',
      borrowBalanceParentId: '0xf0c6ce5cfaee96073876a5fab7426043f3a798b79502c4caeb6d9772cd35af1f',
      supplyBalanceParentId: '0xc0a0cb43620eb8a84d5a4a50a85650e7fa7ba81e660f9cc2863404fd84591d4b',
    },
    usdy: {
      name: 'USDY',
      assetId: 12,
      coinType: CoinType.usdy,
      poolId: '0x4b6253a9f8cf7f5d31e6d04aed4046b9e325a1681d34e0eff11a8441525d4563',
      type: '0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY',
      reserveObjectId: '',
      borrowBalanceParentId: '',
      supplyBalanceParentId: '',
    },
  } as Pool,
  borrowFee: 0.003,
  borrowFeeAddress: '0x70b9b10704263cf53392849e33b1f5fd16005869b4198ed5524836bad1234ea2',
};

export async function updatePackageId() {
  if (updated) {
    return;
  }
  try {
    const data = await fetch('https://open-api.naviprotocol.io/api/msafe').then((res) => res.json());
    const { packageId, borrowFee, borrowFeeAddress, pool } = data;
    if (packageId) {
      config.ProtocolPackage = packageId;
    }
    if (borrowFee) {
      config.borrowFee = borrowFee;
    }
    if (borrowFeeAddress) {
      config.borrowFeeAddress = borrowFeeAddress;
    }
    if (pool) {
      config.pool = pool;
    }
    updated = true;
  } catch (e: any) {
    console.error(e.message);
  }
}

export default config;
