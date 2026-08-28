import gsap from 'gsap';
import type { AnimationPreset } from '../core/types';

export const BUILTIN_PRESETS: AnimationPreset[] = [
  // —— Entrance ——
  { id: 'fade', name: 'تلاشي (Fade In)', type: 'builtin', category: 'entrance', icon: '✨' },
  { id: 'float-up', name: 'طفو للأعلى (Float Up)', type: 'builtin', category: 'entrance', icon: '🎈' },
  { id: 'float-down', name: 'طفو للأسفل (Float Down)', type: 'builtin', category: 'entrance', icon: '🎈' },
  { id: 'zoom', name: 'تكبير (Zoom In)', type: 'builtin', category: 'entrance', icon: '🔍' },
  { id: 'slide-left', name: 'انزلاق لليسار', type: 'builtin', category: 'entrance', icon: '⬅️' },
  { id: 'slide-right', name: 'انزلاق لليمين', type: 'builtin', category: 'entrance', icon: '➡️' },
  { id: 'slide-up', name: 'انزلاق للأعلى', type: 'builtin', category: 'entrance', icon: '⬆️' },
  { id: 'slide-down', name: 'انزلاق للأسفل', type: 'builtin', category: 'entrance', icon: '⬇️' },
  { id: 'rotate', name: 'دوران (Rotate)', type: 'builtin', category: 'entrance', icon: '🔄' },
  { id: 'bounce', name: 'ارتداد (Bounce)', type: 'builtin', category: 'entrance', icon: '🏀' },
  { id: 'flip', name: 'انقلاب 3D (Flip)', type: 'builtin', category: 'entrance', icon: '🃏' },
  { id: 'pop', name: 'ظهور مفاجئ (Pop)', type: 'builtin', category: 'entrance', icon: '💥' },
  { id: 'blur-in', name: 'ضبابية للوضوح', type: 'builtin', category: 'entrance', icon: '🌫️' },
  { id: 'typewriter', name: 'آلة كاتبة (نص)', type: 'builtin', category: 'entrance', icon: '⌨️' },
  // —— Emphasis ——
  { id: 'pulse', name: 'نبض (Pulse)', type: 'builtin', category: 'emphasis', icon: '💓' },
  { id: 'shake', name: 'اهتزاز (Shake)', type: 'builtin', category: 'emphasis', icon: '📳' },
  { id: 'wiggle', name: 'تمايل (Wiggle)', type: 'builtin', category: 'emphasis', icon: '🌊' },
  { id: 'glow', name: 'توهج (Glow)', type: 'builtin', category: 'emphasis', icon: '🌟' },
  // —— Exit ——
  { id: 'fade-out', name: 'اختفاء تدريجي', type: 'builtin', category: 'exit', icon: '👻' },
  { id: 'zoom-out', name: 'تصغير واختفاء', type: 'builtin', category: 'exit', icon: '📉' },
  { id: 'slide-out-left', name: 'خروج لليسار', type: 'builtin', category: 'exit', icon: '🚪' },
  { id: 'slide-out-right', name: 'خروج لليمين', type: 'builtin', category: 'exit', icon: '🚪' },
];

export const PRESET_CATEGORIES = [
  { id: 'entrance' as const, labelAr: 'دخول', labelEn: 'Entrance' },
  { id: 'emphasis' as const, labelAr: 'تأكيد', labelEn: 'Emphasis' },
  { id: 'exit' as const, labelAr: 'خروج', labelEn: 'Exit' },
  { id: 'custom' as const, labelAr: 'مخصص', labelEn: 'Custom' },
];

