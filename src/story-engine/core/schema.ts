import { z } from 'zod';

export const AnimationSchema = z.object({
  presetId: z.string(),
  startTime: z.number(),
  duration: z.number(),
  delay: z.number(),
  repeat: z.number(),
  ease: z.string().optional(),
}).nullable();

export const BaseElementSchema = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  zIndex: z.number().default(0),
  locked: z.boolean().default(false),
  hidden: z.boolean().default(false),
  animation: AnimationSchema.default(null),
});

export const TextElementSchema = BaseElementSchema.extend({
  type: z.literal('text'),
  text: z.string(),
  fontFamily: z.string().default('sans-serif'),
  fontSize: z.number().default(24),
  color: z.string().default('#000000'),
  bold: z.boolean().default(false),
  italic: z.boolean().default(false),
  underline: z.boolean().default(false),
  align: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  dir: z.enum(['ltr', 'rtl']).default('ltr'),
  lineHeight: z.number().default(1.25).optional(),
});

export const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal('image'),
  src: z.string(),
});

export const StoryElementSchema = z.discriminatedUnion('type', [
  TextElementSchema,
  ImageElementSchema,
]);

export const SlideBackgroundSchema = z.object({
  type: z.enum(['color', 'gradient', 'image', 'video']),
  value: z.string(),
});

export const SlideSchema = z.object({
  id: z.string(),
  background: SlideBackgroundSchema,
  elements: z.array(StoryElementSchema).default([]),
  audio: z.object({
    src: z.string(),
    name: z.string(),
    duration: z.number(),
  }).nullable().optional(),
  duration: z.number().default(4).optional(),
});

export const StorySchema = z.object({
  id: z.string(),
  title: z.string(),
  language: z.enum(['ar', 'en']).default('en'),
  direction: z.enum(['ltr', 'rtl']).default('ltr'),
  slides: z.array(SlideSchema).default([]),
});
