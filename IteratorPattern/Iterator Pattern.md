1. # **Iterator Pattern**

   1. ## **Definition**

The Iterator Pattern provides a standard interface to traverse a collection without knowing its internal structure. The iterator object encapsulates the current position and traversal logic, so the client code simply calls next() until hasNext() returns false.

2. ## **Structure**

The Iterator Pattern consists of four main components:

- Iterator Interface: Declares next(): IteratorResult\<T\> and optionally hasNext(): boolean. TypeScript's built-in Iterator\<T\> is this interface.

- Concrete Iterator: Implements the Iterator interface for a specific collection. Tracks current position and advances on each next() call.

- Iterable Interface: Declares \[Symbol.iterator\](): Iterator\<T\>. Any class implementing this can be used in for...of loops.

- Concrete Collection (Iterable): Implements the Iterable interface and returns a Concrete Iterator. The collection does not expose its internal structure.

  3. ## **Applicability**

- When your collection has a complex data structure under the hood, but you want to hide its complexity from clients (either for convenience or security reasons).  
- Reduce duplication of the traversal code across your app.  
- Want your code to be able to traverse different data structures or when types of these structures are unknown beforehand.

  4. ## **Pros and cons**

| Prospects | Consequences |
| :---- | :---- |
| Single Responsibility Principle | Applying the pattern can be an overkill if your app only works with simple collections |
| Open/Closed Principle | Using an iterator may be less efficient than going through elements of some specialized collections directly. |
| Can iterate over the same collection in parallel because each iterator object contains its own iteration state |  |
| Can delay an iteration and continue it when needed |  |

# 

2. # **Ex1 \- Range Iterator** 

## **Describe**

A range utility generates integer sequences with configurable start, end, and step.

## **Source code: rangeIterator.ts**

export class RangeIterator implements Iterable\<number\>, Iterator\<number\> {  
  private current: number;

  constructor(  
    private start: number,  
    private end:   number,  
    private step:  number \= 1  
  ) {  
    if (step \=== 0) throw new Error('Step cannot be zero');  
    this.current \= start;  
  }

  next(): IteratorResult\<number\> {  
    const forward \= this.step \> 0;  
    const done    \= forward ? this.current \>= this.end : this.current \<= this.end;  
    if (done) return { value: undefined as unknown as number, done: true };  
    const value    \= this.current;  
    this.current  \+= this.step;  
    return { value, done: false };  
  }

  hasNext(): boolean {  
    return this.step \> 0 ? this.current \< this.end : this.current \> this.end;  
  }

  \[Symbol.iterator\](): Iterator\<number\> {  
    // Return a fresh iterator from the same params so for...of is reusable  
    return new RangeIterator(this.start, this.end, this.step);  
  }

  toArray(): number\[\] {  
    return \[...new RangeIterator(this.start, this.end, this.step)\];  
  }  
}

## **Source code: rangeIterator.test.ts**

import { RangeIterator } from './rangeIterator';

describe('ange Iterator', () \=\> {

  it('generates a forward range \[0, 5)', () \=\> {  
    expect(new RangeIterator(0, 5).toArray()).toEqual(\[0, 1, 2, 3, 4\]);  
  });

  it('generates a range with a custom positive step', () \=\> {  
    expect(new RangeIterator(0, 10, 2).toArray()).toEqual(\[0, 2, 4, 6, 8\]);  
  });

  it('generates a reverse range with a negative step', () \=\> {  
    expect(new RangeIterator(5, 0, \-1).toArray()).toEqual(\[5, 4, 3, 2, 1\]);  
  });

  it('returns an empty array when start equals end', () \=\> {  
    expect(new RangeIterator(3, 3).toArray()).toEqual(\[\]);  
  });

  it('returns an empty array when the range is inverted (no positive step)', () \=\> {  
    expect(new RangeIterator(5, 1).toArray()).toEqual(\[\]);  
  });

  it('next() returns done:true after the sequence is exhausted', () \=\> {  
    const it \= new RangeIterator(0, 2);  
    it.next(); it.next();  
    expect(it.next().done).toBe(true);  
  });

  it('hasNext() is true before exhaustion and false after', () \=\> {  
    const it \= new RangeIterator(0, 2);  
    expect(it.hasNext()).toBe(true);  
    it.next(); it.next();  
    expect(it.hasNext()).toBe(false);  
  });

  it('works in a for...of loop', () \=\> {  
    const results: number\[\] \= \[\];  
    for (const n of new RangeIterator(1, 4)) results.push(n);  
    expect(results).toEqual(\[1, 2, 3\]);  
  });

  it('works with Array.from()', () \=\> {  
    expect(Array.from(new RangeIterator(0, 3))).toEqual(\[0, 1, 2\]);  
  });

  it('works with spread operator', () \=\> {  
    expect(\[...new RangeIterator(0, 4)\]).toEqual(\[0, 1, 2, 3\]);  
  });

  it('throws when step is zero', () \=\> {  
    expect(() \=\> new RangeIterator(0, 5, 0)).toThrow('Step cannot be zero');  
  });

  it('large step that skips past end returns correct subset', () \=\> {  
    expect(new RangeIterator(0, 10, 7).toArray()).toEqual(\[0, 7\]);  
  });

});

