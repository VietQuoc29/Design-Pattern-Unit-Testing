export interface TreeNode<T> {
  value:    T;
  children: TreeNode<T>[];
}

// Depth-First pre-order Iterator using an explicit stack
export class TreeIterator<T> implements Iterator<T>, Iterable<T> {
  private stack: TreeNode<T>[];

  constructor(root: TreeNode<T> | null) {
    this.stack = root ? [root] : [];
  }

  next(): IteratorResult<T> {
    if (this.stack.length === 0)
      return { value: undefined as unknown as T, done: true };

    const node = this.stack.pop()!;
    // Push children in reverse so leftmost child is processed first
    for (let i = node.children.length - 1; i >= 0; i--)
      this.stack.push(node.children[i]);

    return { value: node.value, done: false };
  }

  hasNext(): boolean { return this.stack.length > 0; }

  [Symbol.iterator](): Iterator<T> { return this; }

  toArray(): T[] { return [...this]; }
}

// Convenience factory for building tree nodes concisely in tests
export function node<T>(value: T, ...children: TreeNode<T>[]): TreeNode<T> {
  return { value, children };
}
