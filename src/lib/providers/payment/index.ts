import { env } from "@/lib/config/env";
import { IPaymentProvider } from "./payment.provider";
import { RazorpayAdapter } from "./razorpay.adapter";
import { MockPaymentAdapter } from "./mock.adapter";

export * from "./payment.provider";
export * from "./razorpay.adapter";
export * from "./mock.adapter";

let paymentProviderInstance: IPaymentProvider | null = null;

export function getPaymentProvider(): IPaymentProvider {
  if (paymentProviderInstance) {
    return paymentProviderInstance;
  }

  if (
    env.PAYMENT_PROVIDER === "razorpay" &&
    env.RAZORPAY_KEY_ID &&
    env.RAZORPAY_KEY_SECRET
  ) {
    paymentProviderInstance = new RazorpayAdapter(
      env.RAZORPAY_KEY_ID,
      env.RAZORPAY_KEY_SECRET,
      env.RAZORPAY_WEBHOOK_SECRET
    );
  } else {
    paymentProviderInstance = new MockPaymentAdapter();
  }

  return paymentProviderInstance;
}