3. # **Ex2 \- Tree**

## **Describe**

A tree data structure needs to be traversed in depth-first order. The TreeIterator hides the recursive traversal logic behind a flat, sequential interface. Client code iterates over nodes with a simple next() loop, completely unaware that the underlying structure is a tree.

## **Source code: treeItarator.ts**

export interface TreeNode\<T\> {  
  value:    T;  
  children: TreeNode\<T\>\[\];  
}

// Depth-First pre-order Iterator using an explicit stack  
export class TreeIterator\<T\> implements Iterator\<T\>, Iterable\<T\> {  
  private stack: TreeNode\<T\>\[\];

  constructor(root: TreeNode\<T\> | null) {  
    this.stack \= root ? \[root\] : \[\];  
  }

  next(): IteratorResult\<T\> {  
    if (this.stack.length \=== 0)  
      return { value: undefined as unknown as T, done: true };

    const node \= this.stack.pop()\!;  
    // Push children in reverse so leftmost child is processed first  
    for (let i \= node.children.length \- 1; i \>= 0; i\--)  
      this.stack.push(node.children\[i\]);

    return { value: node.value, done: false };  
  }

  hasNext(): boolean { return this.stack.length \> 0; }

  \[Symbol.iterator\](): Iterator\<T\> { return this; }

  toArray(): T\[\] { return \[...this\]; }  
}

// Convenience factory for building tree nodes concisely in tests  
export function node\<T\>(value: T, ...children: TreeNode\<T\>\[\]): TreeNode\<T\> {  
  return { value, children };  
}

## **Source code: treeItarator.test.ts**

import { TreeIterator, node } from './treeIterator';

describe('Tree Depth-First Iterator', () \=\> {

  it('single-node tree yields the root value then done', () \=\> {  
    const it \= new TreeIterator(node(1));  
    expect(it.next()).toEqual({ value: 1, done: false });  
    expect(it.next().done).toBe(true);  
  });

  it('null root produces an immediately done iterator', () \=\> {  
    expect(new TreeIterator(null).toArray()).toEqual(\[\]);  
  });

  it('traverses a two-level tree in depth-first pre-order', () \=\> {  
    //     1  
    //    / \\  
    //   2   3  
    const tree \= node(1, node(2), node(3));  
    expect(new TreeIterator(tree).toArray()).toEqual(\[1, 2, 3\]);  
  });

  it('traverses a three-level tree in depth-first pre-order', () \=\> {  
    //       1  
    //      / \\  
    //     2   3  
    //    / \\  
    //   4   5  
    const tree \= node(1, node(2, node(4), node(5)), node(3));  
    expect(new TreeIterator(tree).toArray()).toEqual(\[1, 2, 4, 5, 3\]);  
  });

  it('single-level wide tree yields root then all children in order', () \=\> {  
    const tree \= node('root', node('A'), node('B'), node('C'));  
    expect(new TreeIterator(tree).toArray()).toEqual(\['root', 'A', 'B', 'C'\]);  
  });

  it('deeply nested linear chain is traversed top-to-bottom', () \=\> {  
    const tree \= node(1, node(2, node(3, node(4))));  
    expect(new TreeIterator(tree).toArray()).toEqual(\[1, 2, 3, 4\]);  
  });

  it('hasNext() is false after full traversal', () \=\> {  
    const it \= new TreeIterator(node(42));  
    it.next();  
    expect(it.hasNext()).toBe(false);  
  });

  it('works in a for...of loop', () \=\> {  
    const results: number\[\] \= \[\];  
    for (const v of new TreeIterator(node(1, node(2), node(3)))) results.push(v);  
    expect(results).toEqual(\[1, 2, 3\]);  
  });

  it('two separate iterators on the same tree have independent state', () \=\> {  
    const tree \= node(1, node(2), node(3));  
    const it1  \= new TreeIterator(tree);  
    const it2  \= new TreeIterator(tree);  
    it1.next(); // advance it1 past root  
    expect(it2.next().value).toBe(1); // it2 still at root  
  });

  it('generic iterator works with string values', () \=\> {  
    const tree \= node('a', node('b'), node('c'));  
    expect(new TreeIterator(tree).toArray()).toEqual(\['a', 'b', 'c'\]);  
  });

});

4. # **Ex3 \- Paginated API**

## **Describe**

