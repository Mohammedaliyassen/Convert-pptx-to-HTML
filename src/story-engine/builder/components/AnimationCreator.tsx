import React, { useState, useEffect, useRef } from 'react';
import { useStoryStore } from '../../store/useStoryStore';
import type { AnimationPreset, CustomKeyframe } from '../../core/types';
import { X, Save } from 'lucide-react';
import gsap from 'gsap';
import styles from './AnimationCreator.module.css';

interface AnimationCreatorProps {
  onClose: () => void;
}

export const AnimationCreator: React.FC<AnimationCreatorProps> = ({ onClose }) => {
  const { saveCustomPreset, story } = useStoryStore();
  const isRTL = story?.direction === 'rtl';

  const [presetName, setPresetName] = useState('');
  const [selectedTick, setSelectedTick] = useState<number>(0); // 0 = 0%, 1 = 50%, 2 = 100%
  
  const [keyframes, setKeyframes] = useState<CustomKeyframe[]>([
    { offset: 0, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 },
    { offset: 0.5, x: 0, y: -50, scaleX: 1.2, scaleY: 1.2, rotation: 15, opacity: 1 },
    { offset: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 }
  ]);

  const previewTargetRef = useRef<HTMLDivElement>(null);

  // Live animation loop preview
  useEffect(() => {
    if (!previewTargetRef.current) return;

    gsap.killTweensOf(previewTargetRef.current);
    // Reset starting state
    gsap.set(previewTargetRef.current, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      transformPerspective: 600
    });

    // Map keyframes to GSAP timeline format
    const timelineKeyframes = keyframes.map((kf) => ({
      x: kf.x ?? 0,
      y: kf.y ?? 0,
      scaleX: kf.scaleX ?? 1,
      scaleY: kf.scaleY ?? 1,
      rotation: kf.rotation ?? 0,
      opacity: kf.opacity ?? 1,
    }));

    // Trigger loop tween
    gsap.to(previewTargetRef.current, {
      keyframes: timelineKeyframes,
      duration: 2.5,
      repeat: -1,
      ease: 'power1.inOut'
    });

    return () => {
      if (previewTargetRef.current) {
        gsap.killTweensOf(previewTargetRef.current);
      }
    };
  }, [keyframes]);

  const handleSliderChange = (property: keyof CustomKeyframe, value: number) => {
    setKeyframes((prev) =>
      prev.map((kf, index) => {
        if (index !== selectedTick) return kf;
        return {
          ...kf,
          [property]: value
        };
      })
    );
  };

  const handleSave = () => {
    if (!presetName.trim()) {
      alert(isRTL ? 'يرجى إدخال اسم للحركة المخصصة.' : 'Please enter a name for the animation.');
      return;
    }

    const newPreset: AnimationPreset = {
      id: `anim-custom-${Math.random().toString(36).substring(2, 9)}`,
      name: presetName,
      type: 'custom',
      keyframes: keyframes,
      favorite: false
    };

    saveCustomPreset(newPreset);
    onClose();
  };

  const currentKf = keyframes[selectedTick];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3>{isRTL ? 'صانع الحركات المخصصة ✨' : 'Custom Animation Studio ✨'}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Left panel: Preview & Timeline */}
          <div className={styles.previewPanel}>
            <div className={styles.previewStage}>
              <div ref={previewTargetRef} className={styles.previewBox}>
                <span>{isRTL ? 'رائد فضاء 🚀' : 'Astronaut 🚀'}</span>
              </div>
            </div>

            {/* Timeline Tick Selector */}
            <div className={styles.timelineContainer}>
              <span className={styles.timelineLabel}>{isRTL ? 'الخط الزمني للحركة:' : 'Animation Timeline:'}</span>
              <div className={styles.timelineTicks}>
                {keyframes.map((kf, i) => (
                  <button
                    key={i}
                    className={`${styles.tickBtn} ${selectedTick === i ? styles.tickBtnActive : ''}`}
                    onClick={() => setSelectedTick(i)}
                  >
                    {Math.round(kf.offset * 100)}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Sliders */}
          <div className={styles.controlsPanel}>
            <h4 className={styles.subTitle}>
              {isRTL ? `خصائص النقطة (${Math.round(currentKf.offset * 100)}%)` : `Keyframe Settings (${Math.round(currentKf.offset * 100)}%)`}
            </h4>

            {/* Opacity */}
            <div className={styles.sliderGroup}>
              <label>
                <span>{isRTL ? 'الشفافية:' : 'Opacity:'}</span>
                <span>{Math.round((currentKf.opacity ?? 1) * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={currentKf.opacity ?? 1}
                onChange={(e) => handleSliderChange('opacity', parseFloat(e.target.value))}
              />
            </div>

            {/* Scale */}
            <div className={styles.sliderGroup}>
              <label>
                <span>{isRTL ? 'الحجم (التكبير):' : 'Scale:'}</span>
                <span>{Math.round((currentKf.scaleX ?? 1) * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.05"
                value={currentKf.scaleX ?? 1}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setKeyframes((prev) =>
                    prev.map((kf, idx) =>
                      idx === selectedTick ? { ...kf, scaleX: val, scaleY: val } : kf
                    )
                  );
                }}
              />
            </div>

            {/* Rotation */}
            <div className={styles.sliderGroup}>
              <label>
                <span>{isRTL ? 'الدوران:' : 'Rotation:'}</span>
                <span>{currentKf.rotation ?? 0}°</span>
              </label>
              <input
                type="range"
                min="-360"
                max="360"
                step="5"
                value={currentKf.rotation ?? 0}
                onChange={(e) => handleSliderChange('rotation', parseInt(e.target.value))}
              />
            </div>

            {/* X Shift */}
            <div className={styles.sliderGroup}>
              <label>
                <span>{isRTL ? 'إزاحة أفقية (X):' : 'X Shift:'}</span>
                <span>{currentKf.x ?? 0}px</span>
              </label>
              <input
                type="range"
                min="-200"
                max="200"
                step="5"
                value={currentKf.x ?? 0}
                onChange={(e) => handleSliderChange('x', parseInt(e.target.value))}
              />
            </div>

            {/* Y Shift */}
            <div className={styles.sliderGroup}>
              <label>
                <span>{isRTL ? 'إزاحة رأسية (Y):' : 'Y Shift:'}</span>
                <span>{currentKf.y ?? 0}px</span>
              </label>
              <input
                type="range"
                min="-200"
                max="200"
                step="5"
                value={currentKf.y ?? 0}
                onChange={(e) => handleSliderChange('y', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <input
            type="text"
            className={styles.nameInput}
            placeholder={isRTL ? 'أدخل اسماً للحركة (مثال: ارتعاش سريع)...' : 'Enter preset name...'}
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
          <button className={styles.saveBtn} onClick={handleSave}>
            <Save size={16} />
            <span>{isRTL ? 'حفظ الحركة بالكتالوج' : 'Save Custom Preset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
