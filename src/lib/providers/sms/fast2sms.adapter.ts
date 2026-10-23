import { ISmsProvider, SmsSendResult } from "./sms.provider";
import { BRAND_NAME } from "@/lib/config/brand";

export class Fast2SmsAdapter implements ISmsProvider {
  readonly name = "fast2sms";
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FAST2SMS_API_KEY || "";
  }

  async sendOtp(phone: string, otp: string): Promise<SmsSendResult> {
    if (!this.apiKey) {
      return { success: false, error: "Fast2SMS API key not configured" };
    }

    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otp,
          numbers: phone.replace(/\D/g, ""),
        }),
      });

      const data = await response.json();
      if (data.return) {
        return { success: true, messageId: data.request_id };
      }
      return { success: false, error: data.message || "Fast2SMS delivery failed" };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async sendAlert(phone: string, message: string): Promise<SmsSendResult> {
    if (!this.apiKey) {
      return { success: false, error: "Fast2SMS API key not configured" };
    }

    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message: `[${BRAND_NAME}] ${message}`,
          language: "english",
          flash: 0,
          numbers: phone.replace(/\D/g, ""),
        }),
      });

      const data = await response.json();
      return { success: data.return === true, messageId: data.request_id };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }
}
