import { StorageProvider } from './StorageProvider';

/**
 * AWS S3 Storage Provider Stub (Phase 2)
 */
export class AwsS3StorageProvider implements StorageProvider {
  async upload(file: Blob | File, userId: string): Promise<string> {
    throw new Error("AWS provider not enabled");
  }

  async delete(url: string): Promise<void> {
    throw new Error("AWS provider not enabled");
  }
}
