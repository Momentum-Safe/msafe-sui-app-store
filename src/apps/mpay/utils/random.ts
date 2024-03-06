import crypto from 'crypto';

export function generateGroupId() {
  return crypto.randomUUID();
}
