import { MPayError, MPayErrorCode } from './base';

export class WalletNotConnectedError extends MPayError {
  constructor() {
    super(MPayErrorCode.walletNotConnected, 'Wallet not connected');
  }
}
