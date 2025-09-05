import { SuiClient } from '@mysten/sui/client';

export async function getTokenAmount(client: SuiClient, sender: string, coinType: string): Promise<number> {
  if (!sender) {
    throw new Error('Sender is undefined.');
  }
  if (!client) {
    throw new Error('Client is undefined.');
  }
  const coinInfo = await client.getBalance({
    owner: sender,
    coinType,
  });
  const tokenBalance = Number(coinInfo.totalBalance);
  return tokenBalance;
}

export async function getTokenObjs(client: SuiClient, sender: string, coinType: string): Promise<any> {
  const result = await client.getCoins({
    owner: sender,
    coinType,
  });
  console.log('getTokenObjs', sender, result);
  return result;
}
