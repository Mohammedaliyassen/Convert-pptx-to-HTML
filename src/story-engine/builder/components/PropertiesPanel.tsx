import React, { useState } from 'react';
import { useStoryStore } from '../../store/useStoryStore';
import type { TextElement, ImageElement } from '../../core/types';
import { Trash2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Star, Sparkles, Play } from 'lucide-react';
import styles from '../StoryBuilder.module.css';
import { BUILTIN_PRESETS } from '../../utils/animationEngine';
import { AnimationCreator } from './AnimationCreator';
import { AudioRecorder } from './AudioRecorder';
import { GOOGLE_ARABIC_FONTS, loadGoogleFont } from '../../utils/fontLoader';

export const PropertiesPanel: React.FC = () => {
  const {
    story,
    activeSlideId,
    selectedElementId,
    updateElement,
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
                      <optgroup label={isRTL ? "الحركات الافتراضية" : "Built-in Presets"}>
                        {BUILTIN_PRESETS.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} {favoritePresetIds.includes(p.id) ? '★' : ''}
                          </option>
                        ))}
                      </optgroup>
                      {customPresets.length > 0 && (
                        <optgroup label={isRTL ? "الحركات المخصصة" : "Custom Presets"}>
                          {customPresets.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} {favoritePresetIds.includes(p.id) ? '★' : ''}
                            </option>
                          ))}
                        </optgroup>
                      )}
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
                </>
              ) : (
                <>
                  <li>Drag elements on the canvas to reposition them.</li>
                  <li>Use the handles to scale and rotate elements.</li>
                  <li>Press Backspace or Delete to remove elements.</li>
                  <li>Modify slide backgrounds via the left sidebar tab.</li>
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
