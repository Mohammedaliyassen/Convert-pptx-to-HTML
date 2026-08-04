import gsap from 'gsap';
import type { AnimationPreset } from '../core/types';

export const BUILTIN_PRESETS: AnimationPreset[] = [
  { id: 'fade', name: 'تلاشي (Fade In)', type: 'builtin' },
  { id: 'zoom', name: 'تكبير (Zoom In)', type: 'builtin' },
  { id: 'slide-left', name: 'انزلاق لليسار (Slide Left)', type: 'builtin' },
  { id: 'slide-right', name: 'انزلاق لليمين (Slide Right)', type: 'builtin' },
  { id: 'slide-up', name: 'انزلاق للأعلى (Slide Up)', type: 'builtin' },
  { id: 'slide-down', name: 'انزلاق للأسفل (Slide Down)', type: 'builtin' },
  { id: 'rotate', name: 'دوران (Rotate In)', type: 'builtin' },
  { id: 'bounce', name: 'ارتداد (Bounce In)', type: 'builtin' },
  { id: 'flip', name: 'انقلاب ثلاثي الأبعاد (Flip In)', type: 'builtin' }
];

export const applyAnimation = (
  target: any, // DOM Element or Konva Node
  preset: AnimationPreset,
  settings: {
    startTime: number;
    duration: number;
    delay: number;
    repeat: number;
    ease?: string;
  },
  timeline?: gsap.core.Timeline
): gsap.core.Tween | gsap.core.Timeline | null => {
  if (!target) return null;

  const isKonva = typeof target.setAttrs === 'function';
  const duration = settings.duration;
  const delay = settings.delay;
  const repeat = settings.repeat;
  const ease = settings.ease || 'power1.out';

  // Determine initial state values
  let fromVars: any = {};
  let toVars: any = {
    duration,
    delay,
    repeat,
    ease,
  };

  const presetId = preset.id;

  // Set up builtin presets
  if (preset.type === 'builtin') {
    switch (presetId) {
      case 'fade':
        fromVars = { opacity: 0 };
        toVars = { ...toVars, opacity: 1 };
        break;
      case 'zoom':
        fromVars = isKonva ? { scaleX: 0, scaleY: 0, opacity: 0 } : { scale: 0, opacity: 0 };
        toVars = isKonva ? { ...toVars, scaleX: 1, scaleY: 1, opacity: 1 } : { ...toVars, scale: 1, opacity: 1 };
        break;
      case 'slide-left':
        fromVars = isKonva ? { x: target.x() - 300, opacity: 0 } : { x: -300, opacity: 0 };
        toVars = isKonva ? { ...toVars, x: target.x(), opacity: 1 } : { ...toVars, x: 0, opacity: 1 };
        break;
      case 'slide-right':
        fromVars = isKonva ? { x: target.x() + 300, opacity: 0 } : { x: 300, opacity: 0 };
        toVars = isKonva ? { ...toVars, x: target.x(), opacity: 1 } : { ...toVars, x: 0, opacity: 1 };
        break;
      case 'slide-up':
        fromVars = isKonva ? { y: target.y() + 300, opacity: 0 } : { y: 300, opacity: 0 };
        toVars = isKonva ? { ...toVars, y: target.y(), opacity: 1 } : { ...toVars, y: 0, opacity: 1 };
        break;
      case 'slide-down':
        fromVars = isKonva ? { y: target.y() - 300, opacity: 0 } : { y: -300, opacity: 0 };
        toVars = isKonva ? { ...toVars, y: target.y(), opacity: 1 } : { ...toVars, y: 0, opacity: 1 };
        break;
      case 'rotate':
        fromVars = isKonva ? { rotation: target.rotation() - 180, opacity: 0 } : { rotate: -180, opacity: 0 };
        toVars = isKonva ? { ...toVars, rotation: target.rotation(), opacity: 1 } : { ...toVars, rotate: 0, opacity: 1 };
        break;
      case 'bounce':
        fromVars = isKonva ? { y: target.y() - 150 } : { y: -150 };
        toVars = isKonva 
          ? { ...toVars, y: target.y(), ease: 'bounce.out' } 
          : { ...toVars, y: 0, ease: 'bounce.out' };
        break;
      case 'flip':
        // 3D perspective flip
        fromVars = isKonva 
          ? { rotationY: -180, opacity: 0 } 
          : { transformPerspective: 600, rotateY: -180, opacity: 0 };
        toVars = isKonva 
          ? { ...toVars, rotationY: 0, opacity: 1 } 
          : { ...toVars, rotateY: 0, opacity: 1 };
        break;
      default:
        return null;
    }
  } else if (preset.type === 'custom' && preset.keyframes) {
    // Custom keyframe animation
    // Map custom progress ticks (0% - 100%) to GSAP keyframes array
    const kfs = preset.keyframes.map((kf) => {
      const kfObj: any = {};
      if (kf.opacity !== undefined) kfObj.opacity = kf.opacity;
      if (kf.rotation !== undefined) kfObj.rotation = isKonva ? target.rotation() + kf.rotation : kf.rotation;
      
      if (isKonva) {
        if (kf.x !== undefined) kfObj.x = target.x() + kf.x;
        if (kf.y !== undefined) kfObj.y = target.y() + kf.y;
        if (kf.scaleX !== undefined) kfObj.scaleX = kf.scaleX;
        if (kf.scaleY !== undefined) kfObj.scaleY = kf.scaleY;
      } else {
        if (kf.x !== undefined) kfObj.x = kf.x;
        if (kf.y !== undefined) kfObj.y = kf.y;
        if (kf.scaleX !== undefined || kf.scaleY !== undefined) {
          kfObj.scaleX = kf.scaleX ?? 1;
          kfObj.scaleY = kf.scaleY ?? 1;
        }
      }
      return kfObj;
    });

    toVars.keyframes = kfs;
  }

  // Animate!
  if (isKonva) {
    const startX = target.x();
    const startY = target.y();
    const startRot = target.rotation();
    const startScaleX = target.scaleX();
    const startScaleY = target.scaleY();
    const startOpacity = target.opacity();

    // Prepare proxy properties
    const state = {
      x: fromVars.x !== undefined ? fromVars.x : startX,
      y: fromVars.y !== undefined ? fromVars.y : startY,
      rotation: fromVars.rotation !== undefined ? fromVars.rotation : startRot,
      scaleX: fromVars.scaleX !== undefined ? fromVars.scaleX : startScaleX,
      scaleY: fromVars.scaleY !== undefined ? fromVars.scaleY : startScaleY,
      opacity: fromVars.opacity !== undefined ? fromVars.opacity : startOpacity,
    };

    // Apply immediate starting state to Konva
    target.setAttrs(state);
    target.getLayer()?.batchDraw();

    const tween = gsap.to(state, {
      ...toVars,
      onUpdate: () => {
        target.setAttrs(state);
        target.getLayer()?.batchDraw();
      },
      onComplete: () => {
        // Reset properties to original designed state on complete to avoid saving tweened position
        target.setAttrs({
          x: startX,
          y: startY,
          rotation: startRot,
          scaleX: startScaleX,
          scaleY: startScaleY,
          opacity: startOpacity,
        });
        target.getLayer()?.batchDraw();
      }
    });

    if (timeline) {
      timeline.add(tween, settings.startTime);
      return timeline;
    }
    return tween;
  } else {
    // DOM Element animation
    if (timeline) {
      if (preset.type === 'builtin') {
        timeline.fromTo(target, fromVars, toVars, settings.startTime);
      } else {
        // Custom preset timing setup
        const firstKf = preset.keyframes?.[0];
        const initialVars: any = {};
        if (firstKf) {
          if (firstKf.opacity !== undefined) initialVars.opacity = firstKf.opacity;
          if (firstKf.rotation !== undefined) initialVars.rotation = firstKf.rotation;
          if (firstKf.x !== undefined) initialVars.x = firstKf.x;
          if (firstKf.y !== undefined) initialVars.y = firstKf.y;
          if (firstKf.scaleX !== undefined) {
            initialVars.scaleX = firstKf.scaleX;
            initialVars.scaleY = firstKf.scaleY ?? firstKf.scaleX;
          }
        }
        timeline.set(target, initialVars, settings.startTime);
        timeline.to(target, toVars, settings.startTime);
      }
      return timeline;
    } else {
      // Standalone tween
      if (preset.type === 'builtin') {
        gsap.set(target, fromVars);
        return gsap.to(target, toVars);
      } else {
        // Custom preset
        const firstKf = preset.keyframes?.[0];
        const initialVars: any = {};
        if (firstKf) {
          if (firstKf.opacity !== undefined) initialVars.opacity = firstKf.opacity;
          if (firstKf.rotation !== undefined) initialVars.rotation = firstKf.rotation;
          if (firstKf.x !== undefined) initialVars.x = firstKf.x;
          if (firstKf.y !== undefined) initialVars.y = firstKf.y;
          if (firstKf.scaleX !== undefined) {
            initialVars.scaleX = firstKf.scaleX;
            initialVars.scaleY = firstKf.scaleY ?? firstKf.scaleX;
          }
        }
        gsap.set(target, initialVars);
        return gsap.to(target, toVars);
      }
    }
  }
};
