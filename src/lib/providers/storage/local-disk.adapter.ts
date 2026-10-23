import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { IStorageProvider, UploadedFileResult } from "./storage.provider";

export class LocalDiskAdapter implements IStorageProvider {
  readonly name = "local-disk";
  private uploadDir: string;

  constructor(customUploadDir?: string) {
    this.uploadDir = customUploadDir || path.join(process.cwd(), "public", "uploads");
  }

  private async ensureUploadDir(folder?: string): Promise<string> {
    const targetDir = folder ? path.join(this.uploadDir, folder) : this.uploadDir;
    await fs.mkdir(targetDir, { recursive: true });
    return targetDir;
  }

  private sanitizeExtension(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    // Allow only safe document & image extensions, prevent any executable upload
    const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
    return allowed.includes(ext) ? ext : ".bin";
  }

  async upload(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    folder: string = "documents"
  ): Promise<UploadedFileResult> {
    const targetDir = await this.ensureUploadDir(folder);
    const safeExt = this.sanitizeExtension(originalFilename);
    const randomKey = `${crypto.randomUUID()}${safeExt}`;
    const filePath = path.join(targetDir, randomKey);

    await fs.writeFile(filePath, fileBuffer);

    const storageKey = folder ? `${folder}/${randomKey}` : randomKey;
    const fileUrl = `/uploads/${storageKey}`;

    return {
      fileUrl,
      originalFilename: path.basename(originalFilename),
      fileSizeBytes: fileBuffer.length,
      mimeType,
      storageKey,
    };
  }

  async delete(storageKey: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, storageKey);
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  getPublicUrl(storageKey: string): string {
    return `/uploads/${storageKey}`;
  }
}
