import React, { useMemo, useState, useCallback, useRef } from 'react';
import { useStoryStore } from '../../store/useStoryStore';
import { BUILTIN_PRESETS, PRESET_CATEGORIES } from '../../utils/animationEngine';
import type { StoryElement, AnimationPreset } from '../../core/types';
import {
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Trash2,
  Music,
  Sparkles,
  ListOrdered,
  Wand2,
  Volume2,
  VolumeX,
  Clock,
} from 'lucide-react';
import styles from './AnimationTimeline.module.css';

type AnimRow = {
  element: StoryElement;
  preset: AnimationPreset | undefined;
  order: number;
};

export const AnimationTimeline: React.FC = () => {
  const {
    story,
    activeSlideId,
    selectedElementId,
    setSelectedElementId,
    setElementAnimation,
    customPresets,
  } = useStoryStore();

  const isRTL = story?.direction === 'rtl';
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [gapSec, setGapSec] = useState(0.4);
  const previewAudios = useRef<HTMLAudioElement[]>([]);

  const activeSlide = story?.slides.find((s) => s.id === activeSlideId);

  const allPresets = useMemo(
    () => [...BUILTIN_PRESETS, ...customPresets],
    [customPresets]
  );

  const rows: AnimRow[] = useMemo(() => {
    if (!activeSlide) return [];
    return activeSlide.elements
      .filter((el) => el.animation)
      .map((el) => ({
        element: el,
        preset: allPresets.find((p) => p.id === el.animation!.presetId),
        order: el.animation!.startTime,
      }))
      .sort((a, b) => a.order - b.order || a.element.zIndex - b.element.zIndex);
  }, [activeSlide, allPresets]);

  const labelForElement = (el: StoryElement) => {
    if (el.type === 'text') {
      const t = el.text.trim().replace(/\s+/g, ' ');
      return t.length > 28 ? t.slice(0, 28) + '…' : t || (isRTL ? 'نص' : 'Text');
    }
    return isRTL ? 'صورة' : 'Image';
  };

  /** Re-assign sequential startTime values after reorder */
  const applyOrder = useCallback(
    (orderedIds: string[]) => {
      if (!activeSlide) return;
      orderedIds.forEach((id, index) => {
        const el = activeSlide.elements.find((e) => e.id === id);
        if (!el?.animation) return;
        setElementAnimation(id, {
          ...el.animation,
          startTime: Math.round(index * gapSec * 100) / 100,
        });
      });
    },
    [activeSlide, gapSec, setElementAnimation]
  );

  const moveRow = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= rows.length) return;
    const ids = rows.map((r) => r.element.id);
    const tmp = ids[index];
    ids[index] = ids[next];
    ids[next] = tmp;
    applyOrder(ids);
  };

  const autoSequence = () => {
    applyOrder(rows.map((r) => r.element.id));
  };

  const removeAnimation = (elementId: string) => {
    setElementAnimation(elementId, null);
  };

  const updateStartTime = (elementId: string, startTime: number) => {
    const el = activeSlide?.elements.find((e) => e.id === elementId);
    if (!el?.animation) return;
    setElementAnimation(elementId, {
      ...el.animation,
      startTime: Math.max(0, Math.round(startTime * 10) / 10),
    });
  };

  const updateDuration = (elementId: string, duration: number) => {
    const el = activeSlide?.elements.find((e) => e.id === elementId);
    if (!el?.animation) return;
    setElementAnimation(elementId, {
      ...el.animation,
      duration: Math.max(0.1, Math.round(duration * 10) / 10),
    });
  };

  const changePreset = (elementId: string, presetId: string) => {
    const el = activeSlide?.elements.find((e) => e.id === elementId);
    if (!el?.animation) return;
    setElementAnimation(elementId, { ...el.animation, presetId });
  };

  const attachSound = async (elementId: string, file: File | null) => {
    const el = activeSlide?.elements.find((e) => e.id === elementId);
    if (!el?.animation) return;
    if (!file) {
      setElementAnimation(elementId, { ...el.animation, soundSrc: null });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setElementAnimation(elementId, {
        ...el.animation!,
        soundSrc: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const stopPreview = () => {
    previewAudios.current.forEach((a) => {
      try {
        a.pause();
        a.src = '';
      } catch {
        /* ignore */
      }
    });
    previewAudios.current = [];
    setIsPlayingPreview(false);
    window.dispatchEvent(new CustomEvent('preview-slide-animations-stop'));
  };

  const playAll = () => {
    stopPreview();
    setIsPlayingPreview(true);
    window.dispatchEvent(
      new CustomEvent('preview-slide-animations', {
        detail: { slideId: activeSlideId },
      })
    );
    // Play animation sounds on their start times
    rows.forEach((row) => {
      const src = row.element.animation?.soundSrc;
      if (!src) return;
      const audio = new Audio(src);
      previewAudios.current.push(audio);
      const t = (row.element.animation?.startTime ?? 0) * 1000;
      window.setTimeout(() => {
        audio.play().catch(() => {});
      }, t);
    });
    const maxEnd = rows.reduce((m, r) => {
      const a = r.element.animation!;
      return Math.max(m, a.startTime + a.duration + a.delay);
    }, 1);
    window.setTimeout(() => setIsPlayingPreview(false), maxEnd * 1000 + 200);
  };

  if (!activeSlide) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          {isRTL ? 'اختر شريحة لعرض الحركات' : 'Select a slide to edit animations'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <ListOrdered size={16} />
          <span>{isRTL ? 'ترتيب الحركات' : 'Animation Order'}</span>
          <span className={styles.badge}>{rows.length}</span>
        </div>
        <div className={styles.headerActions}>
          <label className={styles.gapControl} title={isRTL ? 'المسافة بين الحركات' : 'Gap between steps'}>
            <Clock size={14} />
            <input
              type="number"
              min={0.1}
              max={3}
              step={0.1}
              value={gapSec}
              onChange={(e) => setGapSec(parseFloat(e.target.value) || 0.4)}
            />
            <span>s</span>
          </label>
          <button
            className={styles.toolBtn}
            onClick={autoSequence}
            disabled={rows.length < 2}
            title={isRTL ? 'ترتيب تلقائي حسب القائمة' : 'Auto-sequence by list order'}
          >
            <Wand2 size={14} />
            <span>{isRTL ? 'تسلسل تلقائي' : 'Auto sequence'}</span>
          </button>
          <button
            className={`${styles.toolBtn} ${styles.primary}`}
            onClick={isPlayingPreview ? stopPreview : playAll}
            disabled={rows.length === 0}
          >
            {isPlayingPreview ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlayingPreview ? (isRTL ? 'إيقاف' : 'Stop') : isRTL ? 'معاينة الكل' : 'Preview all'}</span>
          </button>
        </div>
      </div>

      {/* Empty state */}
      {rows.length === 0 && (
        <div className={styles.empty}>
          <Sparkles size={28} strokeWidth={1.5} />
          <p>
            {isRTL
              ? 'لا توجد حركات على هذه الشريحة. اختر عنصراً وأضف حركة من لوحة الخصائص.'
              : 'No animations on this slide. Select an element and add an animation from the properties panel.'}
          </p>
        </div>
      )}

      {/* Timeline rows */}
      <div className={styles.list}>
        {rows.map((row, index) => {
          const el = row.element;
          const anim = el.animation!;
          const isSelected = selectedElementId === el.id;
          const hasSound = !!anim.soundSrc;

          return (
            <div
              key={el.id}
              className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}
              onClick={() => setSelectedElementId(el.id)}
            >
              {/* Order controls */}
              <div className={styles.orderBtns}>
                <button
                  className={styles.iconBtn}
                  disabled={index === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveRow(index, -1);
                  }}
                  title={isRTL ? 'تحريك لأعلى' : 'Move up'}
                >
                  <ChevronUp size={14} />
                </button>
                <span className={styles.orderNum}>{index + 1}</span>
                <button
                  className={styles.iconBtn}
                  disabled={index === rows.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveRow(index, 1);
                  }}
                  title={isRTL ? 'تحريك لأسفل' : 'Move down'}
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Element info */}
              <div className={styles.elInfo}>
                <span className={styles.elIcon}>{row.preset?.icon || '🎬'}</span>
                <div className={styles.elMeta}>
                  <span className={styles.elName}>{labelForElement(el)}</span>
                  <select
                    className={styles.presetSelect}
                    value={anim.presetId}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => changePreset(el.id, e.target.value)}
                  >
                    {PRESET_CATEGORIES.map((cat) => {
                      const items = allPresets.filter(
                        (p) => (p.category || (p.type === 'custom' ? 'custom' : 'entrance')) === cat.id
                      );
                      if (items.length === 0) return null;
                      return (
                        <optgroup
                          key={cat.id}
                          label={isRTL ? cat.labelAr : cat.labelEn}
                        >
                          {items.map((p) => (
                            <option key={p.id} value={p.id}>
                              {(p.icon ? p.icon + ' ' : '') + p.name}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Timing */}
              <div className={styles.timing} onClick={(e) => e.stopPropagation()}>
                <label>
                  <span>{isRTL ? 'بداية' : 'Start'}</span>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    step={0.1}
                    value={anim.startTime}
                    onChange={(e) => updateStartTime(el.id, parseFloat(e.target.value) || 0)}
                  />
                </label>
                <label>
                  <span>{isRTL ? 'مدة' : 'Dur'}</span>
                  <input
                    type="number"
                    min={0.1}
                    max={10}
                    step={0.1}
                    value={anim.duration}
                    onChange={(e) => updateDuration(el.id, parseFloat(e.target.value) || 0.5)}
                  />
                </label>
              </div>

              {/* Visual bar */}
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    marginInlineStart: `${Math.min(anim.startTime * 8, 70)}%`,
                    width: `${Math.min(anim.duration * 8, 30)}%`,
                  }}
                />
              </div>

              {/* Sound + delete */}
              <div className={styles.rowActions} onClick={(e) => e.stopPropagation()}>
                <label
                  className={`${styles.iconBtn} ${hasSound ? styles.soundOn : ''}`}
                  title={isRTL ? 'صوت الحركة' : 'Animation sound'}
                >
                  {hasSound ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <input
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={(e) =>
                      attachSound(el.id, e.target.files?.[0] ?? null)
                    }
                  />
                </label>
                {hasSound && (
                  <button
                    className={styles.iconBtn}
                    title={isRTL ? 'إزالة الصوت' : 'Remove sound'}
                    onClick={() => attachSound(el.id, null)}
                  >
                    <Music size={14} />
                  </button>
                )}
                <button
                  className={`${styles.iconBtn} ${styles.danger}`}
                  onClick={() => removeAnimation(el.id)}
                  title={isRTL ? 'إزالة الحركة' : 'Remove animation'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
