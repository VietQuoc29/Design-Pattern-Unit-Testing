import { PaginatedIterator, DataSource } from './paginatedIterator';

describe('Paginated API Iterator', () => {

  // Builds a mock DataSource from a 2D array of pages
  function makeSource<T>(pages: T[][]): DataSource<T> {
    return {
      fetchPage: jest.fn().mockImplementation((index: number) => ({
        items:   pages[index] ?? [],
        hasMore: index < pages.length - 1,
      })),
    };
  }

  it('iterates all items from a single-page source', () => {
    expect(new PaginatedIterator(makeSource([[1, 2, 3]])).toArray())
      .toEqual([1, 2, 3]);
  });

  it('iterates items across multiple pages in correct order', () => {
    expect(new PaginatedIterator(makeSource([[1, 2], [3, 4], [5]])).toArray())
      .toEqual([1, 2, 3, 4, 5]);
  });

  it('empty first page returns an empty array', () => {
    expect(new PaginatedIterator(makeSource([[]])).toArray()).toEqual([]);
  });

  it('fetchPage is called lazily – only when the buffer runs out', () => {
    const source = makeSource([[1, 2], [3]]);
    const it     = new PaginatedIterator(source);
    it.next(); // consumes 1 from page 0
    it.next(); // consumes 2 from page 0 – still page 0
    expect((source.fetchPage as jest.Mock)).toHaveBeenCalledTimes(1);
    it.next(); // buffer empty – fetches page 1
    expect((source.fetchPage as jest.Mock)).toHaveBeenCalledTimes(2);
  });

  it('fetchPage is called exactly once per page regardless of item count', () => {
    const source = makeSource([[1, 2, 3]]);
    new PaginatedIterator(source).toArray();
    expect((source.fetchPage as jest.Mock)).toHaveBeenCalledTimes(1);
  });

  it('hasNext() is false after all pages are consumed', () => {
    const it = new PaginatedIterator(makeSource([[1]]));
    it.next();
    expect(it.hasNext()).toBe(false);
  });

  it('hasNext() is true while items remain in the buffer', () => {
    const it = new PaginatedIterator(makeSource([[1, 2]]));
    it.next(); // 1 consumed, 2 in buffer
    expect(it.hasNext()).toBe(true);
  });

  it('works with a for...of loop', () => {
    const results: number[] = [];
    for (const item of new PaginatedIterator(makeSource([[10, 20], [30]])))
      results.push(item);
    expect(results).toEqual([10, 20, 30]);
  });

  it('single-item pages are fetched correctly one by one', () => {
    const source = makeSource([[1], [2], [3]]);
    expect(new PaginatedIterator(source).toArray()).toEqual([1, 2, 3]);
    expect((source.fetchPage as jest.Mock)).toHaveBeenCalledTimes(3);
  });

});
