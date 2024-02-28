import { SuiClient, CoinStruct } from '@mysten/sui.js/client';

import { getAllFromIterator, EntryIterator } from './iterator';
import { Requester, PagedData } from './requester';
import { NotEnoughBalanceError } from '../../error/NotEnoughBalanceError';
import { SanityError } from '../../error/SanityError';

const DEF_REQ_PAGE_SIZE = 25;

export async function getCoinsWithAmount(
  suiClient: SuiClient,
  owner: string,
  requestAmount: bigint,
  coinType = '0x2::sui::SUI',
  pageSize: number = DEF_REQ_PAGE_SIZE,
) {
  const it = new OwnedCoinIterator(suiClient, owner, coinType, pageSize);
  let totalAmount = BigInt(0);
  const res: CoinStruct[] = [];
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
  suiClient: SuiClient,
  owner: string,
  coinType = '0x2::sui::SUI',
  pageSize: number = DEF_REQ_PAGE_SIZE,
) {
  const iter = new OwnedCoinIterator(suiClient, owner, coinType, pageSize);
  return (await getAllFromIterator(iter)) as CoinStruct[];
}

export class OwnedCoinIterator extends EntryIterator<CoinStruct> {
  constructor(
    private readonly suiClient: SuiClient,
    private readonly owner: string,
    private readonly coinType: string,
    private readonly reqPageSize: number,
  ) {
    super(new OwnedCoinRequester(suiClient, owner, coinType, reqPageSize));
  }
}

export class OwnedCoinRequester implements Requester<CoinStruct> {
  nextCursor: string | null | undefined;

  constructor(
    private readonly suiClient: SuiClient,
    private readonly owner: string,
    private readonly coinType: string,
    private readonly reqPageSize: number,
  ) {
    if (reqPageSize <= 0) {
      throw new SanityError('Invalid reqPageSize');
    }
  }

  async doNextRequest(): Promise<PagedData<CoinStruct>> {
    const res = await this.suiClient.getCoins({
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
