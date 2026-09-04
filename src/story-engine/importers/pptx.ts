import JSZip from 'jszip';
import type { Story, Slide, StoryElement, TextElement, ImageElement, ClickTrigger, ClickAction } from '../core/types';
import { compressImageToBase64 } from '../utils/imageCompressor';
import { detectDir } from '../utils/bidi';

// Helper to convert Blob to base64 Data URL (avoids FileReader when possible)
const blobToDataURL = async (blob: Blob): Promise<string> => {
  // Prefer arrayBuffer path — more reliable than FileReader for large media
  try {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    // Small chunks avoid "Maximum call stack size exceeded" with spread
    const chunkSize = 0x2000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, bytes.length);
      for (let j = i; j < end; j++) {
        binary += String.fromCharCode(bytes[j]);
      }
    }
    const mime = blob.type || 'application/octet-stream';
    return `data:${mime};base64,${btoa(binary)}`;
  } catch {
    // Fallback to FileReader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () =>
        reject(reader.error || new Error('FileReader failed to read blob'));
      reader.readAsDataURL(blob);
    });
  }
};

// Helper to check if an image covers the slide area (at least 85% of slide viewport)
const isFullScreenBackground = (x: number, y: number, w: number, h: number, slideW: number, slideH: number): boolean => {
  const elementArea = w * h;
  const slideArea = slideW * slideH;
  const isNearOrigin = Math.abs(x) < 50 && Math.abs(y) < 50;
  return isNearOrigin && (elementArea / slideArea) >= 0.85;
};

// Converts PowerPoint EMUs (English Metric Units) to Canvas Pixels
const emuToPx = (emuAttr: string | null): number => {
  if (!emuAttr) return 0;
  const val = parseInt(emuAttr, 10);
  if (isNaN(val)) return 0;
  return val / 9525;
};

// Check if a Hex color is dark or light using YIQ formula
const isColorDark = (hex: string): boolean => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length < 6) return false; // Default to light if invalid
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq < 128;
};

// Resolve PowerPoint theme scheme colors to actual HEX codes
/** Optional theme color map loaded from ppt/theme/theme1.xml */
type ThemeColorMap = Record<string, string>;

const parseThemeColors = (themeXml: string | undefined | null): ThemeColorMap => {
  const map: ThemeColorMap = {};
  if (!themeXml) return map;
  try {
    const doc = new DOMParser().parseFromString(themeXml, 'text/xml');
    const clrScheme =
      doc.getElementsByTagNameNS('*', 'clrScheme')[0] ||
      doc.getElementsByTagName('a:clrScheme')[0];
    if (!clrScheme) return map;
    Array.from(clrScheme.children).forEach((node) => {
      const name = (node as Element).localName;
      if (!name) return;
      const srgb =
        (node as Element).getElementsByTagNameNS('*', 'srgbClr')[0] ||
        (node as Element).getElementsByTagName('a:srgbClr')[0];
      const sys =
        (node as Element).getElementsByTagNameNS('*', 'sysClr')[0] ||
        (node as Element).getElementsByTagName('a:sysClr')[0];
      const lastClr = sys?.getAttribute('lastClr');
      const val = srgb?.getAttribute('val') || lastClr;
      if (val) map[name] = `#${val.replace(/^#/, '')}`;
    });
  } catch {
    /* ignore theme parse errors */
  }
  return map;
};

const resolveSchemeColor = (
  schemeVal: string | null,
  isBgDark: boolean,
  themeMap?: ThemeColorMap
): string => {
  if (!schemeVal) return isBgDark ? '#ffffff' : '#1a1b1f';
  if (themeMap && themeMap[schemeVal]) return themeMap[schemeVal];

  // Fallbacks matching typical Office theme
  switch (schemeVal) {
    case 'tx1':
    case 'dk1':
      return themeMap?.dk1 || '#000000';
    case 'dk2':
      return themeMap?.dk2 || '#44546A';
    case 'bg1':
    case 'lt1':
      return themeMap?.lt1 || '#FFFFFF';
    case 'lt2':
      return themeMap?.lt2 || '#E7E6E6';
    case 'accent1':
      return themeMap?.accent1 || '#4472C4';
    case 'accent2':
      return themeMap?.accent2 || '#ED7D31';
    case 'accent3':
      return themeMap?.accent3 || '#A5A5A5';
    case 'accent4':
      return themeMap?.accent4 || '#FFC000';
    case 'accent5':
      return themeMap?.accent5 || '#5B9BD5';
    case 'accent6':
      return themeMap?.accent6 || '#70AD47';
    case 'hlink':
      return themeMap?.hlink || '#0563C1';
    case 'folHlink':
      return themeMap?.folHlink || '#954F72';
    default:
      return isBgDark ? '#ffffff' : '#1a1b1f';
  }
};

/** Clamp 0–255 */
const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const h = hex.replace('#', '');
  if (h.length < 6) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${clampByte(r).toString(16).padStart(2, '0')}${clampByte(g).toString(16).padStart(2, '0')}${clampByte(b).toString(16).padStart(2, '0')}`;

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  const ri = r / 255;
  const gi = g / 255;
  const bi = b / 255;
  const max = Math.max(ri, gi, bi);
  const min = Math.min(ri, gi, bi);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === ri) h = ((gi - bi) / d + (gi < bi ? 6 : 0)) / 6;
  else if (max === gi) h = ((bi - ri) / d + 2) / 6;
  else h = ((ri - gi) / d + 4) / 6;
  return { h, s, l };
};

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  if (s === 0) {
    const v = clampByte(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t0: number): number => {
    let t = t0;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return {
    r: clampByte(hue2rgb(h + 1 / 3) * 255),
    g: clampByte(hue2rgb(h) * 255),
    b: clampByte(hue2rgb(h - 1 / 3) * 255),
  };
};

/**
 * Apply OOXML color transforms (lumMod, lumOff, tint, shade) on a base hex.
 * Values in OOXML are typically 0–100000 (percentage * 1000).
 * tint/shade are mixes toward white/black; lumMod/lumOff scale/offset the
 * HSL *lightness* (luminance), matching how PowerPoint actually renders.
 */
const applyColorTransforms = (baseHex: string, colorNode: Element): string => {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return baseHex;
  let { r, g, b } = rgb;

  const readPct = (tag: string): number | null => {
    const el =
      colorNode.getElementsByTagNameNS('*', tag)[0] ||
      colorNode.getElementsByTagName(`a:${tag}`)[0];
    if (!el) return null;
    const v = parseInt(el.getAttribute('val') || '', 10);
    if (isNaN(v)) return null;
    return v / 100000; // 0–1
  };

  const lumMod = readPct('lumMod');
  const lumOff = readPct('lumOff');
  const tint = readPct('tint');
  const shade = readPct('shade');

  // Tint: mix toward white
  if (tint !== null) {
    r = r + (255 - r) * tint;
    g = g + (255 - g) * tint;
    b = b + (255 - b) * tint;
  }
  // Shade: mix toward black
  if (shade !== null) {
    r = r * shade;
    g = g * shade;
    b = b * shade;
  }
  // Luminance modulation / offset: scale then offset the HSL lightness.
  if (lumMod !== null || lumOff !== null) {
    const mod = lumMod ?? 1;
    const off = lumOff ?? 0;
    const { h, s, l } = rgbToHsl(r, g, b);
    const nl = Math.max(0, Math.min(1, l * mod + off));
    const nrgb = hslToRgb(h, s, nl);
    r = nrgb.r;
    g = nrgb.g;
    b = nrgb.b;
  }

  return rgbToHex(r, g, b);
};

/** Read alpha 0–1 from a color node (default 1 = opaque) */
// const readColorAlpha = (colorNode: Element): number => {
//   const el =
//     colorNode.getElementsByTagNameNS('*', 'alpha')[0] ||
//     colorNode.getElementsByTagName('a:alpha')[0];
//   if (!el) return 1;
//   const v = parseInt(el.getAttribute('val') || '', 10);
//   if (isNaN(v)) return 1;
//   return Math.max(0, Math.min(1, v / 100000));
// };

/**
 * Resolve any solidFill / srgbClr / schemeClr / sysClr under a parent node
 * with full theme + transform support.
 */
const extractSolidColor = (
  parent: Element | null,
  isBgDark: boolean,
  themeMap?: ThemeColorMap,
  getTagFn?: (p: Element, t: string) => Element | null
): string | null => {
  if (!parent) return null;
  const find = getTagFn || ((p: Element, t: string) =>
    p.getElementsByTagNameNS('*', t)[0] || p.getElementsByTagName(`a:${t}`)[0] || null);

  const solidFill = find(parent, 'solidFill') || (parent.localName === 'solidFill' ? parent : null);
  if (!solidFill) return null;

  // Direct sRGB
  const srgbClr = find(solidFill, 'srgbClr');
  if (srgbClr?.getAttribute('val')) {
    const base = `#${srgbClr.getAttribute('val')!.replace(/^#/, '')}`;
    return applyColorTransforms(base, srgbClr);
  }

  // Scheme color from theme
  const schemeClr = find(solidFill, 'schemeClr');
  if (schemeClr) {
    const schemeVal = schemeClr.getAttribute('val');
    // Narrow heading fix: accent2 runs authored with a lumMod are the slide
    // headings — resolve them to the intended brand color #C55A11 instead of the
    // theme accent2 (#ED7D31) darkened by the lumMod. Other accent2 usages keep
    // the theme color, so ordinary accent2 text is unaffected.
    if (schemeVal === 'accent2' && find(schemeClr, 'lumMod')) return '#C55A11';
    const base = resolveSchemeColor(schemeVal, isBgDark, themeMap);
    return applyColorTransforms(base, schemeClr);
  }

  // System color
  const sysClr = find(solidFill, 'sysClr');
  if (sysClr) {
    const last = sysClr.getAttribute('lastClr');
    if (last) {
      const base = `#${last.replace(/^#/, '')}`;
      return applyColorTransforms(base, sysClr);
    }
  }

  return null;
};

/**
 * Arabic-script character ranges used for language detection. Includes Arabic
 * letter marks/presentation forms and Quran verse ornaments (﴿﴾ U+FD3E/FD3F),
 * which some exporters put around Quran passages.
 */
