// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { RequestManager, HTTPTransport, Client } from '@open-rpc/client-js';

import { WebsocketClient, WebsocketClientOptions } from './rpc-websocket-client';

/**
 * An object defining headers to be passed to the RPC server
 */
export type HttpHeaders = { [header: string]: string };

interface SuiHTTPTransportOptions {
  url: string;
  rpc?: {
    headers?: HttpHeaders;
    url?: string;
  };
  websocket?: WebsocketClientOptions & {
    url?: string;
  };
}

export interface SuiTransportRequestOptions {
  method: string;
  params: unknown[];
}

// eslint-disable-next-line @typescript-eslint/ban-types

export interface SuiTransportSubscribeOptions<T> {
  method: string;
  unsubscribe: string;
  params: unknown[];
  onMessage: (event: T) => void;
}

export interface SuiTransport {
  request<T = unknown>(input: SuiTransportRequestOptions): Promise<T>;
  subscribe<T = unknown>(input: SuiTransportSubscribeOptions<T>): Promise<() => Promise<boolean>>;
}

export class MSafeHTTPTransport implements SuiTransport {
  private rpcClient: Client;

  private websocketClient: WebsocketClient;

  constructor({
    url,
    websocket: { url: websocketUrl, ...websocketOptions } = {} as WebsocketClientOptions,
    rpc,
  }: SuiHTTPTransportOptions) {
    const transport = new HTTPTransport(rpc?.url ?? url, {
      headers: {
        'Content-Type': 'application/json',
        ...rpc?.headers,
      },
    });

    this.rpcClient = new Client(new RequestManager([transport]));
    this.websocketClient = new WebsocketClient(websocketUrl ?? url, websocketOptions);
  }

  async request<T>(input: SuiTransportRequestOptions): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/return-await
    return await this.rpcClient.request(input);
  }

  async subscribe<T>(input: SuiTransportSubscribeOptions<T>): Promise<() => Promise<boolean>> {
    const unsubscribe = await this.websocketClient.subscribe(input);

    return async () => !!(await unsubscribe());
  }
}
