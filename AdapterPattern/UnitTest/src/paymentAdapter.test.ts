import { MomoAdapter, MomoService, PaymentProcessor } from './paymentAdapter';

describe('Payment Gateway Adapter', () => {

  it('processPayment() returns a successful PaymentResult', () => {
    const adapter: PaymentProcessor = new MomoAdapter(new MomoService());
    const result = adapter.processPayment(50, 'VND');

    expect(result.success).toBe(true);
    expect(result.transactionId).toContain('momo_');
    expect(result.message).toContain('50 VND');
  });

  it('maps momo status "succeeded" to result.success = true', () => {
    const mockMomo = {
      charge:  jest.fn().mockReturnValue({ id: '001', status: 'succeeded' }),
      reverse: jest.fn(),
    };
    const result = new MomoAdapter(mockMomo as any).processPayment(10, 'VND');
    expect(result.success).toBe(true);
  });

  it('maps momo status other than "succeeded" to result.success = false', () => {
    const mockMomo = {
      charge:  jest.fn().mockReturnValue({ id: '002', status: 'failed' }),
      reverse: jest.fn(),
    };
    const result = new MomoAdapter(mockMomo as any).processPayment(10, 'VND');
    expect(result.success).toBe(false);
  });

  it('refundPayment() delegates to momo.reverse() and maps the result', () => {
    const mockMomo = {
      charge:  jest.fn(),
      reverse: jest.fn().mockReturnValue({ reversed: true }),
    };
    const adapter = new MomoAdapter(mockMomo as any);
    const result  = adapter.refundPayment('refund');

    expect(mockMomo.reverse).toHaveBeenCalledWith('refund');
    expect(result).toBe(true);
  });

  it('client code works with PaymentProcessor – completely unaware of Momo', () => {
    function checkout(processor: PaymentProcessor, amount: number) {
      return processor.processPayment(amount, 'VND');
    }
    const adapter = new MomoAdapter(new MomoService());
    expect(checkout(adapter, 100).success).toBe(true);
  });

});
