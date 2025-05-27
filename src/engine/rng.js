export function createRng(seed = 123456789n) {
  let state = BigInt.asUintN(64, BigInt(seed));

  function next64() {
    state ^= state >> 12n;
    state ^= state << 25n;
    state ^= state >> 27n;
    state = BigInt.asUintN(64, state * 2685821657736338717n);
    return state;
  }

  return {
    nextInt() {
      next64();
      return Number(state & 0xffffffffn);
    },
    nextFloat() {
      return this.nextInt() / 0x100000000;
    }
  };
}
