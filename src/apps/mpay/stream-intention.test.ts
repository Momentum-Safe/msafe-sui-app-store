import { TransactionSubTypes, TransactionType } from '@msafe/sui3-utils';

import { CancelStreamIntention } from './cancel-stream';
import { ClaimByProxyStreamIntention } from './claim-by-proxy-stream';
import { ClaimStreamIntention } from './claim-stream';
import { CreateStreamIntention } from './create-stream';
import { SetAutoClaimStreamIntention } from './set-auto-claim-stream';

describe('Stream Payment', () => {
  it('Intention build', () => {
    const createIntention = new CreateStreamIntention({
      name: 'A',
      startTimeMs: 0n,
      cancelable: true,
      coinType: '',
      interval: 0n,
      steps: 0n,
      recipients: [],
    });
    expect(createIntention.application).toBe('mpay');
    expect(createIntention.txType).toBe(TransactionType.Stream);
    expect(createIntention.txSubType).toBe(TransactionSubTypes.stream.create);

    const claimIntention = new ClaimStreamIntention({ streamId: '' });
    expect(claimIntention.application).toBe('mpay');
    expect(claimIntention.txType).toBe(TransactionType.Stream);
    expect(claimIntention.txSubType).toBe(TransactionSubTypes.stream.claim);

    const claimByProxyIntention = new ClaimByProxyStreamIntention({ streamId: '' });
    expect(claimByProxyIntention.application).toBe('mpay');
    expect(claimByProxyIntention.txType).toBe(TransactionType.Stream);
    expect(claimByProxyIntention.txSubType).toBe(TransactionSubTypes.stream.claimByProxy);

    const autoAutoClaimIntention = new SetAutoClaimStreamIntention({ streamId: '', enabled: true });
    expect(autoAutoClaimIntention.application).toBe('mpay');
    expect(autoAutoClaimIntention.txType).toBe(TransactionType.Stream);
    expect(autoAutoClaimIntention.txSubType).toBe(TransactionSubTypes.stream.setAutoClaim);

    const cancelIntention = new CancelStreamIntention({ streamId: '' });
    expect(cancelIntention.application).toBe('mpay');
    expect(cancelIntention.txType).toBe(TransactionType.Stream);
    expect(cancelIntention.txSubType).toBe(TransactionSubTypes.stream.cancel);
  });
});
