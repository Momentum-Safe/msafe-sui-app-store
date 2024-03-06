import { Buffer } from 'buffer';

import { nanoid } from 'nanoid';

if (typeof window !== 'undefined') {
  window.global = window.global ?? window;
  window.Buffer = window.Buffer ?? Buffer;
}

export function generateGroupId() {
  return nanoid();
}
