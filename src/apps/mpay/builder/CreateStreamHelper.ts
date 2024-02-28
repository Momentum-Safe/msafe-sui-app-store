import { TransactionArgument, TransactionBlock, TransactionObjectArgument } from '@mysten/sui.js/transactions';
import { normalizeStructTag, SUI_TYPE_ARG } from '@mysten/sui.js/utils';

import { FEE_NUMERATOR, FEE_DENOMINATOR, CLAIM_FEE_NUMERATOR, FLAT_FEE_SUI } from './const';
import { Globals } from '../common';
import { ResultRef } from '../common/transaction';
import { FeeContract } from '../contract/FeeContract';
import { InspectViewer } from '../contract/InspectViewer';
import { StreamContract } from '../contract/StreamContract';
import { encodeMetadata } from '../stream/metadata';
import { isSameCoinType } from '../sui/utils';
import {
  CreateStreamInfo,
  CreateStreamInfoInternal,
  MPayFees,
  PaymentWithFee,
  RecipientInfoInternal,
} from '../types/client';
import { CoinRequestResponse, GAS_OBJECT_SPEC, CoinRequest } from '../types/wallet';
import { generateGroupId } from '../utils/random';

export class CreateStreamHelper {
  constructor(
    public readonly globals: Globals,
    private readonly feeContract: FeeContract,
    private readonly streamContract: StreamContract,
  ) {}

  static convertCreateStreamInfoToInternal(info: CreateStreamInfo): CreateStreamInfoInternal {
    return {
      metadata: encodeMetadata({
        name: info.name,
        groupId: generateGroupId(),
      }),
      coinType: normalizeStructTag(info.coinType),
      recipients: info.recipients.map((recipient) => ({
        address: recipient.address,
        cliffAmount: recipient.cliffAmount,
        amountPerEpoch: recipient.amountPerStep,
      })),
      epochInterval: info.interval,
      numberEpoch: info.steps,
      startTime: info.startTimeMs,
      cancelable: info.cancelable,
    };
  }

  async buildCreateStreamTransactionBlock(info: CreateStreamInfoInternal): Promise<TransactionBlock> {
    const txb = new TransactionBlock();
    const paymentWithFee = this.calculateFeesInternal(info);
    const coinReqs = this.getCreateStreamCoinRequests(info, paymentWithFee);
    const coinResp = await this.wallet.requestCoins(coinReqs);

    const paymentMergedObject = await this.addMergeCoins(txb, coinResp[0]);
    let flatFeeMergedObject: TransactionArgument;
    if (coinReqs.length > 1) {
      flatFeeMergedObject = await this.addMergeCoins(txb, coinResp[1]);
    } else {
      flatFeeMergedObject = paymentMergedObject;
    }

    // Create streams
    for (let i = 0; i < info.recipients.length; i++) {
      const recipient = info.recipients[i];
      const paymentAmount = this.amountForRecipient(recipient, info.numberEpoch);
      const feeAmount = this.getStreamFeeLocal(paymentAmount);
      const [paymentCoin] = txb.splitCoins(paymentMergedObject, [txb.pure(paymentAmount + feeAmount, 'u64')]);
      const [flatFeeCoin] = txb.splitCoins(flatFeeMergedObject, [txb.pure(this.flatSuiFee, 'u64')]);
      this.streamContract.createStream(txb, {
        paymentCoin: new ResultRef(paymentCoin as TransactionArgument & TransactionArgument[]),
        flatFeeCoin: new ResultRef(flatFeeCoin as TransactionArgument & TransactionArgument[]),
        metadata: info.metadata,
        recipient: recipient.address,
        timeStart: info.startTime,
        cliff: recipient.cliffAmount,
        epochInterval: info.epochInterval,
        numEpoch: info.numberEpoch,
        amountPerEpoch: recipient.amountPerEpoch,
        cancelable: info.cancelable,
        coinType: info.coinType,
      });
    }
    return txb;
  }

  calculateCreateStreamFees(createInfo: CreateStreamInfo) {
    const infoInternal = CreateStreamHelper.convertCreateStreamInfoToInternal(createInfo);
    return this.calculateFeesInternal(infoInternal);
  }

  feeParams(): MPayFees {
    return {
      createFeePercent: {
        numerator: FEE_NUMERATOR,
        denominator: FEE_DENOMINATOR,
      },
      claimFeePercent: {
        numerator: CLAIM_FEE_NUMERATOR,
        denominator: FEE_DENOMINATOR,
      },
      flatFeePerStream: FLAT_FEE_SUI,
    };
  }

  private async addMergeCoins(txb: TransactionBlock, coins: CoinRequestResponse): Promise<TransactionObjectArgument> {
    let mergedCoin: TransactionObjectArgument;
    if (coins.mergedCoins && coins.mergedCoins.length) {
      txb.mergeCoins(
        txb.object(coins.primaryCoin),
        coins.mergedCoins.map((coinId) => txb.object(coinId)),
      );
      mergedCoin = txb.object(coins.primaryCoin);
    } else if (coins.primaryCoin === GAS_OBJECT_SPEC) {
      mergedCoin = txb.gas;
    } else {
      mergedCoin = txb.object(coins.primaryCoin);
    }
    return mergedCoin;
  }

  getCreateStreamCoinRequests(info: CreateStreamInfoInternal, payment: PaymentWithFee): CoinRequest[] {
    const streamCoinType = info.coinType;

    if (isSameCoinType(streamCoinType, SUI_TYPE_ARG)) {
      return [
        {
          coinType: streamCoinType,
          amount: payment.totalAmount + payment.streamFeeAmount + payment.flatFeeAmount,
        },
      ];
    }
    return [
      {
        coinType: streamCoinType,
        amount: payment.totalAmount + payment.streamFeeAmount,
      },
      {
        coinType: SUI_TYPE_ARG,
        amount: payment.flatFeeAmount,
      },
    ];
  }

  calculateFeesInternal(info: CreateStreamInfoInternal): PaymentWithFee {
    const streamPayment = info.recipients.reduce(
      (sum, recipient) => {
        const totalAmount = this.amountForRecipient(recipient, info.numberEpoch);
        const fee = this.getStreamFeeLocal(totalAmount);
        return {
          totalAmount: sum.totalAmount + totalAmount,
          streamFeeAmount: sum.streamFeeAmount + fee,
        };
      },
      {
        totalAmount: 0n,
        streamFeeAmount: 0n,
      },
    );
    const flatFeeAmount = BigInt(info.recipients.length) * this.flatSuiFee;
    return {
      flatFeeAmount,
      ...streamPayment,
    };
  }

  private amountForRecipient(recipient: RecipientInfoInternal, numEpoch: bigint) {
    return recipient.amountPerEpoch * numEpoch + recipient.cliffAmount;
  }

  get flatSuiFee() {
    return FLAT_FEE_SUI;
  }

  getStreamFeeLocal(streamAmount: bigint) {
    return (streamAmount * FEE_NUMERATOR) / FEE_DENOMINATOR;
  }

  async getStreamFeeRemote(streamAmount: bigint) {
    const txb = this.feeContract.streamingFee(new TransactionBlock(), streamAmount);
    const res = await this.globals.suiClient.devInspectTransactionBlock({
      sender: await this.globals.walletAddress(),
      transactionBlock: txb,
    });
    const iv = new InspectViewer(res);
    return iv.getU64();
  }

  get wallet() {
    return this.globals.wallet;
  }
}
