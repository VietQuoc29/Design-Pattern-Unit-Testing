import { Sorter, BubbleSortStrategy, QuickSortStrategy, SortStrategy } from './sorter';

describe('Sorting System', () => {

  const unsorted = [5, 3, 8, 1, 9, 2];
  const expected = [1, 2, 3, 5, 8, 9];

  it('sorts an array in ascending order using Bubble Sort', () => {
    const sorter = new Sorter(new BubbleSortStrategy());
    expect(sorter.sort(unsorted)).toEqual(expected);
  });

  it('sorts an array in ascending order using Quick Sort', () => {
    const sorter = new Sorter(new QuickSortStrategy());
    expect(sorter.sort(unsorted)).toEqual(expected);
  });

  it('returns an empty array when given an empty array', () => {
    const sorter = new Sorter(new QuickSortStrategy());
    expect(sorter.sort([])).toEqual([]);
  });

  it('does not change the array when it contains only one element', () => {
    const sorter = new Sorter(new BubbleSortStrategy());
    expect(sorter.sort([42])).toEqual([42]);
  });

  it('switches strategy from Bubble to Quick at runtime', () => {
    const sorter = new Sorter(new BubbleSortStrategy());
    sorter.setStrategy(new QuickSortStrategy());
    expect(sorter.sort([3, 1, 2])).toEqual([1, 2, 3]);
  });

  it('mock strategy – checks call count and arguments', () => {
    const mockStrategy: SortStrategy = {
      sort: jest.fn().mockReturnValue([1, 2, 3]),
    };
    const sorter = new Sorter(mockStrategy);
    sorter.sort([3, 1, 2]);
    expect(mockStrategy.sort).toHaveBeenCalledWith([3, 1, 2]);
  });

});