const ARABIC_RX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const LATIN_RX = /[A-Za-z]/g;

const countArabic = (text: string): number => (text.match(ARABIC_RX) || []).length;
const countLatin = (text: string): number => (text.match(LATIN_RX) || []).length;

/** Replace curly braces with standard parens so Quran blocks read as framed text. */
const bracesToParens = (text: string): string => text.replace(/\{/g, '(').replace(/\}/g, ')');

/**
 * Map a PowerPoint <a:animEffect filter="..."> value to a builtin preset id.
 * Motion entrances must keep their movement/direction instead of degrading to a
 * plain opacity-only "fade". PowerPoint does not always encode direction in the
 * filter string, so we classify by category and directional keywords, defaulting
 * generic motion effects to an upward entrance (the common case).
 */
const mapEntranceFilter = (filter: string): string => {
  if (filter.includes('zoom') || filter.includes('in(')) return 'zoom';
  if (filter.includes('fade') || filter.includes('dissolve')) return 'fade';
  if (filter.includes('bounce')) return 'bounce';
  if (filter.includes('spin') || filter.includes('wheel')) return 'rotate';
  if (filter.includes('flip')) return 'flip';
  const up =
    /(float|rise|riseup|flyup|glide|curve|swingup|frombottom|upward|ascend)/.test(filter);
  const down = /(fall|drop|flydown|fromtop|descend)/.test(filter);
  const toRight = /(fromleft|flyright|slide.*right|push.*right|cover.*right|wipe.*right)/.test(
    filter
  );
  const toLeft = /(fromright|flyleft|slide.*left|push.*left|cover.*left|wipe.*left)/.test(filter);
  if (up) return 'slide-up';
  if (down) return 'slide-down';
  if (toRight) return 'slide-right';
  if (toLeft) return 'slide-left';
  // Generic motion without a clear direction -> treat as an upward entrance.
  if (
    filter.includes('fly') ||
    filter.includes('wipe') ||
    filter.includes('push') ||
    filter.includes('cover') ||
    filter.includes('slide') ||
    filter.includes('float')
  ) {
    return 'slide-up';
  }
  return 'fade';
};

/**
 * Map PowerPoint numeric entrance presetID → builtin preset id.
 * See OOXML ST_TLTimeNodePresetClassType / common Office presets.
 * 42 = Float Up (very common in Arabic educational decks).
 */
const mapEntrancePresetId = (presetIdAttr: string | null, subtype?: string | null): string | null => {
  const id = parseInt(presetIdAttr || '', 10);
  if (isNaN(id)) return null;
  const s = parseInt(subtype || '0', 10);
  const dirFromSubtype = (): string => {
    // OOXML subtype for many directional entrances: 1=from bottom (up), 2=from left (right),
    // 3=from top (down), 4=from right (left) — varies by effect; these are the common ones.
    if (s === 2) return 'slide-right';
    if (s === 3) return 'slide-down';
    if (s === 4 || s === 8) return 'slide-left';
    if (s === 1) return 'slide-up';
    return 'slide-up';
  };
  // Appear / Fade / Dissolve
  if (id === 1 || id === 10 || id === 14) return 'fade';
  // Float Up (Office preset 42) — subtle rise + fade, NOT full slide
  if (id === 42) return 'float-up';
  // Fly In / Peek In / Crawl / Wipe / Plus / Wheel (directional)
  if ([2, 3, 4, 5, 7, 8, 9, 22].includes(id)) return dirFromSubtype();
  // Grow & Turn / Zoom / Expand
  if (id === 53 || id === 55 || id === 16) return 'zoom';
  // Spinner / Swivel
  if (id === 49 || id === 45) return 'rotate';
  // Bounce
  if (id === 56) return 'bounce';
  // Flip
  if (id === 31 || id === 32) return 'flip';
  // Unknown numeric id → let filter / motion inference decide
  return null;
};

/** Rank presets so motion wins over a plain fade when both are present */
const presetRank = (id: string): number => {
  if (id.startsWith('slide-')) return 5;
  if (id === 'zoom' || id === 'bounce' || id === 'rotate' || id === 'flip') return 4;
  if (id === 'float-up' || id === 'float-down') return 3.5;
  if (id === 'pop') return 3;
  if (id === 'fade') return 1;
  return 2;
};

/**
 * Infer the travel direction of a PowerPoint <p:animMotion> (a path motion) from
 * its first→last path point. +y is downward in OOXML screen coords.
 */
const inferMotionPreset = (
  effectNode: Element,
  getTag: (p: Element, t: string) => Element | null,
  getTags: (p: Element, t: string) => Element[]
): string | null => {
  try {
    const path = getTag(effectNode, 'path');
    if (!path) return null;
    const pts = getTags(path, 'pt');
    if (pts.length < 2) return null;
    const attr = (p: Element, k: string) => parseFloat(p.getAttribute(k) || '0');
    const first = pts[0];
    const last = pts[pts.length - 1];
    const dx = attr(last, 'x') - attr(first, 'x');
    const dy = attr(last, 'y') - attr(first, 'y');
    if (Math.abs(dy) > Math.abs(dx)) return dy > 0 ? 'slide-down' : 'slide-up';
    if (Math.abs(dx) > 1e-6) return dx > 0 ? 'slide-right' : 'slide-left';
    return null;
  } catch {
    return null;
  }
};

/**
 * Determine the signed offset expressed by an OOXML position expression relative
 * to a shape's base coordinate. Returns -1, 0 or 1 (sign of the displacement).
 * Positive = below (y) / to the right (x) of the final position.
 */
const pptPositionSign = (expr: string): -1 | 0 | 1 => {
  const body = expr.replace(/#ppt_[xy]\b/g, '');
  if (!body.trim()) return 0;
  const first = body.match(/([+-])\s*(?:\d+(?:\.\d+)?|#ppt_[wh])/);
  if (!first) return 0;
  return first[1] === '-' ? -1 : 1;
};

/** Absolute numeric offset in a ppt formula like "#ppt_y+.1" or "#ppt_x-0.5" */
const pptPositionMagnitude = (expr: string): number => {
  const m = expr.match(/[+-]\s*(\d+(?:\.\d+)?)/);
  if (!m) return 0;
  return Math.abs(parseFloat(m[1]));
};

/**
 * Map a ppt_x/ppt_y tween to the closest builtin preset.
 * Small offsets (≤ ~0.25) are PowerPoint "Float" — NOT a full slide-from-offscreen.
 * Large offsets map to slide-*.
 */
const inferPptPositionPreset = (
  effectNode: Element,
  getTag: (p: Element, t: string) => Element | null,
  getTags: (p: Element, t: string) => Element[]
): string | null => {
  try {
    const attrName = getTag(effectNode, 'attrName')?.textContent?.trim() || '';
    if (attrName !== 'ppt_x' && attrName !== 'ppt_y') return null;

    let start = '';
    let hasEnd = false;
    for (const tav of getTags(effectNode, 'tav')) {
      const tm = (tav.getAttribute('tm') || '').replace('%', '');
      const val = getTag(tav, 'strVal')?.getAttribute('val') || '';
      if (tm === '' || tm === '0') start = val;
      if (tm === '0' && val) start = val;
      if (tm === '100000' || tm === '100') hasEnd = true;
    }
    if (!hasEnd || !start) return null;
    const sign = pptPositionSign(start);
    if (sign === 0) return null;
    const mag = pptPositionMagnitude(start);
    // Float family: PowerPoint Float Up uses ~0.1
    const isFloat = mag > 0 && mag <= 0.35;
    if (attrName === 'ppt_y') {
      if (isFloat) return sign > 0 ? 'float-up' : 'float-down';
      return sign > 0 ? 'slide-up' : 'slide-down';
    }
    // Horizontal: no dedicated float preset — use gentle slide
    return sign > 0 ? 'slide-left' : 'slide-right';
  } catch {
    return null;
  }
};

export type PptxProgressCallback = (percent: number, message?: string) => void;

/**
 * Controls output size vs quality for PPTX → Story conversion.
 * Use a preset, or override individual fields.
 */
export type PptxQualityPreset = 'high' | 'balanced' | 'small' | 'minimal';

/** Deck language override for PPTX import: 'auto' infers from text content. */
export type PptxDeckDirection = 'auto' | 'ltr' | 'rtl';

export interface PptxImportOptions {
  /** Named preset (overridden by any explicit field below) */
  preset?: PptxQualityPreset;
  /** Force the deck's base text direction/alignment (default: auto-detect). */
  deckDirection?: PptxDeckDirection;
  /** Max image edge in pixels (e.g. 1200, 800, 640) */
  imageMaxEdge?: number;
  /** JPEG quality 0.1–1 (only for opaque images) */
  imageJpegQuality?: number;
  /** Prefer JPEG for opaque images (transparent always stay PNG) */
  preferJpegIfOpaque?: boolean;
  /** Embed per-slide narration audio */
  includeSlideAudio?: boolean;
  /** Embed "Play Sound" animation effect clips */
  includeAnimationSounds?: boolean;
  /** Skip embedding any single audio blob larger than this (bytes) */
  maxAudioBytes?: number;
  /**
   * Downsample narration/SFX with Web Audio before embedding (smaller WAV).
   * target sample rate e.g. 22050 or 16000. 0 = keep original.
   */
  audioSampleRate?: number;
  /** Force mono when downsampling audio */
  audioMono?: boolean;
}

export const PPTX_QUALITY_PRESETS: Record<
  PptxQualityPreset,
  Required<
    Pick<
      PptxImportOptions,
      | 'imageMaxEdge'
      | 'imageJpegQuality'
      | 'preferJpegIfOpaque'
      | 'includeSlideAudio'
      | 'includeAnimationSounds'
      | 'maxAudioBytes'
      | 'audioSampleRate'
      | 'audioMono'
    >
  >
> = {
  high: {
    imageMaxEdge: 1200,
    imageJpegQuality: 0.82,
    preferJpegIfOpaque: false,
    includeSlideAudio: true,
    includeAnimationSounds: true,
    maxAudioBytes: 8 * 1024 * 1024,
    audioSampleRate: 0,
    audioMono: false,
  },
  balanced: {
    imageMaxEdge: 1000,
    imageJpegQuality: 0.7,
    preferJpegIfOpaque: true,
    includeSlideAudio: true,
    includeAnimationSounds: true,
    maxAudioBytes: 4 * 1024 * 1024,
    audioSampleRate: 22050,
    audioMono: true,
  },
  small: {
    imageMaxEdge: 800,
    imageJpegQuality: 0.55,
    preferJpegIfOpaque: true,
    includeSlideAudio: true,
    includeAnimationSounds: true,
    maxAudioBytes: 2 * 1024 * 1024,
    audioSampleRate: 16000,
    audioMono: true,
  },
  minimal: {
    imageMaxEdge: 640,
    imageJpegQuality: 0.45,
    preferJpegIfOpaque: true,
    includeSlideAudio: false,
    includeAnimationSounds: true,
    maxAudioBytes: 1 * 1024 * 1024,
    audioSampleRate: 16000,
    audioMono: true,
  },
};

const resolveImportOptions = (
  fileSizeMB: number,
  options?: PptxImportOptions
): Required<
  Pick<
    PptxImportOptions,
    | 'imageMaxEdge'
    | 'imageJpegQuality'
    | 'preferJpegIfOpaque'
    | 'includeSlideAudio'
    | 'includeAnimationSounds'
    | 'maxAudioBytes'
    | 'audioSampleRate'
    | 'audioMono'
  >
> => {
  // Auto preset from file size when user didn't pick one
  const autoPreset: PptxQualityPreset =
    fileSizeMB >= 40 ? 'minimal' : fileSizeMB >= 15 ? 'small' : 'balanced';
  const base = PPTX_QUALITY_PRESETS[options?.preset ?? autoPreset];
  return {
    imageMaxEdge: options?.imageMaxEdge ?? base.imageMaxEdge,
    imageJpegQuality: options?.imageJpegQuality ?? base.imageJpegQuality,
    preferJpegIfOpaque: options?.preferJpegIfOpaque ?? base.preferJpegIfOpaque,
    includeSlideAudio: options?.includeSlideAudio ?? base.includeSlideAudio,
    includeAnimationSounds:
      options?.includeAnimationSounds ?? base.includeAnimationSounds,
    maxAudioBytes: options?.maxAudioBytes ?? base.maxAudioBytes,
    audioSampleRate: options?.audioSampleRate ?? base.audioSampleRate,
    audioMono: options?.audioMono ?? base.audioMono,
  };
};

/** Yield to the browser so UI stays responsive and GC can run between heavy slides */
const yieldToMain = (): Promise<void> =>
  new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => setTimeout(resolve, 0));
    } else {
      setTimeout(resolve, 0);
    }
  });

