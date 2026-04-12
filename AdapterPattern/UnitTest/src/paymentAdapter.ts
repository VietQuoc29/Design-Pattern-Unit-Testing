// Target Interface – what the client code expects
export interface PaymentProcessor {
  processPayment(amount: number, currency: string): PaymentResult;
  refundPayment(transactionId: string): boolean;
}

export interface PaymentResult {
  success:       boolean;
  transactionId: string;
  message:       string;
}

// Adaptee – third-party Momo-like service with incompatible interface
export class MomoService {
  charge(amountInCents: number, curr: string): { id: string; status: string } {
    return { id: `momo_${amountInCents}`, status: 'succeeded' };
  }
  reverse(chargeId: string): { reversed: boolean } {
    return { reversed: true };
  }
}

// Adapter – wraps MomoService, implements the standard PaymentProcessor
export class MomoAdapter implements PaymentProcessor {
  constructor(private momo: MomoService) {}

  processPayment(amount: number, currency: string): PaymentResult {
    const result = this.momo.charge(amount, currency);
    return {
      success:       result.status === 'succeeded',
      transactionId: result.id,
      message:       `Charged ${amount} ${currency} via Momo`,
    };
  }

  refundPayment(transactionId: string): boolean {
    const result = this.momo.reverse(transactionId);
    return result.reversed;
  }
}
