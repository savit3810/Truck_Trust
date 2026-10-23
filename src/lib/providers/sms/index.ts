import { ISmsProvider } from "./sms.provider";
import { DevConsoleAdapter } from "./dev-console.adapter";
import { Fast2SmsAdapter } from "./fast2sms.adapter";
import { Msg91Adapter } from "./msg91.adapter";
import { env } from "@/lib/config/env";

export * from "./sms.provider";

let instance: ISmsProvider | null = null;

export function getSmsProvider(): ISmsProvider {
  if (instance) {
    return instance;
  }

  // If not in production, DevConsoleAdapter is always available unless explicitly overridden
  if (env.NODE_ENV !== "production" && env.SMS_PROVIDER === "dev-console") {
    instance = new DevConsoleAdapter();
    return instance;
  }

  switch (env.SMS_PROVIDER) {
    case "fast2sms":
      instance = new Fast2SmsAdapter();
      break;
    case "msg91":
      instance = new Msg91Adapter();
      break;
    case "mock":
    case "dev-console":
    default:
      if (env.NODE_ENV === "production") {
        console.warn("⚠️ WARNING: DevConsoleAdapter used in production. Please configure an SMS provider.");
      }
      instance = new DevConsoleAdapter();
      break;
  }

  return instance;
}
