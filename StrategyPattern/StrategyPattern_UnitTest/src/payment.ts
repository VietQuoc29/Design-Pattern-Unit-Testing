export interface PaymentStrategy {
  pay(amount: number): string;
}

export class CreditCardStrategy implements PaymentStrategy {
  pay(amount: number): string {
    return `Pays ${amount}d with credit card`;
  }
}

export class MomoStrategy implements PaymentStrategy {
  pay(amount: number): string {
    return `Pays ${amount}d with MoMo`;
  }
}

export class ZaloPayStrategy implements PaymentStrategy {
  pay(amount: number): string {
    return `Pays ${amount}d with ZaloPay`;
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
