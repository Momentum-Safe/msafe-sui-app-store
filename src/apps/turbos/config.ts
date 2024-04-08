import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export const config = {
  PackageId: '0x9632f61a796fc54952d9151d80b319e066cba5498a27b495c99e113db09726b1',
};

export const prixConfig = {
  PackageId: '0x02fe4933f4521250e55a15441096d1d4a38a7311195b0bca126fc0138c1f5a97',
  Claim: '0x0c822cec42f7ca703696b4232f1c47b348330c23580172a29aab465bc071d894',
  turbosCoinType: '0x5d1f47ea69bb0de31c313d7acf89b890dbb8991ea8e03c6c355171f84bb1ba4a::turbos::TURBOS',
  startTime: dayjs.utc('2023-09-26T12:00:00Z').unix(),
  turbos_usdc: '0x51ee9f5e33c1d7b38b197a09acb17ef0027e83e6d0b3c0f6466855398e4c1cba',
  turbos_sui: '0x2c6fc12bf0d093b5391e7c0fed7e044d52bc14eb29f6352a3fb358e33e80729e',
  dayTimestamp: 1 * 60 * 60 * 24 * 7,
  claimLongTimestamp: 1 * 60 * 60 * 24,
};
