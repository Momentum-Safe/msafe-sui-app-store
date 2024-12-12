/* eslint-disable prettier/prettier */
import { HexToUint8Array, TransactionType } from '@msafe/sui3-utils';
import { SUI_MAINNET_CHAIN, WalletAccount } from '@mysten/wallet-standard';

import { BluefinHelper } from '@/apps/bluefin/helper';
// import { ClosePosition } from '@/apps/bluefin/intentions/close-position';
// import { CollectFee } from '@/apps/bluefin/intentions/collect-fee';
// import { CollectFeeAndRewards } from '@/apps/bluefin/intentions/collect-fee-and-rewards';
// import { CollectRewards } from '@/apps/bluefin/intentions/collect-rewards';
import { OpenAndAddLiquidity } from '@/apps/bluefin/intentions/open-position-with-liquidity';
// import { ProvideLiquidity } from '@/apps/bluefin/intentions/provide-liquidity';
// import { RemoveLiquidity } from '@/apps/bluefin/intentions/remove-liquidity';
import { BluefinIntentionData, TransactionSubType } from '@/apps/bluefin/types';

import { TestSuiteLegacy } from './testSuite';

describe('Bluefin App', () => {
  it('Test `OpenAndAddLiquidity` intention serialization', () => {
    const intention = OpenAndAddLiquidity.fromData({
      txbParams: {
        pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
        lowerTick: 1,
        upperTick: 2,
        tokenAmount: 0.5e6,
        isCoinA: true,
        maxAmountTokenA: 0.5e6,
        maxAmountTokenB: 0.5e6,
        },
      action: TransactionSubType.OpenAndAddLiquidity,
    });
    expect(intention.serialize()).toBe(
      '{"action":"OpenAndAddLiquidity","txbParams":{"isCoinA":true,"lowerTick":1,"maxAmountTokenA":500000,"maxAmountTokenB":500000,"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","tokenAmount":500000,"upperTick":2}}',
    );
  });


  // it('Test `ProvideLiquidity` intention serialization', () => {
  //   const intention = ProvideLiquidity.fromData({
  //     txbParams: {
  //       pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
  //       position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
  //       lowerTick: 1,
  //       upperTick: 2,
  //       tokenAmount: 0.5,
  //       isCoinA: true,
  //       slippage: 0.025,
  //     },
  //     action: TransactionSubType.ProvideLiquidity,
  //   });
  //   expect(intention.serialize()).toBe(
  //     '{"action":"ProvideLiquidity","txbParams":{"isCoinA":true,"lowerTick":1,"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46","slippage":0.025,"tokenAmount":0.5,"upperTick":2}}',
  //   );
  // });

  // it('Test `RemoveLiquidity` intention serialization', () => {
  //   const intention = RemoveLiquidity.fromData({
  //     txbParams: {
  //       pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
  //       position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
  //       lowerTick: 1,
  //       upperTick: 2,
  //       tokenAmount: 0.5,
  //       isCoinA: true,
  //       slippage: 0.025,
  //     },
  //     action: TransactionSubType.RemoveLiquidity,
  //   });
  //   expect(intention.serialize()).toBe(
  //     '{"action":"RemoveLiquidity","txbParams":{"isCoinA":true,"lowerTick":1,"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46","slippage":0.025,"tokenAmount":0.5,"upperTick":2}}',
  //   );
  // });

  // it('Test `ClosePosition` intention serialization', () => {
  //   const intention = ClosePosition.fromData({
  //     txbParams: {
  //       pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
  //       position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
  //     },
  //     action: TransactionSubType.ClosePosition,
  //   });
  //   expect(intention.serialize()).toBe(
  //     '{"action":"ClosePosition","txbParams":{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}}',
  //   );
  // });

  // it('Test `CollectFee` intention serialization', () => {
  //   const intention = CollectFee.fromData({
  //     txbParams: {
  //       pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
  //       position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
  //     },
  //     action: TransactionSubType.CollectFee,
  //   });
  //   expect(intention.serialize()).toBe(
  //     '{"action":"CollectFee","txbParams":{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}}',
  //   );
  // });

  // it('Test `CollectRewards` intention serialization', () => {
  //   const intention = CollectRewards.fromData({
  //     txbParams: {
  //       pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
  //       position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
  //     },
  //     action: TransactionSubType.CollectRewards,
  //   });
  //   expect(intention.serialize()).toBe(
  //     '{"action":"CollectRewards","txbParams":{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}}',
  //   );
  // });

  // it('Test `CollectFeeAndRewards` intention serialization', () => {
  //   const intention = CollectFeeAndRewards.fromData({
  //     txbParams: {
  //       pool: '0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140',
  //       position: '0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46',
  //     },
  //     action: TransactionSubType.CollectFeeAndRewards,
  //   });
  //   expect(intention.serialize()).toBe(
  //     '{"action":"CollectFeeAndRewards","txbParams":{"pool":"0x0c89fd0320b406311c05f1ed8c4656b4ab7ed14999a992cc6c878c2fad405140","position":"0x56b4ab7ed14999a992cc6c878c2fad4051400c89fd0320b406311c05f1ed8c46"}}',
  //   );
  // });

  describe('Deserialization', ()=>{

    const testWallet: WalletAccount = {
      address: '0x37a8d55f29e5b4bdba0cb3fe0ba51a93db8c868fe0de649e1bf36bb42ea7d959',
      publicKey: HexToUint8Array('03490bfb7d9075281e00a98614abf162c76bc89be51c25d6cacd3005c2420ff209'),
      chains: [SUI_MAINNET_CHAIN],
      features: [],
    };

    const helper = new BluefinHelper();


    it("Deserialize OpenPositionAndProvideLiquidity transaction", async()=> {
      
      const transaction = {
        blockData: {
          "version": 1,
        "sender": "0x4c0a9ef46ff24d003debdf5953234b19109264ae511746e56b7a279e3d2cfbc9",
        "expiration": {
            "None": true
        },
        "gasConfig": {
            "owner": "0x4c0a9ef46ff24d003debdf5953234b19109264ae511746e56b7a279e3d2cfbc9",
            "budget": "8123552",
            "price": "750",
            "payment": [
                {
                    "objectId": "0x69c4a4e110d10a90c818f03badefd1aff89f0a738f29a83d7a81571f55db3bbf",
                    "version": "441334191",
                    "digest": "Hj6zKRjHo7oUf173ovuahqU3WwtgkpBbEVpygxn9cGi9"
                },
                {
                    "objectId": "0x29aa62f6c576dcba843636d43b4ffeb7a134dc9644870d0402d793365a201d8f",
                    "version": "441334190",
                    "digest": "EE3Mam6pWKRm8HQEpAQJiKam3DGLrTQ4suvpM1ehsVFU"
                }
            ]
        },
        "inputs": [
            {
                "kind": "Input",
                "index": 0,
                "value": {
                    "Object": {
                        "Shared": {
                            "mutable": false,
                            "initialSharedVersion": "406496849",
                            "objectId": "0x03db251ba509a8d5d8777b6338836082335d93eecbdd09a11e190a1cff51c352"
                        }
                    }
                },
                "type": "object"
            },
            {
                "kind": "Input",
                "index": 1,
                "value": {
                    "Object": {
                        "Shared": {
                            "mutable": true,
                            "initialSharedVersion": "406731547",
                            "objectId": "0x3b585786b13af1d8ea067ab37101b6513a05d2f90cfe60e8b1d9e1b46a63c4fa"
                        }
                    }
                },
                "type": "object"
            },
            {
                "kind": "Input",
                "index": 2,
                "value": {
                    "Pure": [
                        48,
                        38,
                        255,
                        255
                    ]
                },
                "type": "pure"
            },
            {
                "kind": "Input",
                "index": 3,
                "value": {
                    "Pure": [
                        232,
                        39,
                        255,
                        255
                    ]
                },
                "type": "pure"
            },
            {
                "kind": "Input",
                "index": 4,
                "value": {
                    "Pure": [
                        0,
                        225,
                        245,
                        5,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                "type": "pure"
            },
            {
                "kind": "Input",
                "index": 5,
                "value": {
                    "Object": {
                        "Shared": {
                            "mutable": false,
                            "initialSharedVersion": "1",
                            "objectId": "0x0000000000000000000000000000000000000000000000000000000000000006"
                        }
                    }
                },
                "type": "object"
            },
            {
                "kind": "Input",
                "index": 6,
                "value": {
                    "Pure": [
                        0,
                        225,
                        245,
                        5,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                "type": "pure"
            },
            {
                "kind": "Input",
                "index": 7,
                "value": {
                    "Pure": [
                        0,
                        225,
                        245,
                        5,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                "type": "pure"
            },
            {
                "kind": "Input",
                "index": 8,
                "value": {
                    "Pure": [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ]
                },
                "type": "pure"
            },
            {
                "kind": "Input",
                "index": 9,
                "value": {
                    "Pure": [
                        1
                    ]
                },
                "type": "pure"
            },
            {
                "kind": "Input",
                "index": 10,
                "value": {
                    "Pure": [
                        76,
                        10,
                        158,
                        244,
                        111,
                        242,
                        77,
                        0,
                        61,
                        235,
                        223,
                        89,
                        83,
                        35,
                        75,
                        25,
                        16,
                        146,
                        100,
                        174,
                        81,
                        23,
                        70,
                        229,
                        107,
                        122,
                        39,
                        158,
                        61,
                        44,
                        251,
                        201
                    ]
                },
                "type": "pure"
            }
        ],
        "transactions": [
            {
                "kind": "MoveCall",
                "target": "0xa31282fc0a0ad50cf5f20908cfbb1539a143f5a38912eb8823a8dd6cbf98bc44::pool::open_position",
                "typeArguments": [
                    "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
                    "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC"
                ],
                "arguments": [
                    {
                        "kind": "Input",
                        "index": 0,
                        "value": {
                            "Object": {
                                "Shared": {
                                    "mutable": false,
                                    "initialSharedVersion": "406496849",
                                    "objectId": "0x03db251ba509a8d5d8777b6338836082335d93eecbdd09a11e190a1cff51c352"
                                }
                            }
                        },
                        "type": "object"
                    },
                    {
                        "kind": "Input",
                        "index": 1,
                        "value": {
                            "Object": {
                                "Shared": {
                                    "mutable": true,
                                    "initialSharedVersion": "406731547",
                                    "objectId": "0x3b585786b13af1d8ea067ab37101b6513a05d2f90cfe60e8b1d9e1b46a63c4fa"
                                }
                            }
                        },
                        "type": "object"
                    },
                    {
                        "kind": "Input",
                        "index": 2,
                        "value": {
                            "Pure": [
                                48,
                                38,
                                255,
                                255
                            ]
                        },
                        "type": "pure"
                    },
                    {
                        "kind": "Input",
                        "index": 3,
                        "value": {
                            "Pure": [
                                232,
                                39,
                                255,
                                255
                            ]
                        },
                        "type": "pure"
                    }
                ]
            },
            {
                "kind": "SplitCoins",
                "coin": {
                    "kind": "GasCoin"
                },
                "amounts": [
                    {
                        "kind": "Input",
                        "index": 4,
                        "value": {
                            "Pure": [
                                0,
                                225,
                                245,
                                5,
                                0,
                                0,
                                0,
                                0
                            ]
                        },
                        "type": "pure"
                    }
                ]
            },
            {
                "kind": "MoveCall",
                "target": "0x0000000000000000000000000000000000000000000000000000000000000002::coin::zero",
                "typeArguments": [
                    "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC"
                ],
                "arguments": []
            },
            {
                "kind": "MoveCall",
                "target": "0xa31282fc0a0ad50cf5f20908cfbb1539a143f5a38912eb8823a8dd6cbf98bc44::gateway::provide_liquidity_with_fixed_amount",
                "typeArguments": [
                    "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
                    "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC"
                ],
                "arguments": [
                    {
                        "kind": "Input",
                        "index": 5,
                        "value": {
                            "Object": {
                                "Shared": {
                                    "mutable": false,
                                    "initialSharedVersion": "1",
                                    "objectId": "0x0000000000000000000000000000000000000000000000000000000000000006"
                                }
                            }
                        },
                        "type": "object"
                    },
                    {
                        "kind": "Input",
                        "index": 0,
                        "value": {
                            "Object": {
                                "Shared": {
                                    "mutable": false,
                                    "initialSharedVersion": "406496849",
                                    "objectId": "0x03db251ba509a8d5d8777b6338836082335d93eecbdd09a11e190a1cff51c352"
                                }
                            }
                        },
                        "type": "object"
                    },
                    {
                        "kind": "Input",
                        "index": 1,
                        "value": {
                            "Object": {
                                "Shared": {
                                    "mutable": true,
                                    "initialSharedVersion": "406731547",
                                    "objectId": "0x3b585786b13af1d8ea067ab37101b6513a05d2f90cfe60e8b1d9e1b46a63c4fa"
                                }
                            }
                        },
                        "type": "object"
                    },
                    {
                        "kind": "NestedResult",
                        "index": 0,
                        "resultIndex": 0
                    },
                    {
                        "kind": "Result",
                        "index": 1
                    },
                    {
                        "kind": "Result",
                        "index": 2
                    },
                    {
                        "kind": "Input",
                        "index": 6,
                        "value": {
                            "Pure": [
                                0,
                                225,
                                245,
                                5,
                                0,
                                0,
                                0,
                                0
                            ]
                        },
                        "type": "pure"
                    },
                    {
                        "kind": "Input",
                        "index": 7,
                        "value": {
                            "Pure": [
                                0,
                                225,
                                245,
                                5,
                                0,
                                0,
                                0,
                                0
                            ]
                        },
                        "type": "pure"
                    },
                    {
                        "kind": "Input",
                        "index": 8,
                        "value": {
                            "Pure": [
                                0,
                                0,
                                0,
                                0,
                                0,
                                0,
                                0,
                                0
                            ]
                        },
                        "type": "pure"
                    },
                    {
                        "kind": "Input",
                        "index": 9,
                        "value": {
                            "Pure": [
                                1
                            ]
                        },
                        "type": "pure"
                    }
                ]
            },
            {
                "kind": "TransferObjects",
                "objects": [
                    {
                        "kind": "NestedResult",
                        "index": 0,
                        "resultIndex": 0
                    }
                ],
                "address": {
                    "kind": "Input",
                    "index": 10,
                    "value": {
                        "Pure": [
                            76,
                            10,
                            158,
                            244,
                            111,
                            242,
                            77,
                            0,
                            61,
                            235,
                            223,
                            89,
                            83,
                            35,
                            75,
                            25,
                            16,
                            146,
                            100,
                            174,
                            81,
                            23,
                            70,
                            229,
                            107,
                            122,
                            39,
                            158,
                            61,
                            44,
                            251,
                            201
                        ]
                    },
                    "type": "pure"
                }
            }
        ]
        }
      }

      const data = await helper.deserialize({transactionBlock: transaction} as any);

  
      expect(JSON.stringify(data)).toBe(`{"txType":"Other","txSubType":"OpenAndAddLiquidity","intentionData":{"pool":"0x03db251ba509a8d5d8777b6338836082335d93eecbdd09a11e190a1cff51c352","lowerTick":-55760,"upperTick":-55320,"tokenAmount":100000000,"maxAmountTokenA":100000000,"maxAmountTokenB":0,"isTokenAFixed":true}}`);

    })


  });
  
  describe('Bluefin core main flow', () => {
    const testWallet: WalletAccount = {
      address: '0x37a8d55f29e5b4bdba0cb3fe0ba51a93db8c868fe0de649e1bf36bb42ea7d959',
      publicKey: HexToUint8Array('03490bfb7d9075281e00a98614abf162c76bc89be51c25d6cacd3005c2420ff209'),
      chains: [SUI_MAINNET_CHAIN],
      features: [],
    };

    const helper = new BluefinHelper();

    let ts: TestSuiteLegacy<BluefinIntentionData>;


    beforeEach(() => {
      ts = new TestSuiteLegacy(testWallet, 'sui:mainnet', helper);
    });

    it('build open position and provide liquidity transaction', async () => {
  
      ts.setIntention({
        txType: TransactionType.Other,
        txSubType: TransactionSubType.OpenAndAddLiquidity,
        intentionData: {
          action: TransactionSubType.OpenAndAddLiquidity,
          txbParams: {
            pool: '0x0321b68a0fca8c990710d26986ba433d06b351deba9384017cd6175f20466a8f',
            lowerTick: 1000,
            upperTick: 2000,
            tokenAmount: 0.05e6,
            isCoinA: true,
            maxAmountTokenA: 0.05e6,
            maxAmountTokenB: 0.05e6,
          },
        },
      });


      const txb = await ts.voteAndExecuteIntention();

      expect(txb).toBeDefined();
      expect(txb.txb.blockData.sender).toBe(testWallet.address);
      expect(txb.txb.blockData.version).toBe(1);

    });
  });
});
