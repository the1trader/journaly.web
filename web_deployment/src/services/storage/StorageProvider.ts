/**
 * Agnostic storage interface for file operations.
 * Designed to be provider-independent (Supabase, AWS S3, etc.)
 */
export interface StorageProvider {
  /**
   * Uploads a file and returns the public URL.
   * Internal implementation handles path generation and compression.
   */
  upload(file: Blob | File, userId: string): Promise<string>;

  /**
   * Deletes a file given its public URL.
   */
  delete(url: string): Promise<void>;
}