export const applyAnimation = (
  target: any,
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

  let fromVars: any = {};
  let toVars: any = { duration, delay, repeat, ease };
  const presetId = preset.id;

  if (preset.type === 'builtin') {
    switch (presetId) {
      case 'fade':
        fromVars = { opacity: 0 };
        toVars = { ...toVars, opacity: 1 };
        break;
      case 'float-up': {
        // Matches PowerPoint "Float Up": fade + small upward travel (~8% height / 40px)
        const dy = isKonva ? 40 : 40;
        fromVars = isKonva
          ? { y: target.y() + dy, opacity: 0 }
          : { y: dy, opacity: 0 };
        toVars = isKonva
          ? { ...toVars, y: target.y(), opacity: 1, ease: 'power1.out' }
          : { ...toVars, y: 0, opacity: 1, ease: 'power1.out' };
        break;
      }
      case 'float-down': {
        const dy = isKonva ? 40 : 40;
        fromVars = isKonva
          ? { y: target.y() - dy, opacity: 0 }
          : { y: -dy, opacity: 0 };
        toVars = isKonva
          ? { ...toVars, y: target.y(), opacity: 1, ease: 'power1.out' }
          : { ...toVars, y: 0, opacity: 1, ease: 'power1.out' };
        break;
      }
      case 'fade-out':
        fromVars = { opacity: 1 };
        toVars = { ...toVars, opacity: 0 };
        break;
      case 'zoom':
        fromVars = isKonva ? { scaleX: 0, scaleY: 0, opacity: 0 } : { scale: 0, opacity: 0 };
        toVars = isKonva
          ? { ...toVars, scaleX: 1, scaleY: 1, opacity: 1 }
          : { ...toVars, scale: 1, opacity: 1 };
        break;
      case 'zoom-out':
        fromVars = isKonva ? { scaleX: 1, scaleY: 1, opacity: 1 } : { scale: 1, opacity: 1 };
        toVars = isKonva
          ? { ...toVars, scaleX: 0, scaleY: 0, opacity: 0 }
          : { ...toVars, scale: 0, opacity: 0 };
        break;
      case 'pop':
        fromVars = isKonva ? { scaleX: 0.3, scaleY: 0.3, opacity: 0 } : { scale: 0.3, opacity: 0 };
        toVars = isKonva
          ? { ...toVars, scaleX: 1, scaleY: 1, opacity: 1, ease: 'back.out(1.7)' }
          : { ...toVars, scale: 1, opacity: 1, ease: 'back.out(1.7)' };
        break;
      case 'slide-left':
        fromVars = isKonva ? { x: target.x() - 300, opacity: 0 } : { x: -300, opacity: 0 };
        toVars = isKonva
          ? { ...toVars, x: target.x(), opacity: 1 }
          : { ...toVars, x: 0, opacity: 1 };
        break;
      case 'slide-right':
        fromVars = isKonva ? { x: target.x() + 300, opacity: 0 } : { x: 300, opacity: 0 };
        toVars = isKonva
          ? { ...toVars, x: target.x(), opacity: 1 }
          : { ...toVars, x: 0, opacity: 1 };
        break;
      case 'slide-up':
        fromVars = isKonva ? { y: target.y() + 300, opacity: 0 } : { y: 300, opacity: 0 };
        toVars = isKonva
          ? { ...toVars, y: target.y(), opacity: 1 }
          : { ...toVars, y: 0, opacity: 1 };
        break;
      case 'slide-down':
        fromVars = isKonva ? { y: target.y() - 300, opacity: 0 } : { y: -300, opacity: 0 };
        toVars = isKonva
          ? { ...toVars, y: target.y(), opacity: 1 }
          : { ...toVars, y: 0, opacity: 1 };
        break;
      case 'slide-out-left':
        fromVars = isKonva ? { x: target.x(), opacity: 1 } : { x: 0, opacity: 1 };
        toVars = isKonva
          ? { ...toVars, x: target.x() - 400, opacity: 0 }
          : { ...toVars, x: -400, opacity: 0 };
        break;
      case 'slide-out-right':
        fromVars = isKonva ? { x: target.x(), opacity: 1 } : { x: 0, opacity: 1 };
        toVars = isKonva
          ? { ...toVars, x: target.x() + 400, opacity: 0 }
          : { ...toVars, x: 400, opacity: 0 };
        break;
      case 'rotate':
        fromVars = isKonva
          ? { rotation: target.rotation() - 180, opacity: 0 }
          : { rotate: -180, opacity: 0 };
        toVars = isKonva
          ? { ...toVars, rotation: target.rotation(), opacity: 1 }
          : { ...toVars, rotate: 0, opacity: 1 };
        break;
      case 'bounce':
        fromVars = isKonva ? { y: target.y() - 150 } : { y: -150 };
        toVars = isKonva
          ? { ...toVars, y: target.y(), ease: 'bounce.out' }
          : { ...toVars, y: 0, ease: 'bounce.out' };
        break;
      case 'flip':
        fromVars = isKonva
          ? { rotationY: -180, opacity: 0 }
          : { transformPerspective: 600, rotateY: -180, opacity: 0 };
        toVars = isKonva
          ? { ...toVars, rotationY: 0, opacity: 1 }
          : { ...toVars, rotateY: 0, opacity: 1 };
        break;
      case 'blur-in':
        fromVars = isKonva
          ? { opacity: 0 }
          : { opacity: 0, filter: 'blur(12px)' };
        toVars = isKonva
          ? { ...toVars, opacity: 1 }
          : { ...toVars, opacity: 1, filter: 'blur(0px)' };
        break;
      case 'typewriter':
        // Best-effort: fade + slight slide for non-text targets
        fromVars = { opacity: 0, x: isKonva ? undefined : -20 };
        toVars = { ...toVars, opacity: 1, x: isKonva ? undefined : 0, ease: 'none' };
        break;
      case 'pulse':
        if (isKonva) {
          fromVars = { scaleX: 1, scaleY: 1 };
          toVars = {
            ...toVars,
            scaleX: 1.12,
            scaleY: 1.12,
            yoyo: true,
            repeat: repeat === 0 ? 1 : repeat,
            ease: 'power1.inOut',
          };
        } else {
          fromVars = { scale: 1 };
          toVars = {
            ...toVars,
            scale: 1.12,
            yoyo: true,
            repeat: repeat === 0 ? 1 : repeat,
            ease: 'power1.inOut',
          };
        }
        break;
      case 'shake':
        if (isKonva) {
          const baseX = target.x();
          fromVars = { x: baseX };
          toVars = {
            ...toVars,
            keyframes: [
              { x: baseX - 8 },
              { x: baseX + 8 },
              { x: baseX - 6 },
              { x: baseX + 6 },
              { x: baseX },
            ],
            ease: 'power1.inOut',
          };
        } else {
          fromVars = { x: 0 };
          toVars = {
            ...toVars,
            keyframes: [{ x: -8 }, { x: 8 }, { x: -6 }, { x: 6 }, { x: 0 }],
            ease: 'power1.inOut',
          };
        }
        break;
      case 'wiggle':
        if (isKonva) {
          const base = target.rotation();
          fromVars = { rotation: base };
          toVars = {
            ...toVars,
            keyframes: [
              { rotation: base - 8 },
              { rotation: base + 8 },
              { rotation: base - 5 },
              { rotation: base + 5 },
              { rotation: base },
            ],
          };
        } else {
          fromVars = { rotate: 0 };
          toVars = {
            ...toVars,
            keyframes: [
              { rotate: -8 },
              { rotate: 8 },
              { rotate: -5 },
              { rotate: 5 },
              { rotate: 0 },
            ],
          };
        }
        break;
      case 'glow':
        fromVars = isKonva ? { opacity: 1 } : { filter: 'brightness(1)' };
        toVars = isKonva
          ? { ...toVars, opacity: 1 }
          : {
              ...toVars,
              keyframes: [
                { filter: 'brightness(1)' },
                { filter: 'brightness(1.4)' },
                { filter: 'brightness(1)' },
              ],
              ease: 'power1.inOut',
            };
        break;
      default:
        return null;
    }
  } else if (preset.type === 'custom' && preset.keyframes) {
    const kfs = preset.keyframes.map((kf) => {
      const kfObj: any = {};
      if (kf.opacity !== undefined) kfObj.opacity = kf.opacity;
      if (kf.rotation !== undefined)
        kfObj.rotation = isKonva ? target.rotation() + kf.rotation : kf.rotation;
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

  if (isKonva) {
    const startX = target.x();
    const startY = target.y();
    const startRot = target.rotation();
    const startScaleX = target.scaleX();
    const startScaleY = target.scaleY();
    const startOpacity = target.opacity();

    const state = {
      x: fromVars.x !== undefined ? fromVars.x : startX,
      y: fromVars.y !== undefined ? fromVars.y : startY,
      rotation: fromVars.rotation !== undefined ? fromVars.rotation : startRot,
      scaleX: fromVars.scaleX !== undefined ? fromVars.scaleX : startScaleX,
      scaleY: fromVars.scaleY !== undefined ? fromVars.scaleY : startScaleY,
      opacity: fromVars.opacity !== undefined ? fromVars.opacity : startOpacity,
    };

    target.setAttrs(state);
    target.getLayer()?.batchDraw();

    const tween = gsap.to(state, {
      ...toVars,
      onUpdate: () => {
        target.setAttrs(state);
        target.getLayer()?.batchDraw();
      },
      onComplete: () => {
        target.setAttrs({
          x: startX,
          y: startY,
          rotation: startRot,
          scaleX: startScaleX,
          scaleY: startScaleY,
          opacity: startOpacity,
        });
        target.getLayer()?.batchDraw();
      },
    });

    if (timeline) {
      timeline.add(tween, settings.startTime);
      return timeline;
    }
    return tween;
  } else {
    if (timeline) {
      if (preset.type === 'builtin') {
        timeline.fromTo(target, fromVars, toVars, settings.startTime);
      } else {
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
      if (preset.type === 'builtin') {
        gsap.set(target, fromVars);
        return gsap.to(target, toVars);
      } else {
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
