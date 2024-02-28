import axios, { AxiosError, AxiosResponse } from 'axios';

import { BackendError } from '../error/BackendError';
import {
  IBackend,
  BackendIncomingStreamFilterOptions,
  StreamRef,
  BackendOutgoingStreamFilterOptions,
  StreamFilterStatus,
} from '../types/backend';
import { StreamEvent } from '../types/events';
import { PaginationOptions, Paginated } from '../types/pagination';

export class Backend implements IBackend {
  constructor(private apiURL: string) {}

  private static parseResponseData(response: AxiosError | AxiosResponse) {
    if (response instanceof AxiosError) {
      throw new BackendError(response.response?.statusText as string);
    }
    if (response.status === 200) {
      if (response.data.success) {
        return response.data.data;
      }
      throw new BackendError(response.data.code);
    }
    throw new BackendError(response.status.toString());
  }

  async getIncomingStreams(recipient: string, options?: BackendIncomingStreamFilterOptions): Promise<StreamRef[]> {
    const res = await axios.post(`${this.apiURL}/stream`, {
      recipient,
      ...options,
    });
    return Backend.parseResponseData(res) as StreamRef[];
  }

  async getOutgoingStreams(sender: string, options?: BackendOutgoingStreamFilterOptions): Promise<StreamRef[]> {
    const res = await axios.post(`${this.apiURL}/stream`, {
      sender,
      ...options,
    });
    return Backend.parseResponseData(res);
  }

  async getStreamHistory(query: {
    streamId?: string;
    groupId?: string;
    pagination?: PaginationOptions;
  }): Promise<Paginated<StreamEvent>> {
    const res = await axios.post(`${this.apiURL}/stream-events`, query);
    const paginatedData = Backend.parseResponseData(res);
    paginatedData.data.forEach((event: StreamEvent) => {
      const formalizedEvent = event;
      if (formalizedEvent.data.type === 'create_stream') {
        formalizedEvent.data.balance = BigInt(formalizedEvent.data.balance);
      } else if (formalizedEvent.data.type === 'cancel_stream') {
        formalizedEvent.data.withdrawAmount = BigInt(formalizedEvent.data.withdrawAmount);
      } else if (formalizedEvent.data.type === 'claim' || formalizedEvent.data.type === 'auto_claim') {
        formalizedEvent.data.claimAmount = BigInt(formalizedEvent.data.claimAmount);
      } else if (formalizedEvent.data.type === 'set_auto_claim') {
        formalizedEvent.data.enabled = !!formalizedEvent.data.enabled;
      }
      formalizedEvent.createdAt = new Date(formalizedEvent.createdAt);
      return formalizedEvent;
    });

    return paginatedData;
  }

  async getAllCoinTypes(address: string): Promise<string[]> {
    const res = await axios.post(`${this.apiURL}/stream-info`, { address });
    return Backend.parseResponseData(res);
  }

  async getAllRecipients(sender: string, options?: StreamFilterStatus): Promise<string[]> {
    const res = await axios.post(`${this.apiURL}/stream-info`, { sender, status: options });
    return Backend.parseResponseData(res);
  }

  async getAllSenders(recipient: string, options?: StreamFilterStatus): Promise<string[]> {
    const res = await axios.post(`${this.apiURL}/stream-info`, { recipient, status: options });
    return Backend.parseResponseData(res);
  }
}
