import { supabase } from '../../lib/supabase';
import { StorageProvider } from './StorageProvider';
import imageCompression from 'browser-image-compression';

export class SupabaseStorageProvider implements StorageProvider {
  private bucket: string = 'journal-images';

  async upload(file: Blob | File, userId: string): Promise<string> {
    // 1. Internal Compression (as per Step 1)
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: 'image/jpeg'
    };
    
    const compressedFile = await imageCompression(file as File, options);

    // 2. Internal Path Generation
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${randomString}.jpg`;
    const path = `user-${userId}/${fileName}`;

    // 3. Upload
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(path, compressedFile, { upsert: true });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  }

  async delete(url: string): Promise<void> {
    // Extract path from public URL
    // Format: .../storage/v1/object/public/journal-images/user-id/filename.jpg
    const parts = url.split(`${this.bucket}/`);
    if (parts.length < 2) throw new Error('Invalid storage URL');
    
    const path = parts[1];
    const { error } = await supabase.storage
      .from(this.bucket)
      .remove([path]);

    if (error) throw new Error(`Deletion failed: ${error.message}`);
  }
}
