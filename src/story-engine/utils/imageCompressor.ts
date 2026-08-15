/**
 * Compresses an image File or Blob and returns a Base64 data URL.
 * Uses object URLs (no FileReader) to avoid memory spikes.
 *
 * Transparency is preserved: PNG/WebP/GIF (and any raster that actually has
 * alpha pixels) are exported as PNG. Opaque images become JPEG for size.
 */
const UNSUPPORTED_EXT = /\.(emf|wmf|emz|wmz|svgz|eps|ai|cdr)$/i;

/** Skip decoding blobs larger than this (bytes) — prevents OOM on huge embedded media */
const MAX_BLOB_BYTES = 12 * 1024 * 1024; // 12 MB

export type CompressOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  /**
   * Prefer JPEG for *opaque* images to save memory on large imports.
   * Transparent images are always kept as PNG regardless of this flag.
   */
  preferJpegIfOpaque?: boolean;
};

/** Sample the canvas alpha channel to detect real transparency */
const canvasHasTransparency = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): boolean => {
  try {
    // Sparse sample — full getImageData on large canvases is expensive
    const stepX = Math.max(1, Math.floor(width / 48));
    const stepY = Math.max(1, Math.floor(height / 48));
    for (let y = 0; y < height; y += stepY) {
      for (let x = 0; x < width; x += stepX) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        if (pixel[3] < 255) return true;
      }
    }
    // Also check corners + center (common for logos with soft edges)
    const spots = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1],
      [Math.floor(width / 2), Math.floor(height / 2)],
    ];
    for (const [sx, sy] of spots) {
      if (sx < 0 || sy < 0) continue;
      const pixel = ctx.getImageData(sx, sy, 1, 1).data;
      if (pixel[3] < 255) return true;
    }
  } catch {
    // Tainted canvas or browser restriction — assume may need alpha if format suggests it
    return false;
  }
  return false;
};

export const compressImageToBase64 = (
  fileOrBlob: File | Blob,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75,
  originalFilename?: string,
  options?: CompressOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const nameToCheck =
      originalFilename || (fileOrBlob instanceof File ? fileOrBlob.name : '');

    const effectiveMaxW = options?.maxWidth ?? maxWidth;
    const effectiveMaxH = options?.maxHeight ?? maxHeight;
    const effectiveQuality = options?.quality ?? quality;
    const preferJpegIfOpaque = options?.preferJpegIfOpaque ?? false;

    if (nameToCheck && UNSUPPORTED_EXT.test(nameToCheck)) {
      reject(new Error(`Unsupported image format: ${nameToCheck}`));
      return;
    }

    if (fileOrBlob.size > MAX_BLOB_BYTES) {
      reject(
        new Error(
          `Image too large (${Math.round(fileOrBlob.size / 1024 / 1024)}MB): ${nameToCheck || 'blob'}`
        )
      );
      return;
    }

    // Format hints from MIME / filename (Office often stores PNG without a reliable MIME)
    const formatLooksTransparent =
      fileOrBlob.type === 'image/png' ||
      fileOrBlob.type === 'image/webp' ||
      fileOrBlob.type === 'image/gif' ||
      /\.(png|webp|gif)$/i.test(nameToCheck);

    let objectUrl: string | null = null;
    try {
      objectUrl = URL.createObjectURL(fileOrBlob);
    } catch (err) {
      reject(err);
      return;
    }

    const img = new Image();
    let settled = false;

    const cleanup = () => {
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          /* ignore */
        }
        objectUrl = null;
      }
    };

    const fail = (err: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    const succeed = (dataUrl: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(dataUrl);
    };

    const timeoutId = window.setTimeout(() => {
      fail(new Error('Image decode timed out'));
    }, 25000);

    img.onload = () => {
      window.clearTimeout(timeoutId);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          fail(new Error('Image has zero dimensions'));
          return;
        }

        if (width > effectiveMaxW || height > effectiveMaxH) {
          const ratio = Math.min(effectiveMaxW / width, effectiveMaxH / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        // Always use an alpha-capable canvas so we can detect transparency
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          fail(new Error('Could not get canvas 2d context'));
          return;
        }

        // Clear to fully transparent — never fill white (that destroys alpha)
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Decide export format: keep PNG when transparency is present or expected
        let usePng = formatLooksTransparent;
        if (!usePng) {
          // Opaque-looking format (JPEG) — still verify in case of mislabeled files
          usePng = canvasHasTransparency(ctx, width, height);
        } else if (preferJpegIfOpaque && formatLooksTransparent) {
          // Large-deck mode: only switch PNG→JPEG if the image is actually fully opaque
          const hasAlpha = canvasHasTransparency(ctx, width, height);
          usePng = hasAlpha;
        }

        try {
          let base64: string;
          if (usePng) {
            base64 = canvas.toDataURL('image/png');
          } else {
            // Opaque → JPEG. White underlay only for JPEG so no black fringes.
            const jpegCanvas = document.createElement('canvas');
            jpegCanvas.width = width;
            jpegCanvas.height = height;
            const jctx = jpegCanvas.getContext('2d');
            if (!jctx) {
              base64 = canvas.toDataURL('image/png');
            } else {
              jctx.fillStyle = '#ffffff';
              jctx.fillRect(0, 0, width, height);
              jctx.drawImage(canvas, 0, 0);
              base64 = jpegCanvas.toDataURL('image/jpeg', effectiveQuality);
              jpegCanvas.width = 0;
              jpegCanvas.height = 0;
            }
          }

          canvas.width = 0;
          canvas.height = 0;
          succeed(base64);
        } catch (err) {
          fail(err);
        }
      } catch (err) {
        fail(err);
      }
    };

    img.onerror = () => {
      window.clearTimeout(timeoutId);
      fail(new Error(`Failed to decode image: ${nameToCheck || 'blob'}`));
    };

    img.src = objectUrl;
  });
};
