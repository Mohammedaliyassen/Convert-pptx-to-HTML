export type ElementType = 'text' | 'image' | 'video' | 'shape' | 'button' | 'icon';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees (0 - 360)
  opacity: number;  // 0 to 1
  zIndex: number;
  locked: boolean;
  hidden: boolean;
  animation: {
    presetId: string;
    startTime: number;
    duration: number;
    delay: number;
    repeat: number;
    ease?: string;
    /** Embedded custom keyframes (self-contained export) */
    keyframes?: CustomKeyframe[];
    /** Optional SFX played when this animation starts */
    soundSrc?: string | null;
  } | null;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
  dir: 'ltr' | 'rtl';
  lineHeight?: number;
  /** Run-level styled spans. Present when a paragraph's runs differ (e.g. mixed
   *  colors); the player renders these instead of a single colored string. */
  spans?: TextSpan[];
}

/** A single styled run within a text element (from PowerPoint <a:r>). */
export interface TextSpan {
  text: string;
  color?: string | null;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  /** Text direction of this run, so mixed Arabic/English spans isolate correctly. */
  dir?: 'ltr' | 'rtl';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
}

export type StoryElement = TextElement | ImageElement; // Can be extended with video, shapes, etc. in later phases

export type NewStoryElement = Omit<TextElement, 'id' | 'zIndex'> | Omit<ImageElement, 'id' | 'zIndex'>;

export interface SlideBackground {
  type: 'color' | 'gradient' | 'image' | 'video';
  value: string; // color hex, CSS gradient string, or image/video URL
}

/** Actions that run when the user clicks a specific element */
export type ClickAction =
  | { type: 'playSound'; src: string }
  | { type: 'show'; targetId: string }
  | { type: 'hide'; targetId: string }
  | { type: 'toggle'; targetId: string };

/**
 * Interactive click handler extracted from PowerPoint interactiveSeq /
 * onClick timing nodes (used heavily by quiz answer choices).
 */
export interface ClickTrigger {
  /** Internal element id that the user clicks */
  targetElementId: string;
  /** Actions fired when this element is clicked */
  actions: ClickAction[];
}

export interface Slide {
  id: string;
  background: SlideBackground;
  elements: StoryElement[];
  audio?: {
    src: string;
    name: string;
    duration: number;
  } | null;
  duration?: number;
  // "Play Sound" animation effects (e.g. a click/whoosh sound attached to a build
  // step) are not tied to any single shape, so they're kept as slide-level cues
  // keyed to the timeline position (in seconds) they should fire at.
  animationSounds?: { startTime: number; src: string }[];
  /** Interactive click handlers (quiz answers, buttons, hotspots, etc.) */
  clickTriggers?: ClickTrigger[];
}

export type StageFormatId = '16:9' | '9:16' | '4:3' | '1:1' | '21:9';

export interface StageFormat {
  id: StageFormatId;
  label: string;
  width: number;
  height: number;
}

export const STAGE_FORMATS: StageFormat[] = [
  { id: '16:9', label: '16:9 Widescreen', width: 1200, height: 675 },
  { id: '9:16', label: '9:16 Story / Reels', width: 675, height: 1200 },
  { id: '4:3', label: '4:3 Classic', width: 1000, height: 750 },
  { id: '1:1', label: '1:1 Square', width: 800, height: 800 },
  { id: '21:9', label: '21:9 Cinematic', width: 1400, height: 600 },
];

export interface Story {
  id: string;
  title: string;
  language: 'ar' | 'en';
  direction: 'ltr' | 'rtl';
  /** Canvas / player stage aspect ratio */
  stageFormat?: StageFormatId;
  slides: Slide[];
}

export interface CustomKeyframe {
  offset: number; // 0 to 1
  x?: number; // relative shift in px
  y?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  opacity?: number;
}

export interface AnimationPreset {
  id: string;
  name: string;
  type: 'builtin' | 'custom';
  keyframes?: CustomKeyframe[];
  favorite?: boolean;
  /** UI grouping: entrance | emphasis | exit | custom */
  category?: 'entrance' | 'emphasis' | 'exit' | 'custom';
  /** Emoji / short label for the timeline chips */
  icon?: string;
}
