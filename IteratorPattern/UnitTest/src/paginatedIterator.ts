export interface Page<T> {
  items:   T[];
  hasMore: boolean;
}

export interface DataSource<T> {
  fetchPage(page: number): Page<T>;
}

export class PaginatedIterator<T> implements Iterator<T>, Iterable<T> {
  private buffer:    T[]     = [];
  private pageIndex          = 0;
  private exhausted          = false;

  constructor(private source: DataSource<T>) {}

  private loadNextPage(): void {
    if (this.exhausted) return;
    const page = this.source.fetchPage(this.pageIndex++);
    this.buffer.push(...page.items);
    if (!page.hasMore) this.exhausted = true;
  }

  next(): IteratorResult<T> {
    if (this.buffer.length === 0 && !this.exhausted) this.loadNextPage();
    if (this.buffer.length === 0)
      return { value: undefined as unknown as T, done: true };
    return { value: this.buffer.shift()!, done: false };
  }

  hasNext(): boolean {
    return this.buffer.length > 0 || !this.exhausted;
  }

  [Symbol.iterator](): Iterator<T> { return this; }

  toArray(): T[] {
    const results: T[] = [];
    for (const item of this) results.push(item);
    return results;
  }
}
