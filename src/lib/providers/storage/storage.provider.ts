export interface UploadedFileResult {
  fileUrl: string;
  originalFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  storageKey: string;
}

export interface IStorageProvider {
  readonly name: string;
  upload(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    folder?: string
  ): Promise<UploadedFileResult>;
  delete(storageKey: string): Promise<boolean>;
  getPublicUrl(storageKey: string): string;
}
