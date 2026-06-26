import { Stream } from './Stream';
import { MpayObjectResponse } from '../utils/rpc';

const STREAM_ID = '0xb8ac1c7149855bbcea0922e59e19272f24e0eb7d9a42a988a857464435c93d99';
const STREAM_TYPE =
  '0xc357c3985e8fb875d6b37141497af660779aa1bab0ec489b2213efd74067d1fa::stream::Stream<0x622345b3f80ea5947567760eec7b9639d0582adcfd6ab9fccb85437aeda7c0d0::scallop_wal::SCALLOP_WAL>';

const sharedConfig = {
  amount_per_epoch: '2000',
  cancelable: true,
  cliff: '0',
  creator: '0xa9743028e574b7abe4f0af88b08eb5a700a34ea3b1adc667d8d67dcdfa2b5233',
  epoch_interval: '1080000',
  metadata: 'FTVQRHh2c2h6NGZnNS1ucV9qTVJfUwQwNjI2',
  recipient: '0xa9743028e574b7abe4f0af88b08eb5a700a34ea3b1adc667d8d67dcdfa2b5233',
  time_start: '1782437102960',
  total_epoch: '100',
};

const sharedStatus = {
  epoch_canceled: '18446744073709551615',
  epoch_claimed: '18446744073709551615',
  status: 0,
};

function buildResponse(fields: Record<string, unknown>): MpayObjectResponse {
  return {
    data: {
      objectId: STREAM_ID,
      type: STREAM_TYPE,
      content: {
        dataType: 'moveObject',
        type: STREAM_TYPE,
        fields,
      },
    },
  };
}

describe('Stream.parseRawStreamData', () => {
  it('parses gRPC flat JSON', () => {
    const raw = Stream.parseRawStreamData(
      STREAM_ID,
      buildResponse({
        auto_claim: false,
        balance: {
          balance: '200000',
          id: '0xc7e26900deb367f759b22d4b2517e2fbaa6980b1f4ab1ab894e389394ccc7c91',
        },
        config: sharedConfig,
        status: sharedStatus,
      }),
    );

    expect(raw.balance).toBe(200000n);
    expect(raw.config.totalEpoch).toBe(100n);
    expect(raw.status.status).toBe(0);
  });

  it('parses legacy JSON-RPC nested fields', () => {
    const raw = Stream.parseRawStreamData(
      STREAM_ID,
      buildResponse({
        auto_claim: false,
        balance: {
          type: '0x2::coin::Coin<0x622345b3f80ea5947567760eec7b9639d0582adcfd6ab9fccb85437aeda7c0d0::scallop_wal::SCALLOP_WAL>',
          fields: {
            balance: '200000',
            id: { id: '0xc7e26900deb367f759b22d4b2517e2fbaa6980b1f4ab1ab894e389394ccc7c91' },
          },
        },
        config: {
          type: '0xc357c3985e8fb875d6b37141497af660779aa1bab0ec489b2213efd74067d1fa::stream::StreamConfig',
          fields: sharedConfig,
        },
        status: {
          type: '0xc357c3985e8fb875d6b37141497af660779aa1bab0ec489b2213efd74067d1fa::stream::StreamStatus',
          fields: sharedStatus,
        },
      }),
    );

    expect(raw.balance).toBe(200000n);
    expect(raw.config.recipient).toBe(sharedConfig.recipient);
  });

  it('throws RpcError when balance field is missing', () => {
    expect(() =>
      Stream.parseRawStreamData(
        STREAM_ID,
        buildResponse({
          auto_claim: false,
          config: sharedConfig,
          status: sharedStatus,
        }),
      ),
    ).toThrow('Stream object missing balance field');
  });
});
