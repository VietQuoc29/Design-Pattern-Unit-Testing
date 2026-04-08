import { ProductBuilder } from './product';

describe('ProductBuilder', () => {
  it('Khởi tạo sản phẩm với các giá trị tùy chỉnh', () => {
    const product = new ProductBuilder()
      .withName('Laptop')
      .withPrice(999)
      .withStock(10)
      .build();

    expect(product.name).toBe('Laptop');
    expect(product.price).toBe(999);
    expect(product.stock).toBe(10);
  });

  it('Khởi tạo sản phẩm với các giá trị mặc định', () => {
    const product = new ProductBuilder().build();

    expect(product.name).toBe('Keyboard');
    expect(product.price).toBe(0);
    expect(product.stock).toBe(0);
  });

  it('Khởi tạo sản phẩm với tùy chỉnh một phần', () => {
    const product = new ProductBuilder()
      .withName('Mouse')
      .withPrice(25)
      .build();

    expect(product.name).toBe('Mouse');
    expect(product.price).toBe(25);
    expect(product.stock).toBe(0); // default
  });
});
