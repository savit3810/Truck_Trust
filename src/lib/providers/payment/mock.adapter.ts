import crypto from "crypto";
import {
  IPaymentProvider,
  CreateOrderParams,
  PaymentOrderResult,
  VerifySignatureParams,
  RefundParams,
  RefundResult,
  PayoutParams,
  PayoutResult,
} from "./payment.provider";

export class MockPaymentAdapter implements IPaymentProvider {
  name = "mock";
  private mockSecret = "mock_razorpay_secret_for_local_testing";

  async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    const randomHex = crypto.randomBytes(8).toString("hex");
    const orderId = `order_mock_${randomHex}`;

    return {
      orderId,
      amountPaise: params.amountPaise,
      currency: params.currency || "INR",
      keyId: "rzp_test_mockkey12345678",
    };
  }

  async verifyPaymentSignature(params: VerifySignatureParams): Promise<boolean> {
    const { orderId, paymentId, signature } = params;
    // In mock mode, if signature is "mock_valid_signature" or matches the HMAC, accept it
    if (signature === "mock_valid_signature") return true;

    try {
      const generated = crypto
        .createHmac("sha256", this.mockSecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
      return signature === generated;
    } catch {
      return false;
    }
  }

  async verifyWebhookSignature(body: string, signature: string): Promise<boolean> {
    if (signature === "mock_webhook_signature") return true;
    try {
      const generated = crypto
        .createHmac("sha256", this.mockSecret)
        .update(body)
        .digest("hex");
      return signature === generated;
    } catch {
      return false;
    }
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    return {
      refundId: `rfnd_mock_${crypto.randomBytes(6).toString("hex")}`,
      amountPaise: params.amountPaise || 100000,
      status: "processed",
    };
  }

  async createPayout(params: PayoutParams): Promise<PayoutResult> {
    return {
      payoutId: `pout_mock_${crypto.randomBytes(6).toString("hex")}`,
      amountPaise: params.amountPaise,
      status: "processed",
      referenceId: `UPI-RR-${Date.now()}`,
    };
  }
}
