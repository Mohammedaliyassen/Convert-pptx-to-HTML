/**
 * Bidi helpers for multilingual text fields. Mixed Arabic/English runs are split
 * into directional runs and isolated (via Unicode isolate markers for canvas, and
 * per-run dir/unicodeBidi for DOM) so they render in the correct order instead of
 * scrambling punctuation, numbers, URLs and parentheses across run boundaries.
 */

export type BidiRun = { text: string; dir: 'ltr' | 'rtl' };

/**
 * Detect whether a (sub)string is RTL. Pure Arabic/Hebrew direction, or mostly
 * Arabic (Arabic dominates Latin) returns rtl; otherwise ltr.
 */
export function detectDir(text: string): 'ltr' | 'rtl' {
  if (!text) return 'ltr';
  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
  const hasHebrew = /[\u0590-\u05FF\uFB1D-\uFB4F]/.test(text);
  if (hasArabic || hasHebrew) {
    // If the run also has Latin, Arabic dominance decides the base direction.
    const arabic = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []).length;
    const latin = (text.match(/[A-Za-z]/g) || []).length;
    return arabic >= latin ? 'rtl' : 'ltr';
  }
  return 'ltr';
}

/**
 * Split a string into consecutive directional runs. Only strong directional
 * characters (Arabic/Hebrew vs Latin letters) create a run boundary. Whitespace,
 * punctuation and digits are treated as neutral: they are absorbed into the
 * current run instead of forcing a new one. This keeps phrases like
 * "المشهد السابع:مواجهة النمرود (الملك الجبار)" intact as a single run so the
 * punctuation/parentheses stay anchored to the surrounding words instead of
 * jumping to a separate isolated run.
 */
export function splitBidiRuns(text: string): BidiRun[] {
  if (!text) return [];
  const runs: BidiRun[] = [];
  let current = '';
  let currentDir: 'ltr' | 'rtl' | null = null;

  const push = () => {
    if (current) {
      runs.push({ text: current, dir: currentDir === 'rtl' ? 'rtl' : 'ltr' });
      current = '';
      currentDir = null;
    }
  };

  for (const ch of text) {
    const strong = strongDir(ch);
    if (strong === null) {
      // Neutral char (space, punctuation, digit): attach to current run.
      current += ch;
      continue;
    }
    if (currentDir !== null && strong !== currentDir) {
      push();
    }
    currentDir = strong;
    current += ch;
  }
  push();
  return runs;
}

/**
 * Strong first-level direction of a single character: 'ltr' for Latin letters,
 * 'rtl' for Arabic/Hebrew letters, or null for neutrals (whitespace, punctuation,
 * digits) which do not establish direction on their own.
 */
function strongDir(ch: string): 'ltr' | 'rtl' | null {
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF\uFB1D-\uFB4F]/.test(ch)) {
    return 'rtl';
  }
  if (/[A-Za-z\u00C0-\u024F]/.test(ch)) {
    return 'ltr';
  }
  return null;
}

const LRI = '\u2066'; // LEFT-TO-RIGHT ISOLATE
const RLI = '\u2067'; // RIGHT-TO-LEFT ISOLATE
const PDI = '\u2069'; // POP DIRECTIONAL ISOLATE

/**
 * Wrap each directional run in Unicode isolate markers (LRI/RLI/PDI). Browsers
 * and (most) canvas text shapers honor these so the runs keep their order inside
 * a mixed-direction string. Used for canvas/Konva rendering where per-run CSS
 * isolation isn't available.
 */
export function toIsolatedText(text: string): string {
  const runs = splitBidiRuns(text);
  let out = '';
  for (const run of runs) {
    if (run.dir === 'rtl') {
      out += RLI + run.text + PDI;
    } else {
      out += LRI + run.text + PDI;
    }
  }
  return out;
}

/** Strip Unicode isolate/format control characters (e.g. for an editable input). */
export function stripIsolationMarkers(text: string): string {
  return text.replace(/[\u202A-\u202E\u2066-\u2069\u206A-\u206F]/g, '');
}

/** Whether a string carries isolated runs (i.e. contains isolate markers). */
export function hasIsolationMarkers(text: string): boolean {
  return /[\u2066\u2067\u2069]/.test(text);
}
