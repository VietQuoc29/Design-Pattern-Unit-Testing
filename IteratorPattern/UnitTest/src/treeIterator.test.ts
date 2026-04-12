import { TreeIterator, node } from './treeIterator';

describe('Tree Depth-First Iterator', () => {

  it('single-node tree yields the root value then done', () => {
    const it = new TreeIterator(node(1));
    expect(it.next()).toEqual({ value: 1, done: false });
    expect(it.next().done).toBe(true);
  });

  it('null root produces an immediately done iterator', () => {
    expect(new TreeIterator(null).toArray()).toEqual([]);
  });

  it('traverses a two-level tree in depth-first pre-order', () => {
    //     1
    //    / \
    //   2   3
    const tree = node(1, node(2), node(3));
    expect(new TreeIterator(tree).toArray()).toEqual([1, 2, 3]);
  });

  it('traverses a three-level tree in depth-first pre-order', () => {
    //       1
    //      / \
    //     2   3
    //    / \
    //   4   5
    const tree = node(1, node(2, node(4), node(5)), node(3));
    expect(new TreeIterator(tree).toArray()).toEqual([1, 2, 4, 5, 3]);
  });

  it('single-level wide tree yields root then all children in order', () => {
    const tree = node('root', node('A'), node('B'), node('C'));
    expect(new TreeIterator(tree).toArray()).toEqual(['root', 'A', 'B', 'C']);
  });

  it('deeply nested linear chain is traversed top-to-bottom', () => {
    const tree = node(1, node(2, node(3, node(4))));
    expect(new TreeIterator(tree).toArray()).toEqual([1, 2, 3, 4]);
  });

  it('hasNext() is false after full traversal', () => {
    const it = new TreeIterator(node(42));
    it.next();
    expect(it.hasNext()).toBe(false);
  });

  it('works in a for...of loop', () => {
    const results: number[] = [];
    for (const v of new TreeIterator(node(1, node(2), node(3)))) results.push(v);
    expect(results).toEqual([1, 2, 3]);
  });

  it('two separate iterators on the same tree have independent state', () => {
    const tree = node(1, node(2), node(3));
    const it1  = new TreeIterator(tree);
    const it2  = new TreeIterator(tree);
    it1.next(); // advance it1 past root
    expect(it2.next().value).toBe(1); // it2 still at root
  });

  it('generic iterator works with string values', () => {
    const tree = node('a', node('b'), node('c'));
    expect(new TreeIterator(tree).toArray()).toEqual(['a', 'b', 'c']);
  });

});
