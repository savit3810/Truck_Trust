import { ISmsProvider, SmsSendResult } from "./sms.provider";
import { BRAND_NAME } from "@/lib/config/brand";

export class DevConsoleAdapter implements ISmsProvider {
  readonly name = "dev-console";

  async sendOtp(phone: string, otp: string, purpose: string = "Login"): Promise<SmsSendResult> {
    const divider = "=".repeat(50);
    console.log(`\n${divider}`);
    console.log(`🚛 [${BRAND_NAME} DEV SMS CONSOLE]`);
    console.log(`📱 Recipient Phone: +91 ${phone}`);
    console.log(`🔑 Verification OTP: >>> ${otp} <<<`);
    console.log(`📋 Purpose:         ${purpose}`);
    console.log(`⏳ Validity:        5 Minutes`);
    console.log(`⏰ Timestamp:       ${new Date().toISOString()}`);
    console.log(`${divider}\n`);

    return {
      success: true,
      messageId: `dev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  }

  async sendAlert(phone: string, message: string): Promise<SmsSendResult> {
    console.log(`\n🔔 [${BRAND_NAME} DEV ALERT] to +91 ${phone}: ${message}\n`);
    return {
      success: true,
      messageId: `dev_alert_${Date.now()}`,
    };
  }
}
