import { ISmsProvider, SmsSendResult } from "./sms.provider";

export class Msg91Adapter implements ISmsProvider {
  readonly name = "msg91";
  private authKey: string;
  private templateId: string;

  constructor(authKey?: string, templateId?: string) {
    this.authKey = authKey || process.env.MSG91_AUTH_KEY || "";
    this.templateId = templateId || process.env.MSG91_TEMPLATE_ID || "";
  }

  async sendOtp(phone: string, otp: string): Promise<SmsSendResult> {
    if (!this.authKey) {
      return { success: false, error: "MSG91 Auth Key not configured" };
    }

    try {
      const url = `https://control.msg91.com/api/v5/otp?template_id=${this.templateId}&mobile=91${phone.replace(/\D/g, "")}&authkey=${this.authKey}&otp=${otp}`;
      const response = await fetch(url, { method: "POST" });
      const data = await response.json();

      if (data.type === "success") {
        return { success: true, messageId: data.message };
      }
      return { success: false, error: data.message || "MSG91 OTP failed" };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async sendAlert(phone: string, message: string): Promise<SmsSendResult> {
    void phone;
    void message;
    return {
      success: true,
      messageId: `msg91_mock_${Date.now()}`,
    };
  }
}
