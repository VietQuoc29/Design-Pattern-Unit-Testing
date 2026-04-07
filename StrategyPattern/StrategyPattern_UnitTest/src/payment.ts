export interface PaymentStrategy {
  pay(amount: number): string;
}

export class CreditCardStrategy implements PaymentStrategy {
  pay(amount: number): string {
    return `Thanh toán ${amount}đ bằng thẻ tín dụng`;
  }
}

export class MomoStrategy implements PaymentStrategy {
  pay(amount: number): string {
    return `Thanh toán ${amount}đ bằng MoMo`;
  }
}

export class ZaloPayStrategy implements PaymentStrategy {
  pay(amount: number): string {
    return `Thanh toán ${amount}đ bằng ZaloPay`;
  }
}

export class PaymentContext {
  constructor(private strategy: PaymentStrategy) {}

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  executePayment(amount: number): string {
    return this.strategy.pay(amount);
  }
}
