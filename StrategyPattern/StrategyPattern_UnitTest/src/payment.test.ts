import {
  PaymentContext,
  CreditCardStrategy,
  MomoStrategy,
  ZaloPayStrategy,
  PaymentStrategy,
} from './payment';

describe('Payment System', () => {

  it('thanh toán bằng thẻ tín dụng', () => {
    const ctx = new PaymentContext(new CreditCardStrategy());
    expect(ctx.executePayment(100000)).toBe('Thanh toán 100000đ bằng thẻ tín dụng');
  });

  it('thanh toán bằng MoMo', () => {
    const ctx = new PaymentContext(new MomoStrategy());
    expect(ctx.executePayment(50000)).toBe('Thanh toán 50000đ bằng MoMo');
  });

  it('thanh toán bằng ZaloPay', () => {
    const ctx = new PaymentContext(new ZaloPayStrategy());
    expect(ctx.executePayment(75000)).toBe('Thanh toán 75000đ bằng ZaloPay');
  });

  it('chuyển đổi strategy từ CreditCard sang MoMo lúc runtime', () => {
    const ctx = new PaymentContext(new CreditCardStrategy());
    ctx.setStrategy(new MomoStrategy());
    expect(ctx.executePayment(50000)).toBe('Thanh toán 50000đ bằng MoMo');
  });

  it('mock strategy – kiểm tra số lần gọi và tham số truyền vào', () => {
    const mockStrategy: PaymentStrategy = {
      pay: jest.fn().mockReturnValue('Mock payment OK'),
    };
    const ctx = new PaymentContext(mockStrategy);
    ctx.executePayment(200000);

    expect(mockStrategy.pay).toHaveBeenCalledWith(200000);
    expect(mockStrategy.pay).toHaveBeenCalledTimes(1);
  });

});
