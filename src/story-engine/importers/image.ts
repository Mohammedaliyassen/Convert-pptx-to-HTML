import type { Story } from '../core/types';

// Converts a direct image URL into a 1-slide story
export const importImageFromUrl = (url: string, title?: string): Story => {
  const id = Math.random().toString(36).substring(2, 9);
  return {
    id: `story-${id}`,
    title: title || 'صورة مستوردة',
    language: 'ar',
    direction: 'rtl',
    slides: [
      {
        id: `slide-${id}`,
        background: { type: 'color', value: '#1e1e24' },
        elements: [
          {
            id: `el-${id}`,
            type: 'image',
            src: url,
            x: 200,
            y: 87,
            width: 800,
            height: 500,
            rotation: 0,
            opacity: 1,
            zIndex: 0,
            locked: false,
            hidden: false,
            animation: null,
          },
        ],
      },
    ],
  };
};

import { compressImageToBase64 } from '../utils/imageCompressor';

// Converts a local uploaded file (PNG/JPG) into a 1-slide story using FileReader with compression
export const importImageFromFile = async (file: File): Promise<Story> => {
  try {
    const compressedDataUrl = await compressImageToBase64(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
    return importImageFromUrl(compressedDataUrl, cleanName);
  } catch (err) {
    throw err;
  }
};
