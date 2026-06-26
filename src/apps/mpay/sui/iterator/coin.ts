import type { MsafeSuiGrpcClient } from '@/lib/suiGrpcClient';

import { getAllFromIterator, EntryIterator } from './iterator';
import { Requester, PagedData } from './requester';
import { NotEnoughBalanceError } from '../../error/NotEnoughBalanceError';
import { SanityError } from '../../error/SanityError';
import { MpayCoin, mpayGetCoins } from '../../utils/rpc';

const DEF_REQ_PAGE_SIZE = 25;

export async function getCoinsWithAmount(
  suiClient: MsafeSuiGrpcClient,
  owner: string,
  requestAmount: bigint,
  coinType = '0x2::sui::SUI',
  pageSize: number = DEF_REQ_PAGE_SIZE,
) {
  const it = new OwnedCoinIterator(suiClient, owner, coinType, pageSize);
  let totalAmount = BigInt(0);
  const res: MpayCoin[] = [];
  while ((await it.hasNext()) && totalAmount < requestAmount) {
    const val = await it.next();
    if (!val) {
      continue;
    }
    res.push(val);
    totalAmount += BigInt(val.balance);
  }
  if (totalAmount < requestAmount) {
    throw new NotEnoughBalanceError(coinType, requestAmount, totalAmount);
  }
  return res;
}

export async function getAllOwnedCoins(
  suiClient: MsafeSuiGrpcClient,
  owner: string,
  coinType = '0x2::sui::SUI',
  pageSize: number = DEF_REQ_PAGE_SIZE,
) {
  const iter = new OwnedCoinIterator(suiClient, owner, coinType, pageSize);
  return (await getAllFromIterator(iter)) as MpayCoin[];
}

export class OwnedCoinIterator extends EntryIterator<MpayCoin> {
  constructor(
    private readonly suiClient: MsafeSuiGrpcClient,
    private readonly owner: string,
    private readonly coinType: string,
    private readonly reqPageSize: number,
  ) {
    super(new OwnedCoinRequester(suiClient, owner, coinType, reqPageSize));
  }
}

export class OwnedCoinRequester implements Requester<MpayCoin> {
  nextCursor: string | null | undefined;

  constructor(
    private readonly suiClient: MsafeSuiGrpcClient,
    private readonly owner: string,
    private readonly coinType: string,
    private readonly reqPageSize: number,
  ) {
    if (reqPageSize <= 0) {
      throw new SanityError('Invalid reqPageSize');
    }
  }

  async doNextRequest(): Promise<PagedData<MpayCoin>> {
    const res = await mpayGetCoins(this.suiClient, {
      owner: this.owner,
      coinType: this.coinType,
      cursor: this.nextCursor,
      limit: this.reqPageSize,
    });
    this.nextCursor = res.nextCursor;
    return {
      data: res.data,
      hasNext: res.hasNextPage,
    };
  }
}
