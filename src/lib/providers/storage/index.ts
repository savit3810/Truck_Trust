import { IStorageProvider } from "./storage.provider";
import { LocalDiskAdapter } from "./local-disk.adapter";

export * from "./storage.provider";

let storageInstance: IStorageProvider | null = null;

export function getStorageProvider(): IStorageProvider {
  if (storageInstance) {
    return storageInstance;
  }

  // Default to LocalDiskAdapter in dev/test, expandable to Cloudinary/S3 in production
  storageInstance = new LocalDiskAdapter();
  return storageInstance;
}
