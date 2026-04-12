import {
  PaymentContext,
  CreditCardStrategy,
  MomoStrategy,
  ZaloPayStrategy,
  PaymentStrategy,
} from './payment';

describe('Payment System', () => {

  it('pays with credit card', () => {
    const ctx = new PaymentContext(new CreditCardStrategy());
    expect(ctx.executePayment(100000)).toBe('Pays 100000d with credit card');
  });

  it('pays with MoMo', () => {
    const ctx = new PaymentContext(new MomoStrategy());
    expect(ctx.executePayment(50000)).toBe('Pays 50000d with MoMo');
  });

  it('pays with ZaloPay', () => {
    const ctx = new PaymentContext(new ZaloPayStrategy());
    expect(ctx.executePayment(75000)).toBe('Pays 75000d with ZaloPay');
  });

  it('switches strategy from CreditCard to MoMo at runtime', () => {
    const ctx = new PaymentContext(new CreditCardStrategy());
    ctx.setStrategy(new MomoStrategy());
    expect(ctx.executePayment(50000)).toBe('Pays 50000d with MoMo');
  });

  it('mock strategy – checks call count and arguments', () => {
    const mockStrategy: PaymentStrategy = {
      pay: jest.fn().mockReturnValue('Mock payment OK'),
    };
    const ctx = new PaymentContext(mockStrategy);
    ctx.executePayment(200000);

    expect(mockStrategy.pay).toHaveBeenCalledWith(200000);
    expect(mockStrategy.pay).toHaveBeenCalledTimes(1);
  });

});
