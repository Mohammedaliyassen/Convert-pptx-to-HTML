// Curated list of premium Arabic Google Fonts
export const GOOGLE_ARABIC_FONTS = [
  { id: 'Dubai', name: 'Dubai (دبي الأصلي)' },
  { id: 'Cairo', name: 'Cairo (حديث / افتراضي)' },
  { id: 'Tajawal', name: 'Tajawal (نظيف / مبسط)' },
  { id: 'Amiri', name: 'Amiri (كلاسيكي / نصوص)' },
  { id: 'Almarai', name: 'Almarai (رسمي / معاصر)' },
  { id: 'Changa', name: 'Changa (عريض / عناوين)' },
  { id: 'El Messiri', name: 'El Messiri (فني / مموج)' },
  { id: 'Lalezar', name: 'Lalezar (ريترو / ملصقات)' },
  { id: 'Reem Kufi', name: 'Reem Kufi (كوفي متميز)' },
  { id: 'Alexandria', name: 'Alexandria (حديث)' },
  { id: 'Noto Sans Arabic', name: 'Noto Sans Arabic' },
];

// Set of valid Google Font family names (case-insensitive search)
const VALID_GOOGLE_FONTS = new Set([
  'cairo',
  'tajawal',
  'amiri',
  'almarai',
  'changa',
  'el messiri',
  'lalezar',
  'reem kufi',
  'alexandria',
  'noto sans arabic',
  'noto kufi arabic',
  'readex pro',
  'vazirmatn',
  'kufam',
  'aref ruqaa',
  'harmattan',
  'mada',
  'lateef',
  'scheherazade new',
  'fredoka',
  'nunito',
  'caveat',
  'playfair display',
  'jetbrains mono',
  'roboto',
  'open sans',
  'inter',
]);

// Mapping of non-Google fonts (e.g., PowerPoint standard Arabic fonts) to high-quality Google Fonts
const FONT_FALLBACK_MAP: Record<string, string> = {
  'traditional arabic': 'Amiri',
  'arabic typesetting': 'Amiri',
  'simplified arabic': 'Tajawal',
  'sakkal majalla': 'Almarai',
  'segoe ui': 'Cairo',
  calibri: 'Cairo',
  arial: 'Cairo',
  tahoma: 'Cairo',
  'times new roman': 'Amiri',
};

// System/browser default font names that don't need Google Fonts loading
const SYSTEM_FONTS = new Set([
  'sans-serif',
  'serif',
  'monospace',
  'arial',
  'calibri',
  'tahoma',
  'times new roman',
  'helvetica',
  'georgia',
  'verdana',
  'trebuchet ms',
  'impact',
  'courier new',
  'system-ui',
]);

/**
 * Returns a robust CSS font-family stack with proper web-font fallback.
 * Example: "Dubai" -> "'Dubai', 'Cairo', 'Tajawal', sans-serif"
 */
export const getResolvedFontFamily = (fontFamily?: string): string => {
  if (!fontFamily || !fontFamily.trim()) {
    return "'Dubai', 'Cairo', 'Tajawal', system-ui, sans-serif";
  }

  const rawName = fontFamily.trim().replace(/^['"]|['"]$/g, '');
  const lowerName = rawName.toLowerCase();

  // Dubai font family (Dubai, Dubai Medium, Dubai Light, Dubai Bold)
  if (lowerName.includes('dubai')) {
    return "'Dubai', 'Cairo', 'Tajawal', system-ui, sans-serif";
  }

  // If it's already a valid Google Font
  if (VALID_GOOGLE_FONTS.has(lowerName)) {
    return `'${rawName}', 'Dubai', 'Cairo', 'Tajawal', system-ui, sans-serif`;
  }

  // If mapped fallback exists
  const mappedFallback = FONT_FALLBACK_MAP[lowerName];
  if (mappedFallback) {
    return `'${rawName}', '${mappedFallback}', 'Dubai', 'Cairo', system-ui, sans-serif`;
  }

  // General fallback
  return `'${rawName}', 'Dubai', 'Cairo', 'Tajawal', system-ui, sans-serif`;
};

/**
 * Helper to dynamically load a font stylesheet link into the document head safely.
 * Handles Dubai font via CDN fonts and valid Google Fonts.
 */
export const loadGoogleFont = (fontFamily: string) => {
  if (!fontFamily) return;

  const rawName = fontFamily.trim().replace(/^['"]|['"]$/g, '');
  const lowerName = rawName.toLowerCase();

  // Special handling for Dubai font family
  if (lowerName.includes('dubai')) {
    const fontId = 'font-cdn-dubai';
    if (!document.getElementById(fontId)) {
      try {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.cdnfonts.com/css/dubai';
        document.head.appendChild(link);
      } catch (err) {
        console.warn('Failed to inject Dubai font CDN link:', err);
      }
    }
    return;
  }

  // Skip system fonts
  if (SYSTEM_FONTS.has(lowerName)) return;

  let targetFontToLoad: string | null = null;

  if (VALID_GOOGLE_FONTS.has(lowerName)) {
    targetFontToLoad = rawName;
  } else if (FONT_FALLBACK_MAP[lowerName]) {
    targetFontToLoad = FONT_FALLBACK_MAP[lowerName];
  }

  if (!targetFontToLoad) return;

  const fontId = `google-font-${targetFontToLoad.toLowerCase().replace(/\s+/g, '-')}`;

  // If already loaded in head, skip
  if (document.getElementById(fontId)) return;

  try {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    // Load weight 400 (normal) and 700 (bold)
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(targetFontToLoad)}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  } catch (err) {
    console.warn(`Failed to dynamically inject Google Font link for ${targetFontToLoad}:`, err);
  }
};


