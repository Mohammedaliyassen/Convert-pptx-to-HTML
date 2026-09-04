import React, { useState } from 'react';
import { useStoryStore } from '../../store/useStoryStore';
import type { TextElement, TextSpan, ImageElement } from '../../core/types';
import { Trash2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Star, Sparkles, Play, Palette } from 'lucide-react';
import styles from '../StoryBuilder.module.css';
import { BUILTIN_PRESETS, PRESET_CATEGORIES } from '../../utils/animationEngine';
import { AnimationCreator } from './AnimationCreator';
import { AudioRecorder } from './AudioRecorder';
import { GOOGLE_ARABIC_FONTS, loadGoogleFont } from '../../utils/fontLoader';

export const PropertiesPanel: React.FC = () => {
  const {
    story,
    activeSlideId,
    selectedElementId,
    updateElement,
    updateTextSpans,
    deleteElement,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    customPresets,
    favoritePresetIds,
    toggleFavoritePreset,
    deleteCustomPreset,
    setElementAnimation,
    upsertClickTrigger,
    removeClickTrigger,
  } = useStoryStore();

  const [isCustomCreatorOpen, setIsCustomCreatorOpen] = useState(false);

  if (!story || !activeSlideId) return null;

  const currentSlide = story.slides.find((s) => s.id === activeSlideId);
  if (!currentSlide) return null;

  const selectedElement = currentSlide.elements.find((el) => el.id === selectedElementId);

  // Quick text element styling update
  const handleTextChange = (text: string) => {
    if (!selectedElementId) return;
    updateElement(selectedElementId, { text });
  };

  const handleStyleToggle = (styleType: 'bold' | 'italic' | 'underline') => {
    if (!selectedElementId || !selectedElement || selectedElement.type !== 'text') return;
    const textEl = selectedElement as TextElement;
    updateElement(selectedElementId, { [styleType]: !textEl[styleType] });
  };

  const handleAlignChange = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (!selectedElementId) return;
    updateElement(selectedElementId, { align });
  };

  const handleDirectionChange = (dir: 'rtl' | 'ltr') => {
    if (!selectedElementId) return;
    const align = dir === 'rtl' ? 'right' : 'left';
    updateElement(selectedElementId, { dir, align });
  };

  const handleFontSizeChange = (size: number) => {
    if (!selectedElementId) return;
    updateElement(selectedElementId, { fontSize: Math.max(8, size) });
  };

  const handleColorChange = (color: string) => {
    if (!selectedElementId) return;
    updateElement(selectedElementId, { color });
  };

  const handleSpanColorChange = (index: number, color: string) => {
    if (!selectedElementId) return;
    const el = selectedElement as TextElement;
    if (!el || !el.spans) return;
    const next = el.spans.map((span, i) => (i === index ? { ...span, color } : span));
    updateTextSpans(selectedElementId, next);
  };

  const handleLineHeightChange = (lineHeight: number) => {
    if (!selectedElementId) return;
    updateElement(selectedElementId, { lineHeight });
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    if (!selectedElementId) return;
    loadGoogleFont(fontFamily);
    updateElement(selectedElementId, { fontFamily });
  };

  const handleOpacityChange = (opacity: number) => {
    if (!selectedElementId) return;
    updateElement(selectedElementId, { opacity: Math.max(0, Math.min(1, opacity)) });
  };

  const handleImageSrcChange = (src: string) => {
    if (!selectedElementId) return;
    updateElement(selectedElementId, { src });
  };

  const isRTL = story.direction === 'rtl';

  return (
    <aside className={styles.inspector}>
      <div className={styles.inspectorSection}>
        <div className={styles.sectionTitle}>
          {isRTL ? 'لوحة الخصائص' : 'Properties Panel'}
        </div>
      </div>

      {selectedElement ? (
        <>
          {/* COMMON PROPERTIES (Position, Size, Opacity) */}
          <div className={styles.inspectorSection}>
            <div className={styles.sectionTitle}>{isRTL ? 'الأبعاد والشفافية' : 'Dimensions & Opacity'}</div>
            
            <div className={styles.controlGroup}>
              <label className={styles.controlGroupLabel}>
                {isRTL ? `الشفافية (${Math.round(selectedElement.opacity * 100)}%)` : `Opacity (${Math.round(selectedElement.opacity * 100)}%)`}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedElement.opacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div className={styles.controlGroup} style={{ marginTop: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#8f9099' }}>X: {Math.round(selectedElement.x)}px</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#8f9099' }}>Y: {Math.round(selectedElement.y)}px</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#8f9099' }}>W: {Math.round(selectedElement.width)}px</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#8f9099' }}>H: {Math.round(selectedElement.height)}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* TEXT ELEMENT INPSECTOR */}
          {selectedElement.type === 'text' && (
            <>
              {/* Text Area */}
              <div className={styles.inspectorSection}>
                <div className={styles.sectionTitle}>{isRTL ? 'محتوى النص' : 'Text Content'}</div>
                <div className={styles.controlGroup}>
                  <textarea
                    value={(selectedElement as TextElement).text}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className={styles.textarea}
                    placeholder="اكتب شيئاً..."
                  />
                </div>
              </div>

              {/* Text Styles */}
              <div className={styles.inspectorSection}>
                <div className={styles.sectionTitle}>{isRTL ? 'تنسيق الخط' : 'Text Formatting'}</div>
                
                {/* Font Size & Direction */}
                <div className={styles.controlGroup}>
                  <label className={styles.controlGroupLabel}>{isRTL ? 'حجم الخط:' : 'Font Size:'}</label>
                  <input
                    type="number"
                    value={(selectedElement as TextElement).fontSize}
                    onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 24)}
                    className={styles.input}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                {/* Text Direction (RTL / LTR) */}
                <div className={styles.controlGroup} style={{ marginTop: '8px' }}>
                  <label className={styles.controlGroupLabel}>{isRTL ? 'اتجاه النص:' : 'Direction:'}</label>
                  <div className={styles.btnRow} style={{ marginTop: '4px' }}>
                    <button
                      className={`${styles.btn} ${(selectedElement as TextElement).dir === 'rtl' ? styles.btnActive : ''}`}
                      onClick={() => handleDirectionChange('rtl')}
                      style={{ flex: 1 }}
                      title="من اليمين لليسار (عربي)"
                    >
                      <span>RTL (عربي)</span>
                    </button>
                    <button
                      className={`${styles.btn} ${(selectedElement as TextElement).dir === 'ltr' ? styles.btnActive : ''}`}
                      onClick={() => handleDirectionChange('ltr')}
                      style={{ flex: 1 }}
                      title="من اليسار لليمين (إنجليزي)"
                    >
                      <span>LTR (إنجليزي)</span>
                    </button>
                  </div>
                </div>

                {/* Font Family Selector */}
                <div className={styles.controlGroup}>
                  <label className={styles.controlGroupLabel}>{isRTL ? 'نوع الخط:' : 'Font Family:'}</label>
                  <select
                    value={(selectedElement as TextElement).fontFamily || 'Cairo'}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                    className={styles.select}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    {GOOGLE_ARABIC_FONTS.map((font) => (
                      <option key={font.id} value={font.id}>
                        {font.name}
                      </option>
                    ))}
                    {!GOOGLE_ARABIC_FONTS.some((f) => f.id === (selectedElement as TextElement).fontFamily) && (
                      <option value={(selectedElement as TextElement).fontFamily}>
                        {(selectedElement as TextElement).fontFamily}
                      </option>
                    )}
                  </select>
                </div>

                {/* Bold/Italic/Underline */}
                <div className={styles.controlGroup}>
                  <label className={styles.controlGroupLabel}>{isRTL ? 'تأثيرات:' : 'Styles:'}</label>
                  <div className={styles.btnRow}>
                    <button
                      className={`${styles.btn} ${(selectedElement as TextElement).bold ? styles.btnActive : ''}`}
                      onClick={() => handleStyleToggle('bold')}
                      title="عريض"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      className={`${styles.btn} ${(selectedElement as TextElement).italic ? styles.btnActive : ''}`}
                      onClick={() => handleStyleToggle('italic')}
                      title="مائل"
                    >
                      <Italic size={14} />
                    </button>
                    <button
                      className={`${styles.btn} ${(selectedElement as TextElement).underline ? styles.btnActive : ''}`}
                      onClick={() => handleStyleToggle('underline')}
                      title="تسطير"
                    >
                      <Underline size={14} />
                    </button>
                  </div>
                </div>

                {/* Line Height Control */}
                <div className={styles.controlGroup}>
                  <label className={styles.controlGroupLabel}>
                    {isRTL 
                      ? `تباعد الأسطر (${(selectedElement as TextElement).lineHeight || 1.25})` 
                      : `Line Height (${(selectedElement as TextElement).lineHeight || 1.25})`}
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.05"
                    value={(selectedElement as TextElement).lineHeight || 1.25}
                    onChange={(e) => handleLineHeightChange(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                {/* Alignment */}
                <div className={styles.controlGroup}>
                  <label className={styles.controlGroupLabel}>{isRTL ? 'محاذاة:' : 'Alignment:'}</label>
                  <div className={styles.btnRow}>
                    <button
                      className={`${styles.btn} ${(selectedElement as TextElement).align === 'left' ? styles.btnActive : ''}`}
                      onClick={() => handleAlignChange('left')}
                    >
                      <AlignLeft size={14} />
                    </button>
                    <button
                      className={`${styles.btn} ${(selectedElement as TextElement).align === 'center' ? styles.btnActive : ''}`}
                      onClick={() => handleAlignChange('center')}
                    >
                      <AlignCenter size={14} />
                    </button>
                    <button
                      className={`${styles.btn} ${(selectedElement as TextElement).align === 'right' ? styles.btnActive : ''}`}
                      onClick={() => handleAlignChange('right')}
                    >
                      <AlignRight size={14} />
                    </button>
                    <button
                      className={`${styles.btn} ${(selectedElement as TextElement).align === 'justify' ? styles.btnActive : ''}`}
                      onClick={() => handleAlignChange('justify')}
                    >
                      <AlignJustify size={14} />
                    </button>
                  </div>
                </div>

                {/* Color */}
                <div className={styles.controlGroup}>
                  <label className={styles.controlGroupLabel}>{isRTL ? 'لون النص:' : 'Text Color:'}</label>
                  <div className={styles.colorInputRow}>
                    <input
                      type="color"
                      value={(selectedElement as TextElement).color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className={styles.colorPicker}
                    />
                    <input
                      type="text"
                      value={(selectedElement as TextElement).color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className={styles.input}
                      style={{ width: '100px' }}
                    />
                  </div>
                </div>

                {/* Multi-color runs editor — lets you pick a color per styled run */}
                {(selectedElement as TextElement).spans &&
                  (selectedElement as TextElement).spans!.length > 1 && (
                  <div className={styles.controlGroup} style={{ marginTop: '12px' }}>
                    <label className={styles.controlGroupLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Palette size={13} />
                      {isRTL ? 'تلوين المقاطع:' : 'Color per segment:'}
                    </label>
                    <div className={styles.spansEditor}>
                      {(selectedElement as TextElement).spans!.map((span: TextSpan, i: number) => (
                        <div key={i} className={styles.spanRow}>
                          <input
                            type="color"
                            value={span.color || (selectedElement as TextElement).color}
                            onChange={(e) => handleSpanColorChange(i, e.target.value)}
                            className={styles.colorPicker}
                            title={isRTL ? 'لون هذا المقطع' : 'Color of this segment'}
                          />
                          <span
                            className={styles.spanPreview}
                            style={{
                              color: span.color || (selectedElement as TextElement).color,
                            }}
                            dir={span.dir || 'auto'}
                          >
                            {span.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* IMAGE ELEMENT INSPECTOR */}
          {selectedElement.type === 'image' && (
            <div className={styles.inspectorSection}>
              <div className={styles.sectionTitle}>{isRTL ? 'تعديل رابط الصورة' : 'Image URL Source'}</div>
              <div className={styles.controlGroup}>
                <input
                  type="text"
                  value={(selectedElement as ImageElement).src}
                  onChange={(e) => handleImageSrcChange(e.target.value)}
                  className={styles.input}
                  placeholder="رابط الصورة مباشر..."
                />
              </div>
            </div>
          )}

          {/* LAYER ARRANGEMENT CONTROLS */}
          <div className={styles.inspectorSection}>
            <div className={styles.sectionTitle}>{isRTL ? 'ترتيب الطبقة' : 'Arrange Layer'}</div>
            <div className={styles.controlGroup}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className={styles.btn} onClick={() => bringToFront(selectedElement.id)} title="إحضار للمقدمة">
                  {isRTL ? 'أول طبقة ⬆️' : 'To Front ⬆️'}
                </button>
                <button className={styles.btn} onClick={() => sendToBack(selectedElement.id)} title="إرسال للخلفية">
                  {isRTL ? 'آخر طبقة ⬇️' : 'To Back ⬇️'}
                </button>
                <button className={styles.btn} onClick={() => bringForward(selectedElement.id)} title="تقديم للأمام">
                  {isRTL ? 'لأمام ↗️' : 'Forward ↗️'}
                </button>
                <button className={styles.btn} onClick={() => sendBackward(selectedElement.id)} title="تأخير للخلف">
                  {isRTL ? 'للخلف ↙️' : 'Backward ↙️'}
                </button>
              </div>
            </div>
          </div>

          {/* DELETE ELEMENT */}
          {/* ANIMATION CONTROLS SECTION */}
          <div className={styles.inspectorSection}>
            <div className={styles.sectionTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{isRTL ? 'حركات العنصر ✨' : 'Element Animations ✨'}</span>
              <button 
                className={styles.textBtn} 
                onClick={() => setIsCustomCreatorOpen(true)}
                style={{ fontSize: '0.75rem', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Sparkles size={12} />
                <span>{isRTL ? 'تخصيص' : 'Custom'}</span>
              </button>
            </div>
            
            {!selectedElement.animation ? (
              <button
                className={styles.btn}
                style={{ width: '100%', marginTop: '8px' }}
                onClick={() => setElementAnimation(selectedElement.id, {
                  presetId: 'fade',
                  startTime: 0,
                  duration: 1,
                  delay: 0,
                  repeat: 0
                })}
              >
                {isRTL ? '+ إضافة حركة دخول' : '+ Add Entrance Animation'}
              </button>
            ) : (
              <div className={styles.controlGroup} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                {/* Preset Selector */}
                <div>
                  <label className={styles.controlGroupLabel}>{isRTL ? 'نوع الحركة:' : 'Animation Type:'}</label>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <select
                      value={selectedElement.animation.presetId}
                      onChange={(e) => setElementAnimation(selectedElement.id, {
                        ...selectedElement.animation!,
                        presetId: e.target.value
                      })}
                      className={styles.input}
                      style={{ flex: 1 }}
                    >
                      {PRESET_CATEGORIES.map(cat => {
                        const items = [
                          ...BUILTIN_PRESETS.filter(p => (p.category || 'entrance') === cat.id),
                          ...(cat.id === 'custom' ? customPresets : []),
                        ];
                        if (items.length === 0) return null;
                        return (
                          <optgroup key={cat.id} label={isRTL ? cat.labelAr : cat.labelEn}>
                            {items.map(p => (
                              <option key={p.id} value={p.id}>
                                {(p.icon ? p.icon + ' ' : '') + p.name}{favoritePresetIds.includes(p.id) ? ' ★' : ''}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                    </select>
                    
                    {/* Favorite toggle */}
                    <button
                      className={`${styles.btn}`}
                      style={{ padding: '8px' }}
                      onClick={() => toggleFavoritePreset(selectedElement.animation!.presetId)}
                      title={isRTL ? "تفضيل الحركة" : "Favorite preset"}
                    >
                      <Star 
                        size={14} 
                        fill={favoritePresetIds.includes(selectedElement.animation.presetId) ? "#f2c94c" : "none"}
                        color={favoritePresetIds.includes(selectedElement.animation.presetId) ? "#f2c94c" : "#8f9099"}
                      />
                    </button>

                    {/* Delete Custom Preset button (only for custom ones) */}
                    {customPresets.some(p => p.id === selectedElement.animation!.presetId) && (
                      <button
                        className={`${styles.btn} ${styles.btnDanger}`}
                        style={{ padding: '8px' }}
                        onClick={() => {
                          const id = selectedElement.animation!.presetId;
                          setElementAnimation(selectedElement.id, null);
                          deleteCustomPreset(id);
                        }}
                        title={isRTL ? "حذف من الكتالوج" : "Delete Custom Preset"}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Duration Slider */}
                <div>
                  <label className={styles.controlGroupLabel}>
                    {isRTL ? `المدة: ${selectedElement.animation.duration} ثانية` : `Duration: ${selectedElement.animation.duration}s`}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={selectedElement.animation.duration}
                    onChange={(e) => setElementAnimation(selectedElement.id, {
                      ...selectedElement.animation!,
                      duration: parseFloat(e.target.value)
                    })}
                    style={{ width: '100%', marginTop: '4px', cursor: 'pointer' }}
                  />
                </div>

                {/* Start Time Slider */}
                <div>
                  <label className={styles.controlGroupLabel}>
                    {isRTL ? `وقت البدء: ${selectedElement.animation.startTime} ثانية` : `Start Time: ${selectedElement.animation.startTime}s`}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={selectedElement.animation.startTime}
                    onChange={(e) => setElementAnimation(selectedElement.id, {
                      ...selectedElement.animation!,
                      startTime: parseFloat(e.target.value)
                    })}
                    style={{ width: '100%', marginTop: '4px', cursor: 'pointer' }}
                  />
                </div>

                {/* Delay Slider */}
                <div>
                  <label className={styles.controlGroupLabel}>
                    {isRTL ? `التأخير: ${selectedElement.animation.delay} ثانية` : `Delay: ${selectedElement.animation.delay}s`}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={selectedElement.animation.delay}
                    onChange={(e) => setElementAnimation(selectedElement.id, {
                      ...selectedElement.animation!,
                      delay: parseFloat(e.target.value)
                    })}
                    style={{ width: '100%', marginTop: '4px', cursor: 'pointer' }}
                  />
                </div>

                {/* Loop / Repeat selector */}
                <div>
                  <label className={styles.controlGroupLabel}>{isRTL ? 'التكرار (الترميز):' : 'Repeat Count:'}</label>
                  <select
                    value={selectedElement.animation.repeat}
                    onChange={(e) => setElementAnimation(selectedElement.id, {
                      ...selectedElement.animation!,
                      repeat: parseInt(e.target.value)
                    })}
                    className={styles.input}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <option value="0">{isRTL ? "مرة واحدة (بدون تكرار)" : "Once (No Repeat)"}</option>
                    <option value="1">{isRTL ? "مرتين" : "Twice"}</option>
                    <option value="2">{isRTL ? "3 مرات" : "3 Times"}</option>
                    <option value="-1">{isRTL ? "مستمر للأبد (Loop)" : "Infinite Loop"}</option>
                  </select>
                </div>


                {/* Animation sound */}
                <div>
                  <label className={styles.controlGroupLabel}>{isRTL ? 'صوت مع الحركة:' : 'Animation sound:'}</label>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <label className={styles.btn} style={{ flex: 1, cursor: 'pointer', textAlign: 'center' }}>
                      <span>{selectedElement.animation.soundSrc ? (isRTL ? '✓ صوت مرفق' : '✓ Sound attached') : (isRTL ? 'إرفاق صوت' : 'Attach sound')}</span>
                      <input
                        type="file"
                        accept="audio/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            setElementAnimation(selectedElement.id, {
                              ...selectedElement.animation!,
                              soundSrc: reader.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {selectedElement.animation.soundSrc && (
                      <button
                        className={`${styles.btn} ${styles.btnDanger}`}
                        style={{ padding: '8px 12px' }}
                        onClick={() => setElementAnimation(selectedElement.id, {
                          ...selectedElement.animation!,
                          soundSrc: null,
                        })}
                        title={isRTL ? 'إزالة الصوت' : 'Remove sound'}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview and Remove Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    className={styles.btn}
                    style={{ flex: 1 }}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('preview-element-animation', { 
                        detail: { elementId: selectedElement.id } 
                      }));
                    }}
                  >
                    <Play size={14} />
                    <span>{isRTL ? 'معاينة الحركة 👁' : 'Preview 👁'}</span>
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnDanger}`}
                    style={{ padding: '8px 12px' }}
                    onClick={() => setElementAnimation(selectedElement.id, null)}
                    title={isRTL ? "إزالة الحركة" : "Remove Animation"}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* CLICK ACTIONS — easy interactive controls */}
          <div className={styles.inspectorSection}>
            <div className={styles.sectionTitle}>
              {isRTL ? 'إجراءات النقر 🎯' : 'Click Actions 🎯'}
            </div>
            <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '0 0 10px', lineHeight: 1.4 }}>
              {isRTL
                ? 'عند النقر على هذا العنصر: تشغيل صوت وإظهار/إخفاء عناصر أخرى (مثل إجابات الاختبار).'
                : 'When this element is clicked: play a sound and show/hide other elements (e.g. quiz feedback).'}
            </p>
            {(() => {
              const slide = story?.slides.find(s => s.id === activeSlideId);
              const trigger = slide?.clickTriggers?.find(t => t.targetElementId === selectedElement.id);
              const actions = trigger?.actions || [];
              const soundAction = actions.find(a => a.type === 'playSound');
              const showIds = actions.filter(a => a.type === 'show').map(a => a.type === 'show' ? a.targetId : '');
              const otherElements = (slide?.elements || []).filter(e => e.id !== selectedElement.id);

              const saveActions = (nextActions: typeof actions) => {
                if (nextActions.length === 0) {
                  removeClickTrigger(selectedElement.id);
                } else {
                  upsertClickTrigger({
                    targetElementId: selectedElement.id,
                    actions: nextActions,
                  });
                }
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Click sound */}
                  <div>
                    <label className={styles.controlGroupLabel}>
                      {isRTL ? 'صوت عند النقر' : 'Sound on click'}
                    </label>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <label className={styles.btn} style={{ flex: 1, cursor: 'pointer', justifyContent: 'center' }}>
                        <span>{soundAction ? (isRTL ? '✓ صوت جاهز' : '✓ Sound set') : (isRTL ? '+ اختر صوت' : '+ Choose sound')}</span>
                        <input
                          type="file"
                          accept="audio/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              const rest = actions.filter(a => a.type !== 'playSound');
                              saveActions([...rest, { type: 'playSound', src: reader.result as string }]);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      {soundAction && (
                        <button
                          className={`${styles.btn} ${styles.btnDanger}`}
                          style={{ padding: '8px 10px' }}
                          onClick={() => saveActions(actions.filter(a => a.type !== 'playSound'))}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Show elements on click */}
                  <div>
                    <label className={styles.controlGroupLabel}>
                      {isRTL ? 'أظهر عند النقر' : 'Show on click'}
                    </label>
                    <select
                      className={styles.input}
                      style={{ width: '100%', marginTop: 4 }}
                      value=""
                      onChange={(e) => {
                        const id = e.target.value;
                        if (!id || showIds.includes(id)) return;
                        saveActions([...actions, { type: 'show', targetId: id }]);
                        // Feedback elements start hidden until the click reveals them
                        updateElement(id, { hidden: true });
                      }}
                    >
                      <option value="">{isRTL ? '— اختر عنصراً —' : '— Pick element —'}</option>
                      {otherElements.map(el => {
                        const label = el.type === 'text'
                          ? (el.text || '').slice(0, 40) || 'Text'
                          : (isRTL ? 'صورة' : 'Image');
                        return (
                          <option key={el.id} value={el.id} disabled={showIds.includes(el.id)}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                    {showIds.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                        {showIds.map(id => {
                          const el = otherElements.find(e => e.id === id);
                          const label = el?.type === 'text'
                            ? (el.text || '').slice(0, 18) || id.slice(0, 6)
                            : (isRTL ? 'صورة' : 'Img');
                          return (
                            <span
                              key={id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                background: 'rgba(99,102,241,0.2)',
                                border: '1px solid rgba(99,102,241,0.35)',
                                borderRadius: 999,
                                padding: '2px 8px',
                                fontSize: '0.7rem',
                              }}
                            >
                              {label}
                              <button
                                style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                                onClick={() => saveActions(actions.filter(a => !(a.type === 'show' && a.targetId === id)))}
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {trigger && (
                    <button
                      className={`${styles.btn} ${styles.btnDanger}`}
                      style={{ width: '100%' }}
                      onClick={() => removeClickTrigger(selectedElement.id)}
                    >
                      {isRTL ? 'إزالة كل إجراءات النقر' : 'Clear all click actions'}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>

          <div className={styles.inspectorSection} style={{ marginTop: 'auto' }}>
            <button
              className={`${styles.btn} ${styles.btnDanger}`}
              style={{ width: '100%' }}
              onClick={() => deleteElement(selectedElement.id)}
            >
              <Trash2 size={16} />
              <span>{isRTL ? 'حذف هذا العنصر' : 'Delete Selected Element'}</span>
            </button>
          </div>
        </>
      ) : (
        <div style={{ padding: '20px', color: '#8f9099' }}>
          <AudioRecorder />
          
          <hr style={{ border: 'none', borderTop: '1px solid #34373f', margin: '20px 0' }} />
          
          <div style={{ textAlign: isRTL ? 'right' : 'left', fontSize: '0.75rem', color: '#6c757d', direction: isRTL ? 'rtl' : 'ltr' }}>
            <strong>💡 {isRTL ? 'تلميحات للتعديل:' : 'Editing Tips:'}</strong>
            <ul style={{ 
              paddingRight: isRTL ? '16px' : '0', 
              paddingLeft: isRTL ? '0' : '16px', 
              marginTop: '8px', 
              lineHeight: '1.6',
              textAlign: isRTL ? 'right' : 'left'
            }}>
              {isRTL ? (
                <>
                  <li>اسحب العناصر بالماوس لتغيير مواضعها.</li>
                  <li>استخدم المقابض الزرقاء للتحجيم والتدوير.</li>
                  <li>اضغط Backspace أو Delete لحذف العنصر المحدد.</li>
                  <li>عدل خلفية الشريحة من تبويب "الخلفية" باليسار.</li>
                  <li>للحركة: اختر عنصراً ← أضف حركة ← رتّبها من شريط الحركات بالأسفل.</li>
                  <li>للتفاعل: اختر زر/إجابة ← إجراءات النقر ← صوت + إظهار عنصر.</li>
                </>
              ) : (
                <>
                  <li>Drag elements on the canvas to reposition them.</li>
                  <li>Use the handles to scale and rotate elements.</li>
                  <li>Press Backspace or Delete to remove elements.</li>
                  <li>Modify slide backgrounds via the left sidebar tab.</li>
                  <li>Animation: select element → add animation → reorder in the bottom timeline.</li>
                  <li>Interaction: select answer → Click Actions → sound + show element.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
      {isCustomCreatorOpen && (
        <AnimationCreator onClose={() => setIsCustomCreatorOpen(false)} />
      )}
    </aside>
  );
};