A REST API returns data in pages. A PaginatedIterator fetches the next page on demand, presenting all items as a flat sequence to the consumer. The underlying pagination logic (page number, hasMore flag) is completely hidden from the client. A mock DataSource makes the iterator fully testable without real network calls.

## **Source code: paginatedIterator.ts**

export interface Page\<T\> {  
  items:   T\[\];  
  hasMore: boolean;  
}

export interface DataSource\<T\> {  
  fetchPage(page: number): Page\<T\>;  
}

export class PaginatedIterator\<T\> implements Iterator\<T\>, Iterable\<T\> {  
  private buffer:    T\[\]     \= \[\];  
  private pageIndex          \= 0;  
  private exhausted          \= false;

  constructor(private source: DataSource\<T\>) {}

  private loadNextPage(): void {  
    if (this.exhausted) return;  
    const page \= this.source.fetchPage(this.pageIndex\++);  
    this.buffer.push(...page.items);  
    if (\!page.hasMore) this.exhausted \= true;  
  }

  next(): IteratorResult\<T\> {  
    if (this.buffer.length \=== 0 && \!this.exhausted) this.loadNextPage();  
    if (this.buffer.length \=== 0)  
      return { value: undefined as unknown as T, done: true };  
    return { value: this.buffer.shift()\!, done: false };  
  }

  hasNext(): boolean {  
    return this.buffer.length \> 0 || \!this.exhausted;  
  }

  \[Symbol.iterator\](): Iterator\<T\> { return this; }

  toArray(): T\[\] {  
    const results: T\[\] \= \[\];  
    for (const item of this) results.push(item);  
    return results;  
  }  
}

## **Source code: paginatedIterator.test.ts**

import { PaginatedIterator, DataSource } from './paginatedIterator';

describe('Paginated API Iterator', () \=\> {

  // Builds a mock DataSource from a 2D array of pages  
  function makeSource\<T\>(pages: T\[\]\[\]): DataSource\<T\> {  
    return {  
      fetchPage: jest.fn().mockImplementation((index: number) \=\> ({  
        items:   pages\[index\] ?? \[\],  
        hasMore: index \< pages.length \- 1,  
      })),  
    };  
  }

  it('iterates all items from a single-page source', () \=\> {  
    expect(new PaginatedIterator(makeSource(\[\[1, 2, 3\]\])).toArray())  
      .toEqual(\[1, 2, 3\]);  
  });

  it('iterates items across multiple pages in correct order', () \=\> {  
    expect(new PaginatedIterator(makeSource(\[\[1, 2\], \[3, 4\], \[5\]\])).toArray())  
      .toEqual(\[1, 2, 3, 4, 5\]);  
  });

  it('empty first page returns an empty array', () \=\> {  
    expect(new PaginatedIterator(makeSource(\[\[\]\])).toArray()).toEqual(\[\]);  
  });

  it('fetchPage is called lazily – only when the buffer runs out', () \=\> {  
    const source \= makeSource(\[\[1, 2\], \[3\]\]);  
    const it     \= new PaginatedIterator(source);  
    it.next(); // consumes 1 from page 0  
    it.next(); // consumes 2 from page 0 – still page 0  
    expect((source.fetchPage as jest.Mock)).toHaveBeenCalledTimes(1);  
    it.next(); // buffer empty – fetches page 1  
    expect((source.fetchPage as jest.Mock)).toHaveBeenCalledTimes(2);  
  });

  it('fetchPage is called exactly once per page regardless of item count', () \=\> {  
    const source \= makeSource(\[\[1, 2, 3\]\]);  
    new PaginatedIterator(source).toArray();  
    expect((source.fetchPage as jest.Mock)).toHaveBeenCalledTimes(1);  
  });

  it('hasNext() is false after all pages are consumed', () \=\> {  
    const it \= new PaginatedIterator(makeSource(\[\[1\]\]));  
    it.next();  
    expect(it.hasNext()).toBe(false);  
  });

  it('hasNext() is true while items remain in the buffer', () \=\> {  
    const it \= new PaginatedIterator(makeSource(\[\[1, 2\]\]));  
    it.next(); // 1 consumed, 2 in buffer  
    expect(it.hasNext()).toBe(true);  
  });

  it('works with a for...of loop', () \=\> {  
    const results: number\[\] \= \[\];  
    for (const item of new PaginatedIterator(makeSource(\[\[10, 20\], \[30\]\])))  
      results.push(item);  
    expect(results).toEqual(\[10, 20, 30\]);  
  });

  it('single-item pages are fetched correctly one by one', () \=\> {  
    const source \= makeSource(\[\[1\], \[2\], \[3\]\]);  
    expect(new PaginatedIterator(source).toArray()).toEqual(\[1, 2, 3\]);  
    expect((source.fetchPage as jest.Mock)).toHaveBeenCalledTimes(3);  
  });

});

