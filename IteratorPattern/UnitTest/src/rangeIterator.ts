export class RangeIterator implements Iterable<number>, Iterator<number> {
  private current: number;

  constructor(
    private start: number,
    private end:   number,
    private step:  number = 1
  ) {
    if (step === 0) throw new Error('Step cannot be zero');
    this.current = start;
  }

  next(): IteratorResult<number> {
    const forward = this.step > 0;
    const done    = forward ? this.current >= this.end : this.current <= this.end;
    if (done) return { value: undefined as unknown as number, done: true };
    const value    = this.current;
    this.current  += this.step;
    return { value, done: false };
  }

  hasNext(): boolean {
    return this.step > 0 ? this.current < this.end : this.current > this.end;
  }

  [Symbol.iterator](): Iterator<number> {
    // Return a fresh iterator from the same params so for...of is reusable
    return new RangeIterator(this.start, this.end, this.step);
  }

  toArray(): number[] {
    return [...new RangeIterator(this.start, this.end, this.step)];
  }
}
