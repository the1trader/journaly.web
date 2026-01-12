import { storageService } from './storage';

/**
 * UI-facing image service.
 * Enforces Rule 1: No direct Supabase calls in components.
 */
export const imageService = {
  /**
   * Handles high-level image upload flow.
   */
  async uploadImage(file: File | Blob, userId: string): Promise<string> {
    return await storageService.upload(file, userId);
  },

  /**
   * Handles clipboard paste events.
   */
  async handlePaste(
    event: React.ClipboardEvent | ClipboardEvent,
    onImageDetected: (file: File) => void
  ) {
    const items = (event as any).clipboardData?.items || [];
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          onImageDetected(file);
        }
      }
    }
  },

  /**
   * Deletes an image by its public URL.
   */
  async deleteImage(url: string): Promise<void> {
    await storageService.delete(url);
  }
};
