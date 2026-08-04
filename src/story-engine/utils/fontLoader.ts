// Curated list of premium Arabic Google Fonts
export const GOOGLE_ARABIC_FONTS = [
  { id: 'Cairo', name: 'Cairo (حديث / افتراضي)' },
  { id: 'Tajawal', name: 'Tajawal (نظيف / مبسط)' },
  { id: 'Amiri', name: 'Amiri (كلاسيكي / نصوص)' },
  { id: 'Almarai', name: 'Almarai (رسمي / معاصر)' },
  { id: 'Changa', name: 'Changa (عريض / عناوين)' },
  { id: 'El Messiri', name: 'El Messiri (فني / مموج)' },
  { id: 'Lalezar', name: 'Lalezar (ريترو / ملصقات)' },
  { id: 'Reem Kufi', name: 'Reem Kufi (كوفي متميز)' },
];

// Helper to dynamically load a Google Font stylesheet link into the document head
export const loadGoogleFont = (fontFamily: string) => {
  if (!fontFamily) return;
  
  // Skip standard/local system font names
  const systemFonts = ['sans-serif', 'serif', 'monospace', 'arial', 'calibri', 'tahoma', 'times new roman', 'helvetica'];
  if (systemFonts.includes(fontFamily.toLowerCase())) return;

  // Normalize family name (e.g. "Cairo" -> "Cairo")
  const normalizedFamily = fontFamily.trim();
  const fontId = `google-font-${normalizedFamily.toLowerCase().replace(/\s+/g, '-')}`;

  // If already loaded in head, skip
  if (document.getElementById(fontId)) return;

  try {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    // Load weight 400 (normal) and 700 (bold)
    link.href = `https://fonts.googleapis.com/css2?family=${normalizedFamily.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  } catch (err) {
    console.warn(`Failed to dynamically inject Google Font link for ${normalizedFamily}:`, err);
  }
};
