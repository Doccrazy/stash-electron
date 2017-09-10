// v8 has an optimization for storing 31-bit signed numbers.
// Values which have either 00 or 11 as the high order bits qualify.
// This function drops the highest order bit in a signed number, maintaining
// the sign bit.
function smi(i32: number) {
  return ((i32 >>> 1) & 0x40000000) | (i32 & 0xBFFFFFFF);
}

// http://jsperf.com/hashing-strings
export function hashString(str: string) {
  // This is the hash from JVM
  // The hash code for a string is computed as
  // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
  // where s[i] is the ith character of the string and n is the length of
  // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
  // (exclusive) by dropping high bits.
  let hash = 0;
  for (let ii = 0; ii < str.length; ii++) {
    hash = 31 * hash + str.charCodeAt(ii) | 0;
  }
  return smi(hash);
}
