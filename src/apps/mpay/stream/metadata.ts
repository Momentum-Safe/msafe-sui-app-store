import { bcs } from '@mysten/bcs';

import { InvalidInputError } from '../error/InvalidInputError';
import { StreamMetadata } from '../types/stream';

const MetadataBcs = bcs.struct('StreamMetadata', {
  groupId: bcs.string(),
  name: bcs.string(),
});

const MAX_NAME_SIZE = 64;

export function encodeMetadata(metadata: StreamMetadata) {
  validateMetadata(metadata);
  return MetadataBcs.serialize(metadata).toBase64();
}

export function decodeMetadata(metaStr: string) {
  const metadata = MetadataBcs.fromBase64(metaStr);
  validateMetadata(metadata);
  return metadata;
}

export function validateMetadata(metadata: StreamMetadata) {
  if (!isAsciiString(metadata.name)) {
    throw new InvalidInputError('Invalid metadata: Name contains unknown character');
  }
  if (!isAsciiString(metadata.groupId)) {
    throw new InvalidInputError('Invalid metadata: Group ID contains unknown character');
  }
  if (metadata.name.length > MAX_NAME_SIZE) {
    throw new InvalidInputError('Invalid metadata: Name exceed max length 64');
  }
}

function isAsciiString(str: string) {
  // eslint-disable-next-line no-control-regex
  const asciiPattern = /^[\x00-\x7F]+$/;
  return asciiPattern.test(str);
}
