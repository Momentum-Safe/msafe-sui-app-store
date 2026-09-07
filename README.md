# MSafe Sui App Store

<p align="center">
  <img alt="Helper integration deprecated" src="https://img.shields.io/badge/helper_PRs-DEPRECATED-dc2626?style=for-the-badge">
  <img alt="Closed to new apps" src="https://img.shields.io/badge/this_repo-CLOSED_to_new_apps-111827?style=for-the-badge">
  <img alt="New path" src="https://img.shields.io/badge/new_dApps-submit_a_real_Transaction-059669?style=for-the-badge">
</p>

<table>
  <tr>
    <td align="center">

### This repository is not an onboarding surface

**Writing a helper, forking `src/apps/**`, or opening a PR here will not list your dApp.**

MSafe no longer accepts new App Store adapters. Integrate the same way you integrate Slush: build a real Sui `Transaction` in your dApp and submit it with `@msafe/sui-wallet`.

**If you already started the old helper work → [How to change your dApp](#how-to-change-your-dapp)**  
**If you are new → [Current integration](#current-integration)**

</td>
  </tr>
</table>

> [!CAUTION]
> **DEPRECATED:** `BaseIntention`, `IAppHelperInternal`, `src/apps/<your-app>`, `appContext`, and “fork this repo + wait for our release” are retired for **all new listings**.
>
> New helper PRs will **not** be merged. Waiting for `@msafe/sui-app-store` to publish will **not** unblock you.

> [!IMPORTANT]
> **Do this instead:** assemble the PTB yourself → `registerWallet(new MSafeWallet('your-app-name', rpcUrl, network))` → `signAndExecuteTransaction({ transaction: tx })`. Ask MSafe only for a store **card** (name, icon, URL).

---

## How to change your dApp

Use this section if your team followed the old README: created an intention class, a helper, `appContext`, or a PR against this repo.

### Stop / start

| Stop (deprecated) | Start (required) |
| --- | --- |
| ~~`yarn add @msafe/sui-app-store`~~ / import `appHelpers` | Delete the dependency. Your dApp must not import this package. |
| ~~`src/apps/<your-app>` intention + helper~~ | Delete the fork / local helper. MSafe will not review or ship it. |
| ~~Open a PR to register `new YourHelper()` in `src/index.ts`~~ | Close the PR. Listing is a store card, not a helper publish. |
| ~~`signTransaction({ transaction: new Transaction(), appContext })`~~ | Pass a **fully built** `Transaction` (`commands.length > 0`). **No `appContext`.** |
| ~~Wait for MSafe to release `@msafe/sui-app-store`~~ | Ship your dApp. Then send name / icon / URL for the card. |
| ~~`new MSafeWallet('app')` only~~ | `new MSafeWallet('your-app-name', rpcUrl, 'sui:mainnet')` |

### Before → after

**1. Wallet registration**

```ts
// DEPRECATED — incomplete constructor, often paired with a helper name
registerWallet(new MSafeWallet('your-app-name'));
```

```ts
// REQUIRED
import { MSafeWallet } from '@msafe/sui-wallet';
import { registerWallet } from '@mysten/wallet-standard';

registerWallet(new MSafeWallet('your-app-name', rpcUrl, 'sui:mainnet'));
```

Use the **same** `your-app-name` in history and in the store card.

**2. Submit**

```ts
// DEPRECATED — empty PTB + helper payload. Unregistered apps are rejected.
await signAndExecuteTransaction({
  transaction: new Transaction(),
  appContext: { action: 'swap', txbParams },
});
```

```ts
// REQUIRED — same Transaction you would send to Slush / any wallet
import { Transaction } from '@mysten/sui/transactions';

const tx = new Transaction();
tx.setSender(multisigAddress); // connected MSafe account
// ...real moveCall / transfer / SDK calls — commands.length must be > 0

await dAppKit.signAndExecuteTransaction({ transaction: tx });
// Do not pass appContext.
```

**3. Remove helper-only code**

Search the dApp and delete:

- `from '@msafe/sui-app-store'`
- `appContext`
- `BaseIntention` / `YourHelper` / `deserialize` / `intentionData`
- empty `new Transaction()` built only so the helper can `build()` later

Keep your protocol SDK (Cetus SDK, NAVI SDK, your own `moveCall`s). Those already produce a `Transaction`. Submit **that** object.

### Migration checklist

- [ ] Remove `@msafe/sui-app-store` from `package.json`
- [ ] Register `MSafeWallet` with **name + RPC URL + network**
- [ ] Connect via `@mysten/dapp-kit` (or wallet-standard) as you do for other wallets
- [ ] Every MSafe sign path sends a PTB with **at least one command**
- [ ] No `appContext` on `signTransaction` / `signAndExecuteTransaction`
- [ ] `tx.setSender` is the **multisig** address (the connected MSafe account)
- [ ] Close any helper PR against this repository
- [ ] Send MSafe: app name, icon, production URL — for the store card only

`signAndExecuteTransaction` **proposes** to the multisig queue. It does **not** return an on-chain digest. Owners vote and execute in MSafe.

Empty `new Transaction()` from an unregistered app is rejected:

> Empty transaction. Unregistered apps must pass a fully assembled Transaction (`commands.length > 0`). Do not send `new Transaction()`.

---

## Current integration

```mermaid
flowchart LR
  A[Your dApp builds a real Transaction] --> B["MSafeWallet signAndExecuteTransaction"]
  B --> C[MSafe simulates]
  C --> D[Owners vote in MSafe]
  D --> E[Execute on chain]
```

Inside the MSafe store iframe, treat MSafe as a normal wallet. You own the PTB. MSafe owns simulate → vote → execute. New apps use the generic payload view (simulation + raw transaction), not a custom “swap / deposit” card.

### 1. Register the wallet

```ts
import { MSafeWallet } from '@msafe/sui-wallet';
import { registerWallet } from '@mysten/wallet-standard';

registerWallet(new MSafeWallet('your-app-name', rpcUrl, 'sui:mainnet'));
```

Call this once at startup (`main.tsx`). Use `MSafeWallet.inMSafeWallet()` if the page should behave differently inside the iframe versus standalone.

### 2. Submit the transaction

```ts
await dAppKit.signAndExecuteTransaction({ transaction: tx });
```

| Rule | Detail |
| --- | --- |
| Real PTB | `tx.getData().commands.length > 0` |
| Sender | Connected MSafe **multisig** |
| No helper | Do not import this package. Do not pass `appContext`. |
| Encoding | Mysten V2 `Transaction` / `toJSON()`. Do not use V1 `serialize()`. |

| API | Behavior |
| --- | --- |
| `signTransaction({ transaction })` | Propose. Preferred. |
| `signAndExecuteTransaction({ transaction })` | Same propose path. **No digest** in the result. |
| `signTransactionBlock` / `signAndExecuteTransactionBlock` | Legacy aliases. |

The store iframe accepts **one** in-flight proposal. If the multisig already has a pending transaction or future intentions, a new submit is rejected until that queue is cleared.

### 3. List in the store

Listing is a **card**: name, icon, URL. MSafe adds `id` / `image` / `dappLink` on the web app. There is no adapter review and no `@msafe/sui-app-store` release on the critical path.

### Reference

- Wallet SDK: https://github.com/Momentum-Safe/msafe-sui-wallet
- Sample dApp: https://github.com/Momentum-Safe/msafe-sui-app-arbitrary-transaction — follow the **wallet `Transaction`** path, not old `appContext` commits
- Live sample: https://sui-ptx.m-safe.io/

---

## Already-listed apps with a helper

Cetus, NAVI, MMT, mpay, `msafe-core`, `msafe-plain-tx`, and other **already registered** helpers may keep empty PTB + `appContext` until they migrate.

- Do not add helpers for **new** products or new protocols.
- New features on a listed brand should still use [How to change your dApp](#how-to-change-your-dapp) when you can.

This package remains a **compatibility library** only. MSafe may still publish it to patch an existing helper. That is not how new apps go live.

---

<details>
<summary><strong>⛔ DEPRECATED archive — old helper guide (do not follow)</strong></summary>

> [!CAUTION]
> Everything below is the previous contribution guide. It is **deprecated** and kept only so reviewers can see what was retired. **Do not copy it.** Jump back to [How to change your dApp](#how-to-change-your-dapp).

### ~~Background~~

~~Due to Sui blockchain version limitations, multisig account can't propose multiple transactions at the same time. It's needed to be create as transaction intention first and propose transaction 1 by 1 for vote & execution.~~

### ~~Overview~~

~~![Overview](./diagram.png)~~

### ~~Demos~~

~~We provide a demo dApp for MSafe app store integration. please refer below GitHub repository: https://github.com/Momentum-Safe/msafe-sui-app-arbitrary-transaction~~

~~In this demo, we implement a dApp that allows users to execute arbitrary transaction on Sui.~~

~~You can see how to implement with `@msafe/sui-app-store` in this demo.~~

~~Including:~~

- ~~Initiate MSafe Wallet~~
- ~~Connect to MSafe Wallet using `@mysten/dapp-kit`~~
- ~~Sign transaction with MSafe Wallet (also using `@msafe/dapp-kit`)~~

~~The main logic is implemented in `src/App.tsx`~~

~~Demo dApp: https://sui-ptx.m-safe.io/~~

### ~~How to contribute~~

- ~~Fork the repository~~
- ~~Create a new branch for your app development~~
- ~~Create pull request for review~~

### ~~How to develop~~

#### ~~Summary~~

~~There are two ways to integrate with the MSafe Sui App store:~~

1. ~~When dapp call signTransaction method, directly pass in the assembled Transaction (Transaction Block), and the user can then complete the subsequent transaction process.~~
2. ~~Through the create helper method (see below)~~

#### ~~Setup~~

- ~~Create your app folder under `src/apps/` folder~~

#### ~~Create intentions~~

- ~~Create your dapp intentions under `src/apps/<your app>` folder~~

~~Here is an example for transaction intention, if your dapp have multiple transaction types, you need to define 1 by 1 for each type of transaction intention.~~

~~If you are using @mysten/sui.js, you can refer to the following code:~~

~~Historical example — do not copy:~~

```typescript
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

export interface ExampleIntentionData {
  foo: string;
  bar: string;
}

export class ExampleIntention extends BaseIntentionLegacy<ExampleIntentionData> {
  txType: TransactionType.Other;

  txSubType: 'Example';

  constructor(public readonly data: ExampleIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    ...
    return txb;
  }

  static fromData(data: ExampleIntentionData) {
    return new ExampleIntention(data);
  }
}
```

~~If you are using @mysten/sui, you can refer to the following code:~~

```typescript
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

export interface ExampleIntentionData {
  foo: string;
  bar: string;
}

export class ExampleIntention extends BaseIntention<ExampleIntentionData> {
  txType: TransactionType.Other;

  txSubType: 'Example';

  constructor(public readonly data: ExampleIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { suiClient, account } = input;
    ...
    return txb;
  }

  static fromData(data: ExampleIntentionData) {
    return new ExampleIntention(data);
  }
}
```

~~Each intention should have one data structure to store transaction information for future build.~~
~~This structure can be defined according to your own business logic, it can be any type of data, (should be JSON serializable)~~

~~Transaction intention implement mainly one API `build(): Promise<TransactionBlock>` which will build Sui transaction block from your defined business data.~~

#### ~~Create helper~~

- ~~Create helper ts at `src/apps/<your app>/intention.ts`~~

```typescript
export type CoreIntention = CoinTransferIntention | ObjectTransferIntention;

export type CoreIntentionData = CoinTransferIntentionData | ObjectTransferIntentionData;

export class CoreHelper implements IAppHelperInternalLegacy<CoreIntention, CoreIntentionData> {
  application: string;

  constructor() {
    this.application = 'msafe-core';
  }

  deserialize(): CoreIntention {
    throw new Error('MSafe core transaction intention should be build from API');
  }

  async build(input: {
    intentionData: CoreIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    let intention: CoreIntention;
    switch (input.txSubType) {
      case 'coin-transfer':
        intention = CoinTransferIntention.fromData(input.intentionData as CoinTransferIntentionData);
        break;
      case 'object-transfer':
        intention = ObjectTransferIntention.fromData(input.intentionData as ObjectTransferIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient, account });
  }
}
```

~~The helper is responsible for convert a transaction block to your own transaction intention business data. this is call by SuiWallet standard API `sui:signTransactionBlock` feature.~~

#### ~~Write test for your business logic~~

- ~~Create your test at `test/<your app>.test.ts`~~

```typescript
import { TransactionType } from '@msafe/sui3-utils';

import { CoinTransferIntention, CoinTransferIntentionData } from '@/apps/msafe-core/coin-transfer';
import { appHelpers } from '@/index';

import { Account, Client } from './config';

describe('MSafe Core Wallet', () => {
  it('Core transaction build', async () => {
    const appHelper = appHelpers.getAppHelper('msafe-core');

    expect(appHelper.application).toBe('msafe-core');

    const res = await appHelper.build({
      txType: TransactionType.Assets,
      txSubType: 'coin-transfer',
      suiClient: Client,
      account: Account,
      intentionData: {
        amount: '1000',
        coinType: '0x2::sui::SUI',
        recipient: '123',
      } as CoinTransferIntentionData,
    });
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0df172b18d30935ad68b2f9d6180e5adcf8edfd7df874852817002e6eccada66');
  });

  it('Test intention serialization', () => {
    const intention = CoinTransferIntention.fromData({
      recipient: 'a',
      coinType: 'b',
      amount: '100',
    });

    expect(intention.serialize()).toBe('{"amount":"100","coinType":"b","recipient":"a"}');
  });
});
```

#### ~~App custom parameters~~

- ~~You can pass custom parameters into the `appContext` parameter of the Helper.deserialize method.~~

```typescript
deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{
    txType: TransactionType;
    txSubType: string;
    intentionData: T;
  }>;
```

- ~~When implementing your app's `Helper.deserialize`, you can write your business logic based on the custom parameters you've passed in.~~

```typescript
export class DemoHelper implements IAppHelperInternal<DemoIntentionData> {

...

async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: CetusIntentionData }> {
    const { txbParams, action } = input.appContext;

    return {
      txType: TransactionType.Other,
      txSubType: action,
      intentionData: {
        txbParams: { ...txbParams },
        action,
      },
    };
  }

...

}
```

#### ~~Register your app helper~~

- ~~Add your app helper to file `src/index.ts`~~

```typescript
export const appHelpers = new MSafeApps([new CoreHelper(), <your app helper instance here>]);
```

#### ~~Test your integration with our test framework `TestSuite`~~

- ~~before create pull request, you should test your helper with test suite, add at least one test case before creating the PR.~~

```typescript
import { TestSuite, TestSuiteLegacy } from './TestSuite';

describe('Main flow', () => {
  const testWallet: WalletAccount = {
    address: 'YOUR_TEST_WALLET_ADDRESS',
    publicKey: HexToUint8Array('YOUR_TEST_WALLET_PUBLIC_KEY'),
    chains: [SUI_MAINNET_CHAIN],
    features: [],
  };

  let ts: TestSuite<YourIntentionData>;
  let ts: TestSuiteLegacy<YourIntentionData>;

  beforeEach(() => {
    ts = new TestSuite(testWallet, 'sui:mainnet', new YourHelper());
  });

  describe('overall flow', () => {
    it('overall flow', async () => {
      const appTxb = new TransactionBlock();
      await ts.signAndSubmitTransaction({ txb: appTxb, appContext: {
        // ... your app context here, will be passed to your helper.deserialize method
      } });
      const finalizedTxb = await ts.voteAndExecuteIntention();

      expect(finalizedTxb).toBeDefined();
    });
  });
});
```

~~You can refer to `test/core.test.ts` for more details implementation.~~

#### ~~Create pull request for submit~~

~~Once you finish development, you can create a PR to submit your changes.~~

### ~~Integrate MSafe wallet with your app~~

- ~~Run command `yarn add @msafe/sui-wallet` to add MSafe wallet package to your project~~
- ~~Add below code to your application, basically it should be added to your `main.tsx` file~~

```typescript
import { MSafeWallet } from '@msafe/sui-wallet';
import { registerWallet } from '@mysten/wallet-standard';

registerWallet(new MSafeWallet('<your app name>'));
```

#### ~~Next Step~~

~~Once the development mentioned above is complete, MSafe team will assist in verifying the integration. Feedback will be provided to your team upon completion of the verification process.~~

</details>
