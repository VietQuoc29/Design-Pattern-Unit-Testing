import { Sorter, BubbleSortStrategy, QuickSortStrategy, SortStrategy } from './sorter';

describe('Sorting System', () => {

  const unsorted = [5, 3, 8, 1, 9, 2];
  const expected = [1, 2, 3, 5, 8, 9];

  it('sắp xếp tăng dần bằng Bubble Sort', () => {
    const sorter = new Sorter(new BubbleSortStrategy());
    expect(sorter.sort(unsorted)).toEqual(expected);
  });

  it('sắp xếp tăng dần bằng Quick Sort', () => {
    const sorter = new Sorter(new QuickSortStrategy());
    expect(sorter.sort(unsorted)).toEqual(expected);
  });

  it('mảng rỗng trả về mảng rỗng', () => {
    const sorter = new Sorter(new QuickSortStrategy());
    expect(sorter.sort([])).toEqual([]);
  });

  it('mảng 1 phần tử không thay đổi', () => {
    const sorter = new Sorter(new BubbleSortStrategy());
    expect(sorter.sort([42])).toEqual([42]);
  });

  it('đổi strategy từ Bubble sang Quick giữa chừng', () => {
    const sorter = new Sorter(new BubbleSortStrategy());
    sorter.setStrategy(new QuickSortStrategy());
    expect(sorter.sort([3, 1, 2])).toEqual([1, 2, 3]);
  });

  it('mock strategy – xác nhận input được truyền đúng', () => {
    const mockStrategy: SortStrategy = {
      sort: jest.fn().mockReturnValue([1, 2, 3]),
    };
    const sorter = new Sorter(mockStrategy);
    sorter.sort([3, 1, 2]);
    expect(mockStrategy.sort).toHaveBeenCalledWith([3, 1, 2]);
  });

});
