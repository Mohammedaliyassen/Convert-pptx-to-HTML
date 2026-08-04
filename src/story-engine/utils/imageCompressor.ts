/**
 * Compresses an image File or Blob and returns a Base64 data URL.
 * Detects if the image is a PNG/WebP/GIF (with transparency) to preserve transparency,
 * otherwise exports as compressed JPEG.
 */
export const compressImageToBase64 = (
  fileOrBlob: File | Blob,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75,
  originalFilename?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw base64 data url if canvas context fails
          resolve(e.target?.result as string);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Detect if the file type requires transparency support (PNG/WebP/GIF)
        const nameToCheck = originalFilename || (fileOrBlob instanceof File ? fileOrBlob.name : '');
        const isPNG =
          fileOrBlob.type === 'image/png' ||
          fileOrBlob.type === 'image/webp' ||
          fileOrBlob.type === 'image/gif' ||
          nameToCheck.toLowerCase().endsWith('.png') ||
          nameToCheck.toLowerCase().endsWith('.webp') ||
          nameToCheck.toLowerCase().endsWith('.gif');

        try {
          // Export as PNG if transparency is needed, otherwise compress as JPEG
          const exportFormat = isPNG ? 'image/png' : 'image/jpeg';
          const base64 = canvas.toDataURL(exportFormat, isPNG ? undefined : quality);
          resolve(base64);
        } catch (err) {
          // Fallback on security/taint exceptions
          resolve(e.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(fileOrBlob);
  });
};
