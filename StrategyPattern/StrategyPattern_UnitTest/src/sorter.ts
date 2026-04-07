export interface SortStrategy {
  sort(data: number[]): number[];
}

export class BubbleSortStrategy implements SortStrategy {
  sort(data: number[]): number[] {
    const arr = [...data];
    for (let i = 0; i < arr.length; i++)
      for (let j = 0; j < arr.length - i - 1; j++)
        if (arr[j] > arr[j + 1])
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    return arr;
  }
}

export class QuickSortStrategy implements SortStrategy {
  sort(data: number[]): number[] {
    if (data.length <= 1) return data;
    const pivot = data[Math.floor(data.length / 2)];
    const left  = data.filter(x => x < pivot);
    const mid   = data.filter(x => x === pivot);
    const right = data.filter(x => x > pivot);
    return [...this.sort(left), ...mid, ...this.sort(right)];
  }
}

export class Sorter {
  constructor(private strategy: SortStrategy) {}

  setStrategy(strategy: SortStrategy): void {
    this.strategy = strategy;
  }

  sort(data: number[]): number[] {
    return this.strategy.sort(data);
  }
}
