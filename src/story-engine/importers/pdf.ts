import * as pdfjsLib from 'pdfjs-dist';
import type { Story, Slide, StoryElement, TextElement } from '../core/types';

// Set up the pdfjs worker using unpkg CDN matching the installed version dynamically
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface TextItemObj {
  str: string;
  x: number;
  y: number;
  fontSize: number;
  width: number;
  height: number;
  dir: 'ltr' | 'rtl';
}

export const importPdfFromFile = async (file: File): Promise<Story> => {
  const fileReader = new FileReader();
  
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
    fileReader.onerror = (err) => reject(err);
    fileReader.readAsArrayBuffer(file);
  });

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const slides: Slide[] = [];

  const targetWidth = 1200;
  const targetHeight = 675;

  // Process each page
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    
    // Default viewport at scale 1.0 to get size
    const baseViewport = page.getViewport({ scale: 1.0 });
    
    // Fit scale to target canvas (1200x675)
    const fitScale = Math.min(targetWidth / baseViewport.width, targetHeight / baseViewport.height);
    const renderScale = fitScale * 1.5; // Render 1.5x larger for high-quality backgrounds

    // 1. Render page to Canvas to extract background image
    const renderViewport = page.getViewport({ scale: renderScale });
    const canvas = document.createElement('canvas');
    canvas.width = renderViewport.width;
    canvas.height = renderViewport.height;
    const context = canvas.getContext('2d');

    if (context) {
      await page.render({
        canvasContext: context,
        viewport: renderViewport,
        canvas: canvas,
      }).promise;
    }

    // Convert canvas render to base64 DataURL background
    const bgDataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // 2. Extract and group text elements
    const textContent = await page.getTextContent();
    const rawTextItems: TextItemObj[] = [];

    // Map pdf text items to viewport coordinates
    const scaleViewport = page.getViewport({ scale: fitScale });
    
    textContent.items.forEach((item: any) => {
      if (!item.str || !item.str.trim()) return;

      const transform = item.transform; // [scaleX, skewY, skewX, scaleY, tx, ty]
      const pdfX = transform[4];
      const pdfY = transform[5];
      const fontSize = transform[3];

      // Convert PDF point coordinate to standard pixel viewport coordinate
      const [vx, vy] = scaleViewport.convertToViewportPoint(pdfX, pdfY);

      // Simple RTL detection (rough check for Arabic Unicode ranges)
      const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(item.str);

      rawTextItems.push({
        str: item.str,
        x: vx,
        y: vy - fontSize, // align standard top-left coordinate
        fontSize: fontSize * fitScale,
        width: item.width * fitScale,
        height: item.height * fitScale,
        dir: hasArabic ? 'rtl' : 'ltr',
      });
    });

    // Heuristics: Group text items on the same horizontal line to make editing cleaner
    const groupedTextElements: StoryElement[] = [];
    const lineThreshold = 5; // vertical pixel proximity to group into same line
    
    // Sort items by Y position first
    rawTextItems.sort((a, b) => a.y - b.y);

    const lines: TextItemObj[][] = [];
    rawTextItems.forEach((item) => {
      let added = false;
      for (const line of lines) {
        const lineY = line[0].y;
        if (Math.abs(item.y - lineY) < lineThreshold) {
          line.push(item);
          added = true;
          break;
        }
      }
      if (!added) {
        lines.push([item]);
      }
    });

    let textZIndex = 0;
    lines.forEach((line) => {
      // Sort items on this line horizontally (left-to-right)
      line.sort((a, b) => a.x - b.x);

      const firstItem = line[0];
      const lastItem = line[line.length - 1];
      
      // Combine text
      const fullText = line.map((item) => item.str).join(' ');
      const x = firstItem.x;
      const y = Math.min(...line.map((item) => item.y));
      const width = (lastItem.x + lastItem.width) - firstItem.x;
      const height = Math.max(...line.map((item) => item.fontSize)) * 1.3;
      const avgFontSize = Math.round(line.reduce((sum, item) => sum + item.fontSize, 0) / line.length);
      const isRtl = line.some((item) => item.dir === 'rtl');

      const textEl: TextElement = {
        id: `el-pdf-t-${Math.random().toString(36).substring(2, 9)}`,
        type: 'text',
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(Math.max(width, 100)),
        height: Math.round(Math.max(height, avgFontSize * 1.5)),
        rotation: 0,
        opacity: 1,
        zIndex: textZIndex++,
        locked: false,
        hidden: false,
        animation: null,
        text: fullText,
        fontFamily: 'Cairo',
        fontSize: Math.max(12, avgFontSize),
        color: '#000000', // default black text overlay
        bold: false,
        italic: false,
        underline: false,
        align: isRtl ? 'right' : 'left',
        dir: isRtl ? 'rtl' : 'ltr',
      };
      groupedTextElements.push(textEl);
    });

    const slide: Slide = {
      id: `slide-pdf-${Math.random().toString(36).substring(2, 9)}`,
      background: { type: 'image', value: bgDataUrl },
      elements: groupedTextElements,
    };
    slides.push(slide);
  }

  const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

  return {
    id: `story-pdf-${Math.random().toString(36).substring(2, 9)}`,
    title: cleanTitle,
    language: 'ar',
    direction: 'rtl',
    slides: slides,
  };
};
