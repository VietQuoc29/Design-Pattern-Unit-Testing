export interface Product {
  name: string;
  price: number;
  stock: number;
}

export class ProductBuilder {
  private product: Product = {
    name: 'Keyboard',
    price: 0,
    stock: 0
  };

  withName(name: string): ProductBuilder {
    this.product.name = name;
    return this;
  }

  withPrice(price: number): ProductBuilder {
    this.product.price = price;
    return this;
  }

  withStock(stock: number): ProductBuilder {
    this.product.stock = stock;
    return this;
  }

  build(): Product {
    return { ...this.product };
  }
}
