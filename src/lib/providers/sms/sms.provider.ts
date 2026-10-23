export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ISmsProvider {
  readonly name: string;
  sendOtp(phone: string, otp: string, purpose?: string): Promise<SmsSendResult>;
  sendAlert(phone: string, message: string): Promise<SmsSendResult>;
}
