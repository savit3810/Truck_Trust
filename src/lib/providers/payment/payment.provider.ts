export interface CreateOrderParams {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId?: string;
}

export interface VerifySignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface RefundParams {
  paymentId: string;
  amountPaise?: number; // Optional: partial refund if specified, otherwise full
  notes?: Record<string, string>;
}

export interface RefundResult {
  refundId: string;
  amountPaise: number;
  status: "processed" | "pending" | "failed";
}

export interface PayoutParams {
  driverId: string;
  amountPaise: number;
  accountType: "vpa" | "bank_account";
  vpaAddress?: string; // UPI ID (e.g. 9822110001@upi)
  bankAccount?: {
    accountNumber: string;
    ifsc: string;
    accountHolderName: string;
  };
  narration?: string;
}

export interface PayoutResult {
  payoutId: string;
  amountPaise: number;
  status: "queued" | "processing" | "processed" | "failed";
  referenceId: string;
}

export interface IPaymentProvider {
  name: string;
  createOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;
  verifyPaymentSignature(params: VerifySignatureParams): Promise<boolean>;
  verifyWebhookSignature(body: string, signature: string): Promise<boolean>;
  refundPayment(params: RefundParams): Promise<RefundResult>;
  createPayout(params: PayoutParams): Promise<PayoutResult>;
}
