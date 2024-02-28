// eslint-disable-next-line no-bitwise
import { DateTime, Duration } from 'luxon';

// eslint-disable-next-line no-bitwise
export const MAX_U64 = (1n << 64n) - 1n;

export const TIME_ROUND_UNIT = 1000;

// roundTime round date to seconds
export function roundDateTime(date: DateTime | number | bigint) {
  let dateMs: number;
  if (typeof date === 'number') {
    dateMs = date;
  } else if (typeof date === 'bigint') {
    dateMs = Number(date);
  } else {
    dateMs = date.toMillis();
  }
  const roundMs = Math.round(dateMs / TIME_ROUND_UNIT);
  return DateTime.fromMillis(roundMs * TIME_ROUND_UNIT);
}

export function roundDuration(duration: Duration | number | bigint) {
  let durationMs: number;
  if (typeof duration === 'number') {
    durationMs = duration;
  } else if (typeof duration === 'bigint') {
    durationMs = Number(duration);
  } else {
    durationMs = duration.toMillis();
  }
  const roundMs = Math.round(durationMs / TIME_ROUND_UNIT);
  return Duration.fromMillis(roundMs * TIME_ROUND_UNIT);
}