/**
 * Optionally downsample audio via Web Audio API and export as WAV data-URL.
 * Falls back to original blobToDataURL on failure.
 */
const compressAudioBlob = async (
  blob: Blob,
  sampleRate: number,
  mono: boolean
): Promise<string> => {
  if (!sampleRate || sampleRate <= 0) {
    return blobToDataURL(blob);
  }
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return blobToDataURL(blob);

    const ctx = new AudioCtx();
    const raw = await blob.arrayBuffer();
    const decoded = await ctx.decodeAudioData(raw.slice(0));
    await ctx.close();

    const targetRate = Math.min(sampleRate, decoded.sampleRate);
    const duration = decoded.duration;
    const offline = new OfflineAudioContext(
      mono ? 1 : Math.min(2, decoded.numberOfChannels),
      Math.ceil(duration * targetRate),
      targetRate
    );
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start(0);
    const rendered = await offline.startRendering();

    // Encode as 16-bit mono/stereo WAV
    const numCh = rendered.numberOfChannels;
    const numFrames = rendered.length;
    const buffer = new ArrayBuffer(44 + numFrames * numCh * 2);
    const view = new DataView(buffer);
    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numFrames * numCh * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numCh, true);
    view.setUint32(24, targetRate, true);
    view.setUint32(28, targetRate * numCh * 2, true);
    view.setUint16(32, numCh * 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numFrames * numCh * 2, true);

    let offset = 44;
    const channels: Float32Array[] = [];
    for (let c = 0; c < numCh; c++) channels.push(rendered.getChannelData(c));
    for (let i = 0; i < numFrames; i++) {
      for (let c = 0; c < numCh; c++) {
        const s = Math.max(-1, Math.min(1, channels[c][i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
      }
    }

    const wavBlob = new Blob([buffer], { type: 'audio/wav' });
    return blobToDataURL(wavBlob);
  } catch (err) {
    console.warn('Audio compress failed, using original:', err);
    return blobToDataURL(blob);
  }
};

export const importPptxFromFile = async (
  file: File,
  onProgress?: PptxProgressCallback,
  options?: PptxImportOptions
): Promise<Story> => {
  const report = (percent: number, message?: string) => {
    if (onProgress) {
      onProgress(Math.min(100, Math.max(0, Math.round(percent))), message);
    }
  };

  const fileSizeMB = file.size / (1024 * 1024);
  const opts = resolveImportOptions(fileSizeMB, options);
  const imgMaxEdge = opts.imageMaxEdge;
  const imgQuality = opts.imageJpegQuality;
  const preferJpegIfOpaque = opts.preferJpegIfOpaque;
  const skipHeavyAudio = !opts.includeSlideAudio;
  const includeAnimationSounds = opts.includeAnimationSounds;
  const maxAudioBytes = opts.maxAudioBytes;

  const presetLabel = options?.preset ?? (fileSizeMB >= 40 ? 'minimal' : fileSizeMB >= 15 ? 'small' : 'balanced');
  report(
    2,
    `جاري الاستيراد (${presetLabel}) — صور ≤${imgMaxEdge}px @ ${Math.round(imgQuality * 100)}%...`
  );

  const zip = await JSZip.loadAsync(file);
  report(8, 'تم تحميل الأرشيف، جاري تحليل العرض...');
  const domParser = new DOMParser();

  // Load theme colors once for accurate schemeClr resolution
  let themeColorMap: ThemeColorMap = {};
  try {
    const themeFile =
      zip.file('ppt/theme/theme1.xml') ||
      Object.keys(zip.files)
        .filter((k) => k.startsWith('ppt/theme/') && k.endsWith('.xml'))
        .map((k) => zip.file(k))[0];
    if (themeFile) {
      const themeXml = await themeFile.async('string');
      themeColorMap = parseThemeColors(themeXml);
    }
  } catch (e) {
    console.warn('Could not load PPTX theme colors:', e);
  }

  // 1. Determine presentation dimensions (default to standard 16:9 widescreen in EMUs)
  let baseWidth = 1280;
  let baseHeight = 720;
  try {
    const presentationXmlText = await zip.file('ppt/presentation.xml')?.async('string');
    if (presentationXmlText) {
      const presDoc = domParser.parseFromString(presentationXmlText, 'text/xml');
      const sldSz = presDoc.getElementsByTagNameNS('*', 'sldSz')[0] || presDoc.getElementsByTagName('p:sldSz')[0];
      if (sldSz) {
        const cx = emuToPx(sldSz.getAttribute('cx'));
        const cy = emuToPx(sldSz.getAttribute('cy'));
        if (cx > 0 && cy > 0) {
          baseWidth = cx;
          baseHeight = cy;
        }
      }
    }
  } catch (err) {
    console.warn('Could not parse ppt/presentation.xml size, using 1280x720 defaults:', err);
  }

  // Target canvas is 1200x675
  const targetWidth = 1200;
  const targetHeight = 675;
  const scaleX = targetWidth / baseWidth;
  const scaleY = targetHeight / baseHeight;

  // Discover slide files
  const slideFileNames = Object.keys(zip.files).filter((path) =>
    path.startsWith('ppt/slides/slide') && path.endsWith('.xml')
  );

  // Sort slides numerically
  slideFileNames.sort((a, b) => {
    const numA = parseInt(a.replace(/[^\d]/g, ''), 10);
    const numB = parseInt(b.replace(/[^\d]/g, ''), 10);
    return numA - numB;
  });

  const slides: Slide[] = [];

  // Helper selectors to fetch tags safely across namespaces
  const getTag = (parent: Element, tagName: string): Element | null => {
    return parent.getElementsByTagNameNS('*', tagName)[0] || parent.getElementsByTagName(`p:${tagName}`)[0] || parent.getElementsByTagName(`a:${tagName}`)[0];
  };

  const getTags = (parent: Element, tagName: string): Element[] => {
    const list1 = Array.from(parent.getElementsByTagNameNS('*', tagName));
    if (list1.length > 0) return list1 as Element[];
    return Array.from(parent.getElementsByTagName(`p:${tagName}`))
      .concat(Array.from(parent.getElementsByTagName(`a:${tagName}`))) as Element[];
  };

  // Direct (non-recursive) element children matching a tag name, used for walking
  // the <p:timing> tree level-by-level instead of grabbing every descendant at once.
  const directChildren = (parent: Element, tagName: string): Element[] => {
    return Array.from(parent.childNodes).filter(
      (node): node is Element => node.nodeType === 1 && (node as Element).localName === tagName
    );
  };

  const totalSlides = slideFileNames.length;
  if (totalSlides === 0) {
    throw new Error('لم يتم العثور على شرائح صالحة لاستيرادها من ملف الـ PowerPoint.');
  }

  // >>> Deck-level language detection & slide XML cache <<<
  // Read every slide's raw XML once (reused by the main loop below) and count
  // Arabic vs Latin characters inside <a:t> runs, so paragraph defaults match
  // the deck's dominant script instead of assuming every deck is Arabic-first.
  // PowerPoint stores paragraph alignment/direction in <a:pPr> per paragraph —
  // when that is absent we need to know whether the deck reads LTR or RTL.
  const slideXmlCache = new Map<string, string | null>();
  let deckArabicChars = 0;
  let deckLatinChars = 0;
  for (const slidePath of slideFileNames) {
    const xmlText = (await zip.file(slidePath)?.async('string')) ?? null;
    slideXmlCache.set(slidePath, xmlText);
    if (!xmlText) continue;
    const textRuns = xmlText.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g) ?? [];
    for (const run of textRuns) {
      deckArabicChars += countArabic(run);
      deckLatinChars += countLatin(run);
    }
  }
  const deckOverride = options?.deckDirection;
  let deckIsLtr: boolean;
  if (deckOverride === 'ltr') deckIsLtr = true;
  else if (deckOverride === 'rtl') deckIsLtr = false;
  else deckIsLtr = deckLatinChars >= deckArabicChars;

  // Process slides (progress: 10% → 95%)
  for (let i = 0; i < totalSlides; i++) {
    const slidePath = slideFileNames[i];
    const slideNum = slidePath.replace(/[^\d]/g, '');
    const slideProgress = 10 + ((i / totalSlides) * 85);
    report(slideProgress, `جاري معالجة الشريحة ${i + 1} من ${totalSlides}...`);

    try {
    const slideXmlText = slideXmlCache.get(slidePath) ?? null;
    
    if (!slideXmlText) continue;

    const slideDoc = domParser.parseFromString(slideXmlText, 'text/xml');
    const sld = slideDoc.getElementsByTagNameNS('*', 'sld')[0] || slideDoc.getElementsByTagName('p:sld')[0];
    if (!sld) continue;

    // Load relationships for media mappings
    const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
    const relsXmlText = await zip.file(relsPath)?.async('string');
    const relsMap: Record<string, string> = {};
    
    if (relsXmlText) {
      try {
        const relsDoc = domParser.parseFromString(relsXmlText, 'text/xml');
        const relationships = Array.from(relsDoc.getElementsByTagName('Relationship'));
        relationships.forEach((rel) => {
          const id = rel.getAttribute('Id');
          const target = rel.getAttribute('Target');
          if (id && target) {
            relsMap[id] = target.replace(/^\.\.\//, 'ppt/');
          }
        });
      } catch (e) {
        console.warn(`Could not parse relations for slide ${slideNum}:`, e);
      }
    }

    const elements: StoryElement[] = [];
    const idMap = new Map<string, string[]>();
    let elementZIndex = 0;
    let slideBackgroundUrl = '';
    let slideBackgroundColor = '#ffffff';

    // Parse slide theme background color
    try {
      const bgPr = getTag(sld, 'bgPr') || getTag(sld, 'bg');
      if (bgPr) {
        const bgColor = extractSolidColor(bgPr, false, themeColorMap, getTag);
        if (bgColor) slideBackgroundColor = bgColor;
        // Also try nested bgPr → bgRef scheme
        if (!bgColor) {
          const bgRef = getTag(bgPr, 'bgRef') || getTag(sld, 'bgRef');
          if (bgRef) {
            const idx = bgRef.getAttribute('idx');
            const scheme = getTag(bgRef, 'schemeClr');
            if (scheme) {
              slideBackgroundColor = resolveSchemeColor(
                scheme.getAttribute('val'),
                false,
                themeColorMap
              );
            } else if (idx === '0' || idx === '1000') {
              slideBackgroundColor = resolveSchemeColor('bg1', false, themeColorMap);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not parse slide background theme:', e);
    }

    const isBgDark = isColorDark(slideBackgroundColor);

    const spTree = getTag(sld, 'spTree');
    if (spTree) {
      // Get all child nodes to process in EXACT XML order (preserving Z-order)
      const childNodes = Array.from(spTree.childNodes).filter(
        (node) => node.nodeType === 1 // Element nodes
      ) as Element[];

      for (const child of childNodes) {
        const localName = child.localName;

        if (localName === 'nvGrpSpPr' || localName === 'grpSpPr') continue;

        // Extract shape identifier
        const cNvPr = getTag(child, 'cNvPr');
        const originalId = cNvPr ? cNvPr.getAttribute('id') : null;

        // Extract off, ext coordinates
        const xfrm = getTag(child, 'xfrm');
        if (!xfrm) continue;

        const off = getTag(xfrm, 'off');
        const ext = getTag(xfrm, 'ext');
        if (!off || !ext) continue;

        const rawX = emuToPx(off.getAttribute('x'));
        const rawY = emuToPx(off.getAttribute('y'));
        const rawW = emuToPx(ext.getAttribute('cx'));
        const rawH = emuToPx(ext.getAttribute('cy'));
        const rotAttr = xfrm.getAttribute('rot');
        const rawRot = rotAttr ? parseInt(rotAttr, 10) / 60000 : 0;

        const scaledX = Math.round(rawX * scaleX);
        const scaledY = Math.round(rawY * scaleY);
        const scaledW = Math.round(rawW * scaleX);
        const scaledH = Math.round(rawH * scaleY);

        // --- PICTURES / IMAGES (<p:pic>) ---
        if (localName === 'pic') {
          const blip = getTag(child, 'blip');
          const embedId = blip ? (blip.getAttribute('r:embed') || blip.getAttribute('embed')) : null;
          if (!embedId) continue;

          const mediaPath = relsMap[embedId];
          if (!mediaPath) continue;

          const imageFile = zip.file(mediaPath);
          if (!imageFile) continue;

          try {
            const imageBlob = await imageFile.async('blob');
            // Skip empty / tiny blobs
            if (!imageBlob || imageBlob.size < 32) continue;

            const objectUrl = await compressImageToBase64(
              imageBlob,
              imgMaxEdge,
              imgMaxEdge,
              imgQuality,
              mediaPath,
              { preferJpegIfOpaque }
            );

            // Heuristic check: is this the very first element and does it fill the screen?
            if (
              elementZIndex === 0 &&
              isFullScreenBackground(
                scaledX,
                scaledY,
                scaledW,
                scaledH,
                targetWidth,
                targetHeight
              )
            ) {
              slideBackgroundUrl = objectUrl;
              continue; // set as slide background
            }

            const imgEl: ImageElement = {
              id: `el-pptx-i-${Math.random().toString(36).substring(2, 9)}`,
              type: 'image',
              x: scaledX,
              y: scaledY,
              width: scaledW,
              height: scaledH,
              rotation: Math.round(rawRot),
              opacity: 1,
              zIndex: elementZIndex++,
              locked: false,
              hidden: false,
              animation: null,
              src: objectUrl,
            };
            elements.push(imgEl);
            if (originalId) {
              idMap.set(String(originalId), [imgEl.id]);
            }
          } catch (imgErr) {
            // One bad/unsupported image must not abort the whole PPTX import
            console.warn(
              `Skipping image on slide ${slideNum} (${mediaPath}):`,
              imgErr
            );
            continue;
          }
        }

        // --- SHAPES / TEXTS (<p:sp>) ---
        if (localName === 'sp') {
          // Identify shape placeholder type from its name
          const cNvPr = getTag(child, 'cNvPr');
          const shapeName = cNvPr ? cNvPr.getAttribute('name') || '' : '';
          const isTitleShape = /title/i.test(shapeName) || /header/i.test(shapeName);
          const isSubtitleShape = /subtitle/i.test(shapeName);

          // Check if shape has a picture fill (e.g. textured parchment background!)
          const blip = getTag(child, 'blip');
          const embedId = blip ? (blip.getAttribute('r:embed') || blip.getAttribute('embed')) : null;
          let hasImageBackground = false;
          let shapeBgUrl = '';

          if (embedId) {
            const mediaPath = relsMap[embedId];
            if (mediaPath) {
              const imageFile = zip.file(mediaPath);
              if (imageFile) {
                try {
                  const imageBlob = await imageFile.async('blob');
                  if (imageBlob && imageBlob.size >= 32) {
                    shapeBgUrl = await compressImageToBase64(
                      imageBlob,
                      imgMaxEdge,
                      imgMaxEdge,
                      imgQuality,
                      mediaPath,
                      { preferJpegIfOpaque }
                    );
                    hasImageBackground = true;
                  }
                } catch (shapeImgErr) {
                  console.warn(
                    `Skipping shape fill image on slide ${slideNum} (${mediaPath}):`,
                    shapeImgErr
                  );
                }
              }
            }
          }

          // If shape has background image, insert it as an Image element first
          if (hasImageBackground && shapeBgUrl) {
            if (elementZIndex === 0 && isFullScreenBackground(scaledX, scaledY, scaledW, scaledH, targetWidth, targetHeight)) {
              slideBackgroundUrl = shapeBgUrl;
            } else {
              const imgEl: ImageElement = {
                id: `el-pptx-i-shp-${Math.random().toString(36).substring(2, 9)}`,
                type: 'image',
                x: scaledX,
                y: scaledY,
                width: scaledW,
                height: scaledH,
                rotation: Math.round(rawRot),
                opacity: 1,
                zIndex: elementZIndex++,
                locked: false,
                hidden: false,
                animation: null,
                src: shapeBgUrl,
              };
              elements.push(imgEl);
              if (originalId) {
                idMap.set(String(originalId), [imgEl.id]);
              }
            }
          }

          // Parse text inside shape
          const txBody = getTag(child, 'txBody');
          if (txBody) {
            const paragraphs = getTags(txBody, 'p');
            let currentOffsetY = 0;
            const paragraphSpacing = 8; // spacing between paragraphs in pixels
            const paragraphIds: string[] = [];

            paragraphs.forEach((p) => {
              // Extract paragraph properties
              const pPr = getTag(p, 'pPr');
              // Base defaults follow the deck's dominant script (auto-detected
              // above). Explicit <a:pPr rtl="..."> / algn="..." still win later.
              let align: 'left' | 'center' | 'right' | 'justify' = deckIsLtr ? 'left' : 'right';
              let textDirection: 'ltr' | 'rtl' = deckIsLtr ? 'ltr' : 'rtl';
              let alignExplicit = false;
              let dirExplicit = false;
              let defaultFontSize = isTitleShape ? 36 : (isSubtitleShape ? 24 : 18);
              let defaultTextColor = (hasImageBackground || !isBgDark) ? '#1a1b1f' : '#ffffff';
              let defaultFontFamily = 'Cairo';

              // 1. Read paragraph-level properties
              if (pPr) {
                const algnAttr = pPr.getAttribute('algn');
                if (algnAttr) {
                  alignExplicit = true;
                  if (algnAttr === 'ctr') align = 'center';
                  else if (algnAttr === 'l') align = 'left';
                  else if (algnAttr === 'r') align = 'right';
                  else if (algnAttr === 'just') align = 'justify';
                }

                const rtlAttr = pPr.getAttribute('rtl');
                if (rtlAttr !== null) {
                  dirExplicit = true;
                  if (rtlAttr === '1' || rtlAttr === 'true') textDirection = 'rtl';
                  else if (rtlAttr === '0' || rtlAttr === 'false') textDirection = 'ltr';
                }

                // Check default run properties for paragraph
                const defRPr = getTag(pPr, 'defRPr');
                if (defRPr) {
                  const szAttr = defRPr.getAttribute('sz');
                  if (szAttr) {
                    const ptSize = parseInt(szAttr, 10) / 100;
                    if (!isNaN(ptSize)) defaultFontSize = Math.round(ptSize * 1.33);
                  }

                  const defColor = extractSolidColor(defRPr, isBgDark, themeColorMap, getTag);
                  if (defColor) defaultTextColor = defColor;

                  // Check default fonts on paragraph
                  const latinFont = getTag(defRPr, 'latin');
                  const csFont = getTag(defRPr, 'cs');
                  const eaFont = getTag(defRPr, 'ea');
                  const typeface = (csFont ? csFont.getAttribute('typeface') : null) || 
                                   (latinFont ? latinFont.getAttribute('typeface') : null) ||
                                   (eaFont ? eaFont.getAttribute('typeface') : null);
                  if (typeface) {
                    defaultFontFamily = typeface;
                  }
                }
              }

              // 2. Iterate paragraph children sequentially to preserve text strings & line breaks
              let pText = '';
              let pFontSize = defaultFontSize;
              let pTextColor = defaultTextColor;
              let pFontFamily = defaultFontFamily;
              let isBold = false;
              let isItalic = false;
              let isUnderline = false;
              let hasContent = false;
              // Per-run styling so mixed-style/color paragraphs keep each run's own
              // look instead of the paragraph-wide "last run wins" defaults.
              const runs: {
                text: string;
                color?: string | null;
                bold?: boolean;
                italic?: boolean;
                underline?: boolean;
                fontSize?: number;
                dir?: 'ltr' | 'rtl';
              }[] = [];

              const children = Array.from(p.childNodes).filter((node) => node.nodeType === 1) as Element[];
              children.forEach((childNode) => {
                const tag = childNode.localName;

                // Line Break (<a:br>)
                if (tag === 'br') {
                  pText += '\n';
                  hasContent = true;
                  runs.push({ text: '\n' });
                }

                // Text Run (<a:r>) or Field Run (<a:fld>)
                if (tag === 'r' || tag === 'fld') {
                  // Curly braces → standard parens so {آيات قرآنية} renders as (آيات قرآنية)
                  const runText = bracesToParens(getTag(childNode, 't')?.textContent || '');
                  pText += runText;
                  if (runText) hasContent = true;

                  let runSize: number | undefined;
                  let runBold: boolean | undefined;
                  let runItalic: boolean | undefined;
                  let runUnderline: boolean | undefined;
                  let runColor: string | null | undefined;

                  // Parse specific styles
                  const rPr = getTag(childNode, 'rPr');
                  if (rPr) {
                    const szAttr = rPr.getAttribute('sz');
                    if (szAttr) {
                      const pt = parseInt(szAttr, 10) / 100;
                      if (!isNaN(pt)) {
                        const px = Math.round(pt * 1.33);
                        pFontSize = Math.max(pFontSize, px);
                        runSize = px;
                      }
                    }

                    if (rPr.getAttribute('b') === '1' || rPr.getAttribute('b') === 'true') {
                      isBold = true;
                      runBold = true;
                    }
                    if (rPr.getAttribute('i') === '1' || rPr.getAttribute('i') === 'true') {
                      isItalic = true;
                      runItalic = true;
                    }
                    if (rPr.getAttribute('u') === 'sng') {
                      isUnderline = true;
                      runUnderline = true;
                    }

                    // Extract font face for run
                    const latinFont = getTag(rPr, 'latin');
                    const csFont = getTag(rPr, 'cs');
                    const eaFont = getTag(rPr, 'ea');
                    const typeface = (csFont ? csFont.getAttribute('typeface') : null) || 
                                     (latinFont ? latinFont.getAttribute('typeface') : null) ||
                                     (eaFont ? eaFont.getAttribute('typeface') : null);
                    if (typeface) {
                      pFontFamily = typeface;
                    }

                    const rc = extractSolidColor(rPr, isBgDark, themeColorMap, getTag);
                    if (rc) {
                      pTextColor = rc;
                      runColor = rc;
                    }
                  }

                  runs.push({
                    text: runText,
                    color: runColor,
                    bold: runBold,
                    italic: runItalic,
                    underline: runUnderline,
                    fontSize: runSize,
                    dir: detectDir(runText),
                  });
                }
              });

              if (!hasContent || !pText.trim()) return;

              // Infer text direction/alignment from content when the pptx didn't state it.
              // Strongly mono-lingual paragraphs flip so an English story keeps its
              // Arabic quotes isolated (and an Arabic story keeps Latin passages
              // LTR). Mixed paragraphs (e.g. English + inline Quran verse) stay on
              // the deck's default so English sentences render LTR/left.
              const pArabic = countArabic(pText);
              const pLatin = countLatin(pText);
              if (pArabic > 0 && pLatin === 0) {
                if (!dirExplicit) textDirection = 'rtl';
                if (deckIsLtr && !alignExplicit) align = 'right';
              } else if (pLatin > 0 && pArabic === 0) {
                if (!dirExplicit) textDirection = 'ltr';
              }

              // Calculate bounding height of this paragraph using line-wrapping estimation
              let totalLines = 0;
              pText.split('\n').forEach((subLine) => {
                const approxCharWidth = pFontSize * 0.48;
                const charsPerLine = Math.max(10, Math.floor(scaledW / approxCharWidth));
                totalLines += Math.max(1, Math.ceil(subLine.length / charsPerLine));
              });
              const pHeight = totalLines * Math.round(pFontSize * 1.35);

              // Resolve per-run styling to concrete spans when a paragraph mixes
              // styles (e.g. mixed colors/bold/sizes), so each run keeps its own
              // look instead of the "last run wins" paragraph defaults. Inherit
              // runs (no explicit color) resolve to the paragraph default color.
              const effectiveRuns = runs.filter((r) => r.text !== '' && r.text !== '\n');
              let textSpans: TextElement['spans'];
              if (effectiveRuns.length > 1) {
                const spanColor = (r: (typeof runs)[number]) => r.color ?? defaultTextColor;
                const spanKey = (r: (typeof runs)[number]) =>
                  [spanColor(r), Boolean(r.bold), Boolean(r.italic), Boolean(r.underline), r.fontSize ?? 0, r.dir ?? detectDir(r.text)].join('|');
                const baseKey = spanKey(effectiveRuns[0]);
                // Build spans when runs differ in styling OR direction, so mixed
                // Arabic/English paragraphs keep each run isolated and ordered.
                const diverse = effectiveRuns.some((r) => spanKey(r) !== baseKey);
                if (diverse) {
                  textSpans = effectiveRuns.map((r) => ({
                    text: r.text,
                    color: spanColor(r),
                    bold: r.bold,
                    italic: r.italic,
                    underline: r.underline,
                    fontSize: r.fontSize,
                    dir: r.dir ?? detectDir(r.text),
                  }));
                }
              }

              const textEl: TextElement = {
                id: `el-pptx-t-${Math.random().toString(36).substring(2, 9)}`,
                type: 'text',
                x: scaledX,
                y: scaledY + currentOffsetY,
                width: scaledW,
                height: pHeight,
                rotation: Math.round(rawRot),
                opacity: 1,
                zIndex: elementZIndex++,
                locked: false,
                hidden: false,
                animation: null,
                text: pText,
                fontFamily: pFontFamily,
                fontSize: pFontSize,
                color: pTextColor,
                bold: isBold,
                italic: isItalic,
                underline: isUnderline,
                align: align,
                dir: textDirection,
                spans: textSpans,
              };

              elements.push(textEl);
              paragraphIds.push(textEl.id);
              currentOffsetY += pHeight + paragraphSpacing;
            });

            if (originalId && paragraphIds.length > 0) {
              idMap.set(String(originalId), paragraphIds);
            }
          }
        }
      }
    }

    // Parse PowerPoint timing animations (best-effort).
    //
    // PowerPoint animations are organized as a sequence of "build steps" (usually one
    // per mouse click), each represented by a <p:par> directly under the main
    // <p:seq>'s <p:childTnLst>. Each step can move/reveal several shapes at once.
    //
    // "Play Sound" effects appear as <p:audio> / <p:sndTgt r:embed="..."> nodes (or
    // occasionally <p:cmd>) and are NOT tied to a shape — they are scheduled as
    // slide-level cues at the build-step clock time (+ optional local delay).
    const slideAnimationSounds: { startTime: number; src: string }[] = [];
    // Cache decoded sound data-URLs by zip path so the same click/whoosh isn't re-encoded
    const soundCache = new Map<string, string>();
    // Track which relationship targets were used as animation SFX so we don't also
    // treat them as the slide's narration audio later.
    const animationSoundPaths = new Set<string>();

    const resolveMediaPath = (raw: string): string => {
      let p = raw.replace(/\\/g, '/');
      if (p.startsWith('/')) p = p.slice(1);
      // Relationships are usually "../media/foo.wav" relative to ppt/slides/
      p = p.replace(/^\.\.\//, 'ppt/');
      if (!p.startsWith('ppt/')) {
        // Bare "media/foo.wav"
        if (p.startsWith('media/')) p = `ppt/${p}`;
      }
      return p;
    };

    const loadSoundDataUrl = async (mediaPath: string): Promise<string | null> => {
      const resolved = resolveMediaPath(mediaPath);
      if (soundCache.has(resolved)) return soundCache.get(resolved)!;

      // Try a few common path variants (case / prefix differences across exporters)
      const candidates = [
        resolved,
        mediaPath,
        resolveMediaPath(mediaPath),
        `ppt/media/${mediaPath.split('/').pop()}`,
      ];
      let soundFile: { async: (type: 'blob') => Promise<Blob> } | null = null;
      let usedPath = resolved;
      for (const c of candidates) {
        const f = zip.file(c);
        if (f) {
          soundFile = f;
          usedPath = c;
          break;
        }
      }
      // Case-insensitive fallback scan of ppt/media
      if (!soundFile) {
        const baseName = (mediaPath.split('/').pop() || '').toLowerCase();
        if (baseName) {
          const matchKey = Object.keys(zip.files).find(
            (k) =>
              k.toLowerCase().startsWith('ppt/media/') &&
              k.toLowerCase().endsWith(baseName)
          );
          if (matchKey) {
            soundFile = zip.file(matchKey);
            usedPath = matchKey;
          }
        }
      }
      if (!soundFile) return null;

      try {
        const soundBlob = await soundFile.async('blob');
        if (soundBlob.size > maxAudioBytes) {
          console.warn(
            `Skipping oversized animation sound (${Math.round(soundBlob.size / 1024)}KB > limit): ${usedPath}`
          );
          return null;
        }
        const dataUrl = await compressAudioBlob(
          soundBlob,
          opts.audioSampleRate,
          opts.audioMono
        );
        soundCache.set(resolved, dataUrl);
        soundCache.set(usedPath, dataUrl);
        animationSoundPaths.add(usedPath);
        animationSoundPaths.add(resolved);
        return dataUrl;
      } catch (err) {
        console.warn(`Failed to decode animation sound ${usedPath}:`, err);
        return null;
      }
    };

    /** Extract rId / embed target from a sndTgt or similar node */
    const extractSoundEmbedId = (node: Element): string | null => {
      const sndTgt =
        getTag(node, 'sndTgt') ||
        getTag(node, 'snd') ||
        (node.localName === 'sndTgt' || node.localName === 'snd' ? node : null);
      if (!sndTgt) return null;
      return (
        sndTgt.getAttribute('r:embed') ||
        sndTgt.getAttribute('embed') ||
        sndTgt.getAttribute('r:link') ||
        sndTgt.getAttribute('link') ||
        null
      );
    };

    /** Read delay (seconds) from a timing node's own cTn, if present */
    const readNodeDelaySec = (node: Element): number => {
      // <p:audio><p:cMediaNode><p:cTn delay=".."> or nested stCondLst
      const cMedia = getTag(node, 'cMediaNode');
      const cTn =
        (cMedia ? getTag(cMedia, 'cTn') : null) ||
        getTag(node, 'cTn') ||
        (() => {
          const cBhvr = getTag(node, 'cBhvr');
          return cBhvr ? getTag(cBhvr, 'cTn') : null;
        })();
      if (cTn) {
        const d = cTn.getAttribute('delay');
        if (d && d !== 'indefinite') {
          const ms = parseInt(d, 10);
          if (!isNaN(ms)) return Math.max(0, ms / 1000);
        }
        // Condition list delay (common for click-triggered audio)
        const stCondLst = getTag(cTn, 'stCondLst');
        if (stCondLst) {
          const cond = getTag(stCondLst, 'cond');
          const cd = cond?.getAttribute('delay');
          if (cd && cd !== 'indefinite') {
            const ms = parseInt(cd, 10);
            if (!isNaN(ms)) return Math.max(0, ms / 1000);
          }
        }
      }
      return 0;
    };

    try {
      const timing = getTag(sld, 'timing');
      if (timing) {
        // Collect every top-level build-step group, across every <p:seq> found on the
        // slide, in document order.
        const seqs = getTags(timing, 'seq');
        const groups: Element[] = [];
        seqs.forEach((seq) => {
          const seqCTn = getTag(seq, 'cTn');
          // Skip interactive sequences — those are click-triggered, not timed
          // build steps. Including them here pollutes the animation clock and
          // attaches click-SFX to the linear timeline incorrectly.
          const nodeType =
            seqCTn?.getAttribute('nodeType') || seq.getAttribute('nodeType') || '';
          if (nodeType === 'interactiveSeq') return;
          // Also skip seqs that start with an onClick condition
          const stCondLst = seqCTn ? getTag(seqCTn, 'stCondLst') : null;
          const firstCond = stCondLst ? getTag(stCondLst, 'cond') : null;
          if (firstCond?.getAttribute('evt') === 'onClick') return;

          const childTnLst = seqCTn ? getTag(seqCTn, 'childTnLst') : null;
          if (childTnLst) {
            groups.push(...directChildren(childTnLst, 'par'));
          }
        });

        // Some decks (or partial timing trees) skip the <p:seq> wrapper entirely.
        if (groups.length === 0) {
          groups.push(timing);
        }

        const effectTags = ['animEffect', 'anim', 'set', 'animMotion', 'animRot', 'animScale'];
        const MIN_STEP_GAP = 0.15;
        let clock = 0;

        for (const group of groups) {
          const groupCTn = getTag(group, 'cTn');
          const presetClass = groupCTn?.getAttribute('presetClass');
          // Visual entrance animations only — but ALWAYS harvest sounds below,
          // even on exit/emphasis/path groups (sounds must not be skipped).
          const isEntrance = !presetClass || presetClass === 'entr';

          let groupMaxEnd = 0;
          let matchedAny = false;

          if (isEntrance) {
            for (const tag of effectTags) {
              for (const effectNode of getTags(group, tag)) {
                const spTgt = getTag(effectNode, 'spTgt');
                const spid = spTgt?.getAttribute('spid');
                if (!spid || !idMap.has(spid)) continue;

                const localName = effectNode.localName;
                let presetId: string | null = 'fade';

                if (localName === 'animEffect') {
                  const filter = (effectNode.getAttribute('filter') || 'fade').toLowerCase();
                  presetId = mapEntranceFilter(filter);
                  // Prefer numeric presetID from the enclosing effect node (cTn)
                  // e.g. presetID=42 (Float Up) should be slide-up, not plain fade
                  let parent: Element | null = effectNode.parentElement;
                  while (parent) {
                    if (parent.localName === 'cTn' && parent.getAttribute('presetID')) {
                      const fromId = mapEntrancePresetId(
                        parent.getAttribute('presetID'),
                        parent.getAttribute('presetSubtype')
                      );
                      // Only override when we recognize the preset AND it ranks higher
                      // (never replace a strong motion with an unknown/null mapping)
                      if (fromId && presetRank(fromId) > presetRank(presetId)) {
                        presetId = fromId;
                      }
                      break;
                    }
                    parent = parent.parentElement;
                  }
                } else if (localName === 'animMotion') {
                  presetId = inferMotionPreset(effectNode, getTag, getTags) || 'slide-up';
                } else if (localName === 'animRot') {
                  presetId = 'rotate';
                } else if (localName === 'animScale') {
                  presetId = 'zoom';
                } else if (localName === 'anim') {
                  // Position-motion entrance (e.g. PowerPoint's "Float Up") is
                  // encoded as a bare <p:anim> tweening ppt_x/ppt_y. Map its travel
                  // direction to a slide-* preset. If it carries no motion (stays at
                  // its final position) it is not an entrance on its own — skip it so
                  // a sibling ppt_y anim (or a real animEffect) can define the effect.
                  presetId = inferPptPositionPreset(effectNode, getTag, getTags);
                  if (!presetId) continue;
                } else if (localName === 'set') {
                  // A <p:set> only toggles visibility (makes the shape appear); it is
                  // not an entrance preset and must not claim the element before the
                  // following motion/fade nodes do.
                  continue;
                } else {
                  continue;
                }

                const cBhvr = getTag(effectNode, 'cBhvr');
                const effCTn = cBhvr ? getTag(cBhvr, 'cTn') : null;
                const durAttr = effCTn?.getAttribute('dur');
                const delayAttr = effCTn?.getAttribute('delay');
                const localDelay =
                  delayAttr && delayAttr !== 'indefinite'
                    ? parseInt(delayAttr, 10) / 1000
                    : 0;
                const duration =
                  durAttr && durAttr !== 'indefinite' && !isNaN(parseInt(durAttr, 10))
                    ? Math.max(parseInt(durAttr, 10) / 1000, 0.1)
                    : 0.6;

                const targetElementIds =
                  idMap.get(String(spid)) || idMap.get(spid) || null;
                if (targetElementIds) {
                  targetElementIds.forEach((elId) => {
                    const el = elements.find((item) => item.id === elId);
                    if (!el) return;
                    const startTime = Math.round((clock + localDelay) * 100) / 100;
                    if (!el.animation) {
                      el.animation = {
                        presetId,
                        startTime,
                        duration,
                        delay: 0,
                        repeat: 0,
                      };
                    } else if (
                      presetRank(presetId) > presetRank(el.animation.presetId || 'fade')
                    ) {
                      // Upgrade preset only — keep original build-step timing
                      el.animation = {
                        ...el.animation,
                        presetId,
                        duration: Math.max(el.animation.duration || 0, duration),
                      };
                    }
                  });
                }

                matchedAny = true;
                groupMaxEnd = Math.max(groupMaxEnd, localDelay + duration);
              }
            }
          }

          // ---- Harvest "Play Sound" effects for THIS build step ----
          // Sources:
          //  1) <p:audio> … <p:sndTgt r:embed="rIdN"/>
          //  2) any descendant <p:sndTgt> / <p:snd>
          //  3) <p:cmd type="call" cmd="play…"> with an embed target nearby
          const soundNodes: Element[] = includeAnimationSounds
            ? [
                ...getTags(group, 'audio'),
                ...getTags(group, 'sndTgt'),
                ...getTags(group, 'snd'),
              ]
            : [];

          // Also scan cmd nodes that trigger media playback
          if (includeAnimationSounds) {
            for (const cmdNode of getTags(group, 'cmd')) {
              const cmdAttr = (cmdNode.getAttribute('cmd') || '').toLowerCase();
              const typeAttr = (cmdNode.getAttribute('type') || '').toLowerCase();
              if (
                cmdAttr.includes('play') ||
                typeAttr === 'call' ||
                typeAttr === 'verb'
              ) {
                soundNodes.push(cmdNode);
              }
            }
          }

          const seenEmbeds = new Set<string>();
          for (const soundNode of soundNodes) {
            const embedId = extractSoundEmbedId(soundNode);
            if (!embedId || seenEmbeds.has(embedId)) continue;
            seenEmbeds.add(embedId);

            const mediaPath = relsMap[embedId];
            if (!mediaPath) continue;

            // Only treat as SFX if the target looks like audio
            const lowerPath = mediaPath.toLowerCase();
            const isAudioFile =
              /\.(mp3|wav|m4a|wma|ogg|aac|mid|midi)$/i.test(lowerPath) ||
              lowerPath.includes('/media/');
            if (!isAudioFile && !/\.(mp3|wav|m4a|wma|ogg|aac)$/i.test(lowerPath)) {
              // Still try — some packs omit extensions in the relationship target
            }

            const localSoundDelay = readNodeDelaySec(soundNode);
            const dataUrl = await loadSoundDataUrl(mediaPath);
            if (!dataUrl) continue;

            slideAnimationSounds.push({
              startTime: Math.round((clock + localSoundDelay) * 100) / 100,
              src: dataUrl,
            });
            matchedAny = true;
            groupMaxEnd = Math.max(groupMaxEnd, localSoundDelay + 0.15);
          }

          if (matchedAny) {
            clock += Math.max(groupMaxEnd, MIN_STEP_GAP);
          }
        }

        // Fallback: any <p:audio>/<p:sndTgt> under timing that we somehow missed
        // (e.g. nested deeper than our group walk). Attach at t=0 only if no
        // sounds were collected at all for this slide.
        if (includeAnimationSounds && slideAnimationSounds.length === 0) {
          const orphanNodes = [
            ...getTags(timing, 'audio'),
            ...getTags(timing, 'sndTgt'),
          ];
          const seen = new Set<string>();
          for (const node of orphanNodes) {
            const embedId = extractSoundEmbedId(node);
            if (!embedId || seen.has(embedId)) continue;
            seen.add(embedId);
            const mediaPath = relsMap[embedId];
            if (!mediaPath) continue;
            const dataUrl = await loadSoundDataUrl(mediaPath);
            if (!dataUrl) continue;
            slideAnimationSounds.push({
              startTime: Math.round(readNodeDelaySec(node) * 100) / 100,
              src: dataUrl,
            });
          }
        }
      }
    } catch (timingErr) {
      console.warn('Could not parse slide timing animations:', timingErr);
    }

    // ------------------------------------------------------------------
    // Fill-only entrance pass — ONLY assigns animations to shapes that still
    // have animation: null after the linear group walk. Never overwrites
    // timings, never forces hidden, does not re-sequence existing effects.
    // This recovers nested clickEffect/entr nodes the group walk can miss
    // without damaging other already-extracted animations.
    // ------------------------------------------------------------------
    try {
      const timing2 = getTag(sld, 'timing');
      if (timing2) {
        const allCTn = getTags(timing2, 'cTn');
        // Highest startTime already assigned on this slide
        let nextClock = 0;
        elements.forEach((el) => {
          if (el.animation && typeof el.animation.startTime === 'number') {
            nextClock = Math.max(
              nextClock,
              el.animation.startTime + (el.animation.duration || 0.5)
            );
          }
        });

        // Only top-level effect nodes (have presetID or nodeType *Effect)
        for (const cTn of allCTn) {
          const presetClass = cTn.getAttribute('presetClass');
          if (presetClass && presetClass !== 'entr') continue;
          const nodeType = cTn.getAttribute('nodeType') || '';
          const hasPreset = cTn.hasAttribute('presetID');
          const isEffectNode =
            nodeType === 'clickEffect' ||
            nodeType === 'withEffect' ||
            nodeType === 'afterEffect' ||
            (hasPreset && presetClass === 'entr');
          if (!isEffectNode) continue;

          const spTgt = getTag(cTn, 'spTgt');
          const spid = spTgt?.getAttribute('spid');
          if (!spid) continue;

          const ids = idMap.get(String(spid)) || idMap.get(spid);
          if (!ids || ids.length === 0) continue;

          // Skip if every mapped element already has an animation
          const needsFill = ids.some((elId) => {
            const el = elements.find((e) => e.id === elId);
            return el && !el.animation;
          });
          if (!needsFill) continue;

          // Duration
          let duration = 0.8;
          const animEffect = getTag(cTn, 'animEffect');
          const animNode = getTag(cTn, 'anim');
          const scaleNode = getTag(cTn, 'animScale');
          const motionNode = getTag(cTn, 'animMotion');
          const bhvrCTn = (node: Element | null) => {
            if (!node) return null;
            const bh = getTag(node, 'cBhvr');
            return bh ? getTag(bh, 'cTn') : getTag(node, 'cTn');
          };
          const durSource =
            bhvrCTn(animEffect) || bhvrCTn(animNode) || bhvrCTn(scaleNode) || bhvrCTn(motionNode) || cTn;
          const durAttr = durSource?.getAttribute('dur');
          if (durAttr && durAttr !== 'indefinite') {
            const ms = parseInt(durAttr, 10);
            if (!isNaN(ms) && ms > 0) duration = Math.max(ms / 1000, 0.15);
          }

          // Resolve preset carefully
          let presetId =
            mapEntrancePresetId(cTn.getAttribute('presetID'), cTn.getAttribute('presetSubtype')) ||
            'fade';
          if (animEffect) {
            const filter = (animEffect.getAttribute('filter') || '').toLowerCase();
            if (filter) {
              const fromFilter = mapEntranceFilter(filter);
              if (presetRank(fromFilter) > presetRank(presetId)) presetId = fromFilter;
            }
          }
          if (motionNode) {
            const fromMotion = inferMotionPreset(motionNode, getTag, getTags);
            if (fromMotion && presetRank(fromMotion) > presetRank(presetId)) presetId = fromMotion;
          }
          for (const animEl of getTags(cTn, 'anim')) {
            const fromPos = inferPptPositionPreset(animEl, getTag, getTags);
            if (fromPos && presetRank(fromPos) > presetRank(presetId)) presetId = fromPos;
          }
          if (scaleNode && presetRank('zoom') > presetRank(presetId)) presetId = 'zoom';

          const startTime = Math.round(nextClock * 100) / 100;
          let filled = false;
          ids.forEach((elId) => {
            const el = elements.find((e) => e.id === elId);
            if (!el || el.animation) return; // never overwrite
            el.animation = {
              presetId,
              startTime,
              duration,
              delay: 0,
              repeat: 0,
            };
            filled = true;
          });
          if (filled) {
            nextClock += Math.max(duration, 0.15);
          }
        }
      }
    } catch (fillErr) {
      console.warn('Fill-only entrance pass failed:', fillErr);
    }

    // ------------------------------------------------------------------
    // Interactive click triggers (quiz answers, buttons, hotspots)
    // ------------------------------------------------------------------
    // Generic extraction that works for any PPTX that uses PowerPoint's
    // interactiveSeq + onClick timing model (quizzes, buttons, hotspots…).
    //
    // For each interactive sequence we record:
    //   • which shape the user clicks
    //   • which shapes to show/hide (set visibility / entrance effects)
    //   • which sound to play (cmd playFrom targeting a media shape that
    //     carries an a:audioFile / p:nvPr media relationship)
    const clickTriggers: ClickTrigger[] = [];
    const elementsToHide = new Set<string>();

    // Build shapeId → audio rIds / image element ids by scanning the slide XML.
    // Media pictures often embed BOTH a blip (image) and an audioFile.
    const shapeAudioEmbeds = new Map<string, string[]>(); // spid → rId[]
    try {
      const allCNvPr = getTags(sld, 'cNvPr');
      for (const cNv of allCNvPr) {
        const sid = cNv.getAttribute('id');
        if (!sid) continue;
        // Walk up to the owning pic/sp/graphicFrame
        let node: Element | null = cNv.parentElement;
        let owner: Element | null = null;
        while (node) {
          const ln = node.localName;
          if (ln === 'pic' || ln === 'sp' || ln === 'graphicFrame' || ln === 'cxnSp') {
            owner = node;
            break;
          }
          node = node.parentElement;
        }
        if (!owner) continue;
        const embeds: string[] = [];
        // a:audioFile r:link / r:embed
        for (const af of Array.from(owner.getElementsByTagNameNS('*', 'audioFile'))) {
          const e =
            af.getAttribute('r:link') ||
            af.getAttribute('link') ||
            af.getAttribute('r:embed') ||
            af.getAttribute('embed');
          if (e) embeds.push(e);
        }
        // p:nvPr / a:extLst media relationships
        for (const el of Array.from(owner.querySelectorAll('*'))) {
          for (const attr of ['r:embed', 'embed', 'r:link', 'link']) {
            const v = el.getAttribute(attr);
            if (!v) continue;
            // Only keep if the relationship target looks like audio
            const target = relsMap[v];
            if (target && /\.(mp3|wav|m4a|wma|ogg|aac|mid)$/i.test(target)) {
              embeds.push(v);
            }
          }
        }
        if (embeds.length) {
          shapeAudioEmbeds.set(sid, [...new Set(embeds)]);
        }
      }
    } catch (e) {
      console.warn('Could not build shape→audio map:', e);
    }

    try {
      const timing = getTag(sld, 'timing');
      if (timing) {
        const allSeqs = getTags(timing, 'seq');
        const interactiveSeqs: Element[] = [];

        for (const seq of allSeqs) {
          const cTn = getTag(seq, 'cTn');
          const nodeType =
            cTn?.getAttribute('nodeType') || seq.getAttribute('nodeType') || '';
          if (nodeType === 'interactiveSeq') {
            interactiveSeqs.push(seq);
            continue;
          }
          // Fallback: any seq whose start condition is onClick
          const stCondLst = cTn ? getTag(cTn, 'stCondLst') : null;
          const firstCond = stCondLst ? getTag(stCondLst, 'cond') : null;
          if (firstCond?.getAttribute('evt') === 'onClick') {
            interactiveSeqs.push(seq);
          }
        }

        for (const seq of interactiveSeqs) {
          const seqCTn = getTag(seq, 'cTn');
          if (!seqCTn) continue;

          // --- 1) Click target shape ---
          let clickSpid: string | null = null;
          const stCondLst = getTag(seqCTn, 'stCondLst');
          if (stCondLst) {
            for (const cond of getTags(stCondLst, 'cond')) {
              if (cond.getAttribute('evt') === 'onClick') {
                const spTgt = getTag(cond, 'spTgt');
                clickSpid = spTgt?.getAttribute('spid') || null;
                if (clickSpid) break;
              }
            }
          }
          if (!clickSpid) {
            for (const cond of getTags(seq, 'cond')) {
              if (cond.getAttribute('evt') === 'onClick') {
                const spTgt = getTag(cond, 'spTgt');
                clickSpid = spTgt?.getAttribute('spid') || null;
                if (clickSpid) break;
              }
            }
          }
          if (!clickSpid || !idMap.has(clickSpid)) continue;

          const targetElementId = idMap.get(clickSpid)![0];
          const actions: ClickAction[] = [];
          const seenSound = new Set<string>();
          const seenShow = new Set<string>();

          const addShow = (spid: string) => {
            const ids = idMap.get(spid);
            if (!ids) return;
            for (const tid of ids) {
              if (seenShow.has(tid)) continue;
              seenShow.add(tid);
              actions.push({ type: 'show', targetId: tid });
              elementsToHide.add(tid);
            }
          };

          const addSoundFromEmbed = async (embedId: string) => {
            if (!embedId || seenSound.has(embedId)) return;
            const mediaPath = relsMap[embedId];
            if (!mediaPath) return;
            if (!/\.(mp3|wav|m4a|wma|ogg|aac|mid)$/i.test(mediaPath) &&
                !mediaPath.toLowerCase().includes('/media/')) {
              return;
            }
            seenSound.add(embedId);
            const dataUrl = await loadSoundDataUrl(mediaPath);
            if (dataUrl) actions.push({ type: 'playSound', src: dataUrl });
          };

          const addSoundFromShape = async (spid: string) => {
            const embeds = shapeAudioEmbeds.get(spid) || [];
            for (const e of embeds) await addSoundFromEmbed(e);
          };

          // --- 2) Visibility / entrance effects → show ---
          for (const setNode of getTags(seq, 'set')) {
            const attrNameEl = getTag(setNode, 'attrName');
            const attrText = (
              attrNameEl?.textContent ||
              attrNameEl?.getAttribute('val') ||
              ''
            ).toLowerCase();
            // Accept visibility and opacity sets
            if (
              attrText &&
              !attrText.includes('visibility') &&
              !attrText.includes('opacity')
            ) {
              continue;
            }
            const cBhvr = getTag(setNode, 'cBhvr');
            const tgtEl = cBhvr ? getTag(cBhvr, 'tgtEl') : getTag(setNode, 'tgtEl');
            const spTgt = tgtEl ? getTag(tgtEl, 'spTgt') : getTag(setNode, 'spTgt');
            const targetSpid = spTgt?.getAttribute('spid');
            if (!targetSpid) continue;

            const toNode = getTag(setNode, 'to');
            let toLower = '';
            if (toNode) {
              const strVal =
                getTag(toNode, 'strVal') ||
                Array.from(toNode.children || []).find(
                  (c) => (c as Element).localName === 'strVal'
                );
              toLower = (
                (strVal as Element | undefined)?.getAttribute('val') ||
                toNode.getAttribute('val') ||
                toNode.textContent ||
                ''
              ).toLowerCase();
            }
            const isHide =
              toLower.includes('hidden') || toLower === '0' || toLower === 'false';
            if (isHide) {
              const ids = idMap.get(targetSpid);
              if (ids) {
                for (const tid of ids) {
                  actions.push({ type: 'hide', targetId: tid });
                }
              }
            } else {
              // visible / empty / opacity 1 → show
              addShow(targetSpid);
            }
          }

          // Entrance animEffect inside the interactive seq also implies "show"
          for (const animNode of [
            ...getTags(seq, 'animEffect'),
            ...getTags(seq, 'anim'),
          ]) {
            const cBhvr = getTag(animNode, 'cBhvr');
            const tgtEl = cBhvr ? getTag(cBhvr, 'tgtEl') : getTag(animNode, 'tgtEl');
            const spTgt = tgtEl ? getTag(tgtEl, 'spTgt') : getTag(animNode, 'spTgt');
            const targetSpid = spTgt?.getAttribute('spid');
            if (targetSpid) addShow(targetSpid);
          }

          // --- 3) cmd playFrom → show media shape + play its audio ---
          for (const cmdNode of getTags(seq, 'cmd')) {
            const cmdAttr = (cmdNode.getAttribute('cmd') || '').toLowerCase();
            const typeAttr = (cmdNode.getAttribute('type') || '').toLowerCase();
            if (
              !(cmdAttr.includes('play') || typeAttr === 'call' || typeAttr === 'verb')
            ) {
              continue;
            }
            const cBhvr = getTag(cmdNode, 'cBhvr');
            const tgtEl = cBhvr ? getTag(cBhvr, 'tgtEl') : null;
            const spTgt = tgtEl
              ? getTag(tgtEl, 'spTgt')
              : getTag(cmdNode, 'spTgt');
            const mediaSpid = spTgt?.getAttribute('spid');
            if (mediaSpid) {
              // The media picture itself should become visible
              addShow(mediaSpid);
              // And its linked audio should play
              await addSoundFromShape(mediaSpid);
            }
            // Also pick up any embed directly on the cmd subtree
            for (const el of Array.from(cmdNode.querySelectorAll('*'))) {
              const emb =
                el.getAttribute('r:embed') ||
                el.getAttribute('embed') ||
                el.getAttribute('r:link') ||
                el.getAttribute('link');
              if (emb) await addSoundFromEmbed(emb);
            }
          }

          // Explicit audio / sndTgt nodes
          for (const soundNode of [
            ...getTags(seq, 'audio'),
            ...getTags(seq, 'sndTgt'),
            ...getTags(seq, 'snd'),
          ]) {
            const embedId = extractSoundEmbedId(soundNode);
            if (embedId) await addSoundFromEmbed(embedId);
          }

          if (actions.length > 0) {
            const existing = clickTriggers.find(
              (t) => t.targetElementId === targetElementId
            );
            if (existing) {
              existing.actions.push(...actions);
            } else {
              clickTriggers.push({ targetElementId, actions });
            }
          }
        }

        // Feedback / media elements that are only revealed by a click start hidden
        for (const el of elements) {
          if (elementsToHide.has(el.id)) {
            el.hidden = true;
          }
        }
      }
    } catch (clickErr) {
      console.warn(
        `Could not parse interactive click triggers on slide ${slideNum}:`,
        clickErr
      );
    }

    // Scan relationships for any audio file
    let slideAudioUrl = '';
    let slideAudioName = '';
    let slideAudioDuration = 0;

    const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.wma', '.aac'];
    // Prefer a relationship that was NOT already used as an animation SFX
    // (those are short click/whoosh effects, not slide narration).
    const audioRel = Object.values(relsMap).find((targetPath) => {
      const lower = targetPath.toLowerCase();
      if (!audioExtensions.some((ext) => lower.endsWith(ext))) return false;
      const resolved = resolveMediaPath(targetPath);
      if (animationSoundPaths.has(resolved) || animationSoundPaths.has(targetPath)) {
        return false;
      }
      return true;
    });

    if (audioRel && !skipHeavyAudio) {
      try {
        const audioFile = zip.file(audioRel);
        if (audioFile) {
          const audioBlob = await audioFile.async('blob');
          if (audioBlob.size > maxAudioBytes) {
            console.warn(
              `Skipping large slide audio on slide ${slideNum} (${Math.round(audioBlob.size / 1024 / 1024)}MB > limit)`
            );
          } else {
            const dataUrl = await compressAudioBlob(
              audioBlob,
              opts.audioSampleRate,
              opts.audioMono
            );
            slideAudioUrl = dataUrl;
            slideAudioName = audioRel.substring(audioRel.lastIndexOf('/') + 1);

            slideAudioDuration = await new Promise<number>((resolve) => {
              const audioObj = new Audio(slideAudioUrl);
              audioObj.addEventListener('loadedmetadata', () => {
                resolve(audioObj.duration || 0);
              });
              audioObj.addEventListener('error', () => {
                resolve(0);
              });
              setTimeout(() => resolve(0), 1000);
            });
          }
        }
      } catch (audioErr) {
        console.warn(`Could not extract audio relationship for slide ${slideNum}:`, audioErr);
      }
    }

    // Assign final background
    const background = slideBackgroundUrl 
      ? { type: 'image' as const, value: slideBackgroundUrl }
      : { type: 'color' as const, value: slideBackgroundColor };

    const slide: Slide = {
      id: `slide-pptx-${Math.random().toString(36).substring(2, 9)}`,
      background: background,
      elements: elements,
      audio: slideAudioUrl ? {
        src: slideAudioUrl,
        name: slideAudioName,
        duration: slideAudioDuration,
      } : null,
      animationSounds: slideAnimationSounds.length > 0 ? slideAnimationSounds : undefined,
      clickTriggers: clickTriggers.length > 0 ? clickTriggers : undefined,
    };
    slides.push(slide);
    } catch (slideErr) {
      console.warn(`Skipping slide ${slideNum} due to error:`, slideErr);
      // Continue with remaining slides instead of aborting the whole import
    }

    // Let the browser breathe / GC between slides (critical for large PPTX)
    await yieldToMain();
  }

  if (slides.length === 0) {
    throw new Error('لم يتم العثور على شرائح صالحة لاستيرادها من ملف الـ PowerPoint.');
  }

  report(98, 'جاري تجهيز القصة...');
  const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

  report(100, 'اكتمل الاستيراد');

  // Story language/direction comes from the deck-level XML pre-pass above, which
  // counts every slide's text (not just extracted elements).
  const language = deckIsLtr ? 'en' : 'ar';
  const direction = deckIsLtr ? 'ltr' : 'rtl';

  return {
    id: `story-pptx-${Math.random().toString(36).substring(2, 9)}`,
    title: cleanTitle,
    language,
    direction,
    slides: slides,
  };
};
