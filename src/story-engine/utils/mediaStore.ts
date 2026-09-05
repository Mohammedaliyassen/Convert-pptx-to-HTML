import type { Slide } from '../core/types';

/**
 * In-memory decoded-image store shared by the players.
 *
 * Images are decoded ONCE into Blob/ImageBitmap-backed object URLs and reused
 * for every subsequent render, so revisiting a slide (or re-rendering a rich
 * animation) never re-parses the original base64 payload or re-fetches the
 * network URL. A bounded LRU keeps memory sane for very large decks.
 *
 * Safety rules:
 * - Evicted object URLs are only revoked after a short grace period (an <img>
 *   that is still on screen keeps rendering because its frame is already
 *   painted; revoking while it might re-fetch breaks it).
 * - `clearMediaCache()` revokes everything; call it when a player unmounts.
 * - Cache keys are the *resolved* src, so a re-signed media URL (fresh token)
 *   is a fresh key; the stale entry simply ages out of the LRU.
 */

const MAX_ENTRIES = 96;
const MAX_BYTES = 64 * 1024 * 1024; // ~64 MB decoded estimate
const EVICT_GRACE_MS = 8000;

interface CacheEntry {
  objectUrl: string;
  bytes: number;
  stamp: number;
}

const cache = new Map<string, CacheEntry>();
/** Evicted object URLs waiting out the revoke grace window. */
let retired: Array<{ url: string; stamp: number }> = [];
/** In-flight decode promises so concurrent primes share one decode. */
const inflight = new Map<string, Promise<string | null>>();
let totalBytes = 0;

const dataUriRe = /^data:([^;,]*)?(;base64)?,([\s\S]*)$/i;

/** Move `key` to the LRU tail (most recently used). */
function touch(key: string): void {
  const entry = cache.get(key);
  if (!entry) return;
  entry.stamp = Date.now();
  cache.delete(key);
  cache.set(key, entry);
}

function drainRetired(now = Date.now()): void {
  if (retired.length === 0) return;
  const cutoff = now - EVICT_GRACE_MS;
  const keep: Array<{ url: string; stamp: number }> = [];
  for (const item of retired) {
    if (item.stamp <= cutoff) {
      try {
        URL.revokeObjectURL(item.url);
      } catch {
        /* ignore */
      }
    } else {
      keep.push(item);
    }
  }
  retired = keep;
}

function evict(): void {
  const now = Date.now();
  for (const key of [...cache.keys()]) {
    if (cache.size <= MAX_ENTRIES && totalBytes <= MAX_BYTES) break;
    const entry = cache.get(key)!;
    cache.delete(key);
    totalBytes = Math.max(0, totalBytes - entry.bytes);
    if (now - entry.stamp > EVICT_GRACE_MS) {
      try {
        URL.revokeObjectURL(entry.objectUrl);
      } catch {
        /* ignore */
      }
    } else {
      retired.push({ url: entry.objectUrl, stamp: entry.stamp });
    }
  }
  drainRetired(now);
}

function remember(key: string, objectUrl: string, bytes: number): string | null {
  const existing = cache.get(key);
  if (existing && existing.objectUrl === objectUrl) {
    touch(key);
    return existing.objectUrl;
  }
  cache.set(key, { objectUrl, bytes, stamp: Date.now() });
  totalBytes += bytes;
  evict();
  return objectUrl;
}

/**
 * Synchronously return the cached object URL for a resolved media src,
 * or null when it is not (yet) in the store. Callers fall back to the raw src.
 */
export function cachedMediaUrl(resolvedSrc: string): string | null {
  if (!resolvedSrc) return null;
  const hit = cache.get(resolvedSrc);
  if (hit) {
    touch(resolvedSrc);
    return hit.objectUrl;
  }
  return null;
}

