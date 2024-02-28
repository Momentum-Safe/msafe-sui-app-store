import {
  CoinMetadata,
  SuiClient,
  SuiObjectChangeCreated,
  SuiTransactionBlockResponse,
  DevInspectResults,
} from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { normalizeStructTag, SUI_TYPE_ARG } from '@mysten/sui.js/utils';
import { DateTime, Duration } from 'luxon';

import { CreateStreamHelper } from '../builder/CreateStreamHelper';
import { MPayBuilder } from '../builder/MPayBuilder';
import { Globals } from '../common';
import { InvalidInputError } from '../error/InvalidInputError';
import { TransactionFailedError } from '../error/TransactionFailedError';
import {
  IMPayHelper,
  CreateStreamInfo,
  PaymentWithFee,
  MPayFees,
  Fraction,
  CalculatedStreamAmount,
  CalculatedTimeline,
} from '../types/client';

// Minimum time interval is 1 second
export const MIN_INTERVAL_MS = 1000;

export class MPayHelper implements IMPayHelper {
  private readonly coinMetaHelper: CoinMetaHelper;

  private readonly createStreamHelper: CreateStreamHelper;

  constructor(public readonly globals: Globals) {
    this.coinMetaHelper = new CoinMetaHelper(globals.suiClient);
    this.createStreamHelper = new MPayBuilder(globals).createStreamHelper();
  }

  getStreamIdsFromCreateStreamResponse(res: SuiTransactionBlockResponse) {
    if (res.effects?.status.status !== 'success') {
      throw new TransactionFailedError(res.effects?.status.status, res.effects?.status.error);
    }
    return res
      .objectChanges!.filter(
        (change) =>
          change.type === 'created' &&
          change.objectType.startsWith(`${this.globals.envConfig.contract.contractId}::stream::Stream`),
      )
      .map((change) => (change as SuiObjectChangeCreated).objectId);
  }

  calculateCreateStreamFees(info: CreateStreamInfo): PaymentWithFee {
    return this.createStreamHelper.calculateCreateStreamFees(info);
  }

  feeParams(): MPayFees {
    return this.createStreamHelper.feeParams();
  }

  calculateStreamAmount(input: { totalAmount: bigint; steps: bigint; cliff?: Fraction }): CalculatedStreamAmount {
    if (input.steps === 0n) {
      throw new InvalidInputError('Invalid stream steps: 0');
    }
    const cliffFraction = input.cliff
      ? input.cliff
      : {
          numerator: 0n,
          denominator: 100n,
        };
    const cliffAmount = (input.totalAmount * cliffFraction.numerator) / cliffFraction.denominator;
    const amountPerStep = (input.totalAmount - cliffAmount) / input.steps;
    const realTotalAmount = amountPerStep * input.steps + cliffAmount;

    const res = {
      realTotalAmount,
      cliffAmount,
      amountPerStep,
    };
    this.validateStreamAmount(res, input.totalAmount);
    return res;
  }

  calculateTimelineByInterval(input: { timeStart: DateTime; interval: Duration; steps: bigint }): CalculatedTimeline {
    if (input.steps === 0n) {
      throw new InvalidInputError('Invalid stream steps: 0');
    }
    const timeEnd = input.timeStart.plus(input.interval.toMillis() * Number(input.steps));

    const res = {
      timeStart: input.timeStart,
      timeEnd,
      interval: input.interval,
      steps: input.steps,
    };
    this.validateTimeline(res);
    return res;
  }

  calculateTimelineByTotalDuration(input: { timeStart: DateTime; total: Duration; steps: bigint }): CalculatedTimeline {
    if (input.steps === 0n) {
      throw new InvalidInputError('Invalid stream steps: 0');
    }
    const intervalMilli = BigInt(input.total.toMillis()) / input.steps;
    const timeEnd = input.timeStart.plus(Duration.fromMillis(Number(intervalMilli * input.steps)));
    const res = {
      timeStart: input.timeStart,
      timeEnd,
      interval: Duration.fromMillis(Number(intervalMilli)),
      steps: input.steps,
    };
    this.validateTimeline(res);
    return res;
  }

  async getBalance(address: string, coinType?: string | null) {
    const balance = await this.globals.suiClient.getBalance({
      owner: address,
      coinType,
    });
    const coinMeta = await this.getCoinMeta(coinType);
    return {
      ...balance,
      coinType: normalizeStructTag(balance.coinType),
      coinMeta,
    };
  }

  async getAllBalance(address: string) {
    const allBalance = await this.globals.suiClient.getAllBalances({
      owner: address,
    });
    const coinMetas = await Promise.all(allBalance.map((bal) => this.getCoinMeta(bal.coinType)));
    return allBalance.map((bal, i) => ({
      ...bal,
      coinType: normalizeStructTag(bal.coinType),
      coinMeta: coinMetas[i],
    }));
  }

  async getCoinMeta(coinType: string | null | undefined) {
    return this.coinMetaHelper.getCoinMeta(coinType);
  }

  async simulateTransactionBlock(txb: TransactionBlock): Promise<DevInspectResults> {
    return this.globals.suiClient.devInspectTransactionBlock({
      transactionBlock: txb,
      sender: await this.globals.wallet.address(),
    });
  }

  private validateStreamAmount(val: CalculatedStreamAmount, originTotalAmount: bigint) {
    if (val.amountPerStep === 0n) {
      throw new InvalidInputError('Stream amount too small', 'totalAmount', originTotalAmount);
    }
    if (val.cliffAmount > val.realTotalAmount) {
      throw new InvalidInputError('Invalid cliff settings');
    }
  }

  private validateTimeline(val: CalculatedTimeline) {
    if (val.interval.toMillis() < MIN_INTERVAL_MS) {
      throw new InvalidInputError('Interval shall be at least 1 second', 'interval', val.interval);
    }
  }
}

export class CoinMetaHelper {
  private coinMetaReg: Map<string, CoinMetadata>;

  constructor(private readonly suiClient: SuiClient) {
    this.coinMetaReg = new Map();
  }

  async getCoinMeta(coinType: string | null | undefined): Promise<CoinMetadata | undefined> {
    const normalized = normalizeStructTag(coinType || SUI_TYPE_ARG);
    if (this.coinMetaReg.has(normalized)) {
      return this.coinMetaReg.get(normalized);
    }
    const meta = await this.queryCoinMeta(normalized);
    if (meta) {
      this.coinMetaReg.set(normalized, meta);
    }
    return meta;
  }

  private async queryCoinMeta(coinType: string): Promise<CoinMetadata | undefined> {
    const res = await this.suiClient.getCoinMetadata({ coinType });
    return res || undefined;
  }
}
