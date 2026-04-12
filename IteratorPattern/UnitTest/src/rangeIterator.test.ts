import { RangeIterator } from './rangeIterator';

describe('ange Iterator', () => {

  it('generates a forward range [0, 5)', () => {
    expect(new RangeIterator(0, 5).toArray()).toEqual([0, 1, 2, 3, 4]);
  });

  it('generates a range with a custom positive step', () => {
    expect(new RangeIterator(0, 10, 2).toArray()).toEqual([0, 2, 4, 6, 8]);
  });

  it('generates a reverse range with a negative step', () => {
    expect(new RangeIterator(5, 0, -1).toArray()).toEqual([5, 4, 3, 2, 1]);
  });

  it('returns an empty array when start equals end', () => {
    expect(new RangeIterator(3, 3).toArray()).toEqual([]);
  });

  it('returns an empty array when the range is inverted (no positive step)', () => {
    expect(new RangeIterator(5, 1).toArray()).toEqual([]);
  });

  it('next() returns done:true after the sequence is exhausted', () => {
    const it = new RangeIterator(0, 2);
    it.next(); it.next();
    expect(it.next().done).toBe(true);
  });

  it('hasNext() is true before exhaustion and false after', () => {
    const it = new RangeIterator(0, 2);
    expect(it.hasNext()).toBe(true);
    it.next(); it.next();
    expect(it.hasNext()).toBe(false);
  });

  it('works in a for...of loop', () => {
    const results: number[] = [];
    for (const n of new RangeIterator(1, 4)) results.push(n);
    expect(results).toEqual([1, 2, 3]);
  });

  it('works with Array.from()', () => {
    expect(Array.from(new RangeIterator(0, 3))).toEqual([0, 1, 2]);
  });

  it('works with spread operator', () => {
    expect([...new RangeIterator(0, 4)]).toEqual([0, 1, 2, 3]);
  });

  it('throws when step is zero', () => {
    expect(() => new RangeIterator(0, 5, 0)).toThrow('Step cannot be zero');
  });

  it('large step that skips past end returns correct subset', () => {
    expect(new RangeIterator(0, 10, 7).toArray()).toEqual([0, 7]);
  });

});
