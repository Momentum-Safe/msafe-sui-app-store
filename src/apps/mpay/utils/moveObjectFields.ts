import { RpcError } from '../error/RpcError';

// Legacy JSON-RPC nests struct fields under { fields: ... }; gRPC JSON is flat.
export function unwrapMoveFields(value: unknown): Record<string, unknown> {
  if (value == null) {
    throw new RpcError('Missing move object field');
  }

  if (typeof value === 'object' && 'fields' in value) {
    const nested = (value as { fields?: unknown }).fields;
    if (nested && typeof nested === 'object') {
      return nested as Record<string, unknown>;
    }
  }

  if (typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  throw new RpcError('Unexpected move object field shape', { value: String(value) });
}

// Some responses wrap the whole move object under a top-level `fields` key.
export function normalizeMoveObjectJson(json: Record<string, unknown>): Record<string, unknown> {
  if (
    json.fields &&
    typeof json.fields === 'object' &&
    !('balance' in json) &&
    !('config' in json) &&
    !('status' in json)
  ) {
    return json.fields as Record<string, unknown>;
  }
  return json;
}

export function readCoinOrBalanceAmount(value: unknown, fieldName = 'balance'): bigint {
  if (value == null) {
    throw new RpcError(`Stream object missing ${fieldName} field`);
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
    return BigInt(value);
  }

  const fields = unwrapMoveFields(value);
  const amount = fields.balance ?? fields.value;
  if (amount == null) {
    throw new RpcError(`Stream object ${fieldName} field has unexpected shape`, {
      value: JSON.stringify(value),
    });
  }

  return BigInt(String(amount));
}
