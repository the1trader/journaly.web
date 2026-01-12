import { StorageProvider } from './StorageProvider';
import { SupabaseStorageProvider } from './SupabaseStorageProvider';
import { AwsS3StorageProvider } from './AwsS3StorageProvider';

/**
 * Provider Switch Point (Rule 2 & Step 3)
 */
const provider: StorageProvider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER === "aws"
  ? new AwsS3StorageProvider()
  : new SupabaseStorageProvider();

export const storageService = provider;
export * from './StorageProvider';
