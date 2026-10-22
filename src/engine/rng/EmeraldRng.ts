/** Reference: pokeemerald/src/random.c and include/random.h (ISO_RANDOMIZE1). */
export class EmeraldRng {
  private value: number;
  constructor(seed: number) { this.value = seed & 0xffff; }
  nextU16(): number {
    this.value = (Math.imul(1103515245, this.value) + 24691) >>> 0;
    return this.value >>> 16;
  }
  snapshot(): number { return this.value; }
}