async function decodeToObjectUrl(resolvedSrc: string): Promise<{ url: string; bytes: number } | null> {
  // 1) base64 data URI → Blob (the converter's dominant media format).
  //    Parsing the base64 is the expensive part; the resulting blob object URL
  //    is then reused by every <img> that references this media.
  const m = dataUriRe.exec(resolvedSrc);
  if (m && m[3] !== undefined) {
    let blob: Blob | null = null;
    try {
      const mime = m[1] || 'image/png';
      if (m[2]) {
        const raw = atob(m[3].replace(/[\r\n]/g, ''));
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        blob = new Blob([bytes], { type: mime });
      } else {
        blob = new Blob([decodeURIComponent(m[3])], { type: mime });
      }
    } catch {
      blob = null;
    }
    if (blob) {
      return { url: URL.createObjectURL(blob), bytes: decodedBytesEstimate(blob) };
    }
  }

  if (/^blob:/.test(resolvedSrc)) return { url: resolvedSrc, bytes: 0 };

  // 2) Remote URL (signed media): fetch once locally, then treat like base64.
  try {
    const res = await fetch(resolvedSrc, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return { url: URL.createObjectURL(blob), bytes: decodedBytesEstimate(blob) };
  } catch {
    return null;
  }
}

/**
 * Rough decoded-raster budget for a media blob (blob files are typically
 * compressed 1-4× relative to their decoded size). Only affects cache eviction.
 */
function decodedBytesEstimate(blob: Blob): number {
  return Math.max(blob.size * 4, 1024);
}

/**
 * Decode `resolvedSrc` into the store (idempotent). Resolves to the cached
 * object URL, or null when the media is not decodable/cacheable (callers keep
 * using the raw src in that case).
 */
export function primeMedia(resolvedSrc: string): Promise<string | null> {
  if (!resolvedSrc) return Promise.resolve(null);
  const hit = cache.get(resolvedSrc);
  if (hit) {
    touch(resolvedSrc);
    return Promise.resolve(hit.objectUrl);
  }
  const existing = inflight.get(resolvedSrc);
  if (existing) return existing;

  const p = decodeToObjectUrl(resolvedSrc)
    .then((decoded) => {
      if (!decoded) return null;
      remember(resolvedSrc, decoded.url, decoded.bytes);
      return cache.get(resolvedSrc)?.objectUrl ?? decoded.url;
    })
    .catch(() => null)
    .finally(() => {
      inflight.delete(resolvedSrc);
    });
  inflight.set(resolvedSrc, p);
  return p;
}

/** Collect every image src (elements + background) of a slide. */
export function slideMediaSrcs(slide: Slide | null | undefined): string[] {
  const srcs: string[] = [];
  if (!slide) return srcs;
  if (slide.background?.type === 'image' && slide.background.value) {
    srcs.push(slide.background.value);
  }
  for (const el of slide.elements) {
    if (el.type === 'image' && el.src) srcs.push(el.src);
  }
  return srcs;
}

/**
 * Warm every image of a slide into the store. When `aria`-scheduling is
 * available the work is deferred to idle time so it never blocks input;
 * `immediate` forces it right away (used for the current slide).
 */
export function primeSlideMedia(slide: Slide | null | undefined, immediate = false): void {
  const srcs = slideMediaSrcs(slide);
  if (srcs.length === 0) return;

  const run = () => {
    for (const src of srcs) {
      void primeMedia(src);
    }
  };

  if (immediate || typeof (window as any).requestIdleCallback !== 'function') {
    run();
  } else {
    (window as any).requestIdleCallback(() => run(), { timeout: 2000 });
  }
}

/** Revoke every cached object URL and reset the store (player unmount). */
export function clearMediaCache(): void {
  for (const entry of cache.values()) {
    try {
      URL.revokeObjectURL(entry.objectUrl);
    } catch {
      /* ignore */
    }
  }
  for (const item of retired) {
    try {
      URL.revokeObjectURL(item.url);
    } catch {
      /* ignore */
    }
  }
  cache.clear();
  retired = [];
  inflight.clear();
  totalBytes = 0;
}