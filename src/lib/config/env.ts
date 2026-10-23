import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/trucktrust"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long").default("trucktrust_secure_super_secret_jwt_key_2026_maharashtra_rural"),
  
  // SMS Configuration
  SMS_PROVIDER: z.enum(["dev-console", "mock", "fast2sms", "msg91", "twilio"]).default("dev-console"),
  FAST2SMS_API_KEY: z.string().optional(),
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_TEMPLATE_ID: z.string().optional(),
  
  // Storage Configuration
  STORAGE_PROVIDER: z.enum(["local", "cloudinary", "s3"]).default("local"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Payment Configuration (Razorpay)
  PAYMENT_PROVIDER: z.enum(["mock", "razorpay"]).default("mock"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  
  // Application URLs
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_BRAND_NAME: z.string().default("TruckTrust"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 2));
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment configuration. Application exiting.");
    }
  }
  return parsed.data ?? (envSchema.parse({}));
}

export const env = validateEnv();
