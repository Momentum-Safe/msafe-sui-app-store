import { CoinStruct, IotaClient, IotaObjectResponse, PaginatedCoins } from '@iota/iota-sdk/client';
import { TransactionBlock } from '@iota/iota-sdk/transactions';
import {
  CoinTransferIntention,
  isCoinObjectType,
  isSameAddress,
  isSuiStructEqual,
  ObjectTransferIntention,
  SuiAddress,
} from '@msafe/iota-utils';

export async function buildCoinTransferTxb(client: IotaClient, intention: CoinTransferIntention, sender: SuiAddress) {
  if (isSuiStructEqual(intention.coinType, '0x2::iota::IOTA')) {
    return buildSuiCoinTransferTxb(intention, sender);
  }
  return buildOtherCoinTransferTxb(client, intention, sender);
}

export function buildSuiCoinTransferTxb(intention: CoinTransferIntention, sender: SuiAddress) {
  const block = new TransactionBlock();
  const [coin] = block.splitCoins(block.gas, [block.pure(intention.amount)]);
  block.transferObjects([coin], block.pure(intention.recipient));
  block.setSender(sender);
  return block;
}

export async function buildOtherCoinTransferTxb(
  client: IotaClient,
  intention: CoinTransferIntention,
  sender: SuiAddress,
) {
  const objs = await getAllCoins(client, sender, intention.coinType);
  if (objs.length === 0) {
    throw new Error('No valid coin found to send');
  }
  const totalBal = objs.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
  if (totalBal < BigInt(intention.amount)) {
    throw new Error('Not enough balance');
  }
  const txb = new TransactionBlock();
  const primary = txb.object(objs[0].coinObjectId);
  if (objs.length > 1) {
    txb.mergeCoins(
      primary,
      objs.slice(1).map((obj) => txb.object(obj.coinObjectId)),
    );
  }
  const [coin] = txb.splitCoins(primary, [txb.pure(intention.amount)]);
  txb.transferObjects([coin], txb.pure(intention.recipient));
  txb.setSender(sender);
  return txb;
}

/**
 * Get all owner coins
 * @param client sui client
 * @param owner owner address
 * @param coinType coin type
 * @returns coins
 */
export async function getAllCoins(client: IotaClient, owner: SuiAddress, coinType: string | undefined) {
  let hasNext = true;
  let cursor: string | undefined | null;
  const res: CoinStruct[] = [];
  while (hasNext) {
    const currentPage: PaginatedCoins = await client.getCoins({
      owner,
      coinType,
      cursor,
    });
    res.push(...currentPage.data);
    hasNext = currentPage.hasNextPage;
    cursor = currentPage.nextCursor;
  }
  return res;
}

export async function buildObjectTransferTxb(
  client: IotaClient,
  intention: ObjectTransferIntention,
  sender: SuiAddress,
) {
  await validateObjectTransfer(client, intention, sender);

  const txb = new TransactionBlock();
  txb.transferObjects([txb.object(intention.objectId)], txb.pure(intention.receiver));
  txb.setSender(sender);

  return txb;
}

async function validateObjectTransfer(client: IotaClient, intention: ObjectTransferIntention, sender: SuiAddress) {
  const obj = await client.getObject({
    id: intention.objectId,
    options: {
      showType: true,
      showOwner: true,
    },
  });

  if (obj.data === undefined) {
    throw new Error('Object not found');
  }
  if (!obj.data?.type) {
    throw new Error('Object type is null');
  }
  if (!isSuiStructEqual(obj.data.type, intention.objectType)) {
    throw new Error('Object type not expected');
  }
  if (isCoinObjectType(obj.data.type)) {
    throw new Error('Can not transfer coin object in Object Transfer transactions');
  }
  const addressOwner = getAddressOwner(obj);
  if (!isSameAddress(addressOwner, sender)) {
    throw new Error('Object owner not match');
  }
}

function getAddressOwner(object: IotaObjectResponse) {
  const owner = object.data?.owner;
  if (!owner) {
    throw new Error('Object Owner not found');
  }

  if (typeof owner !== 'object' || !('AddressOwner' in owner)) {
    throw new Error('Invalid object owner');
  }
  return owner.AddressOwner;
}
