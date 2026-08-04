import React, { useState } from 'react';
import { useStoryStore } from '../../store/useStoryStore';
import { TEMPLATE_CATALOG } from '../../templates/templates';
import { Plus, Trash2, Type, Upload } from 'lucide-react';
import styles from '../StoryBuilder.module.css';
import { compressImageToBase64 } from '../../utils/imageCompressor';

interface SidebarProps {
  activeTab: 'slides' | 'templates' | 'background';
  setActiveTab: (tab: 'slides' | 'templates' | 'background') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const {
    story,
    activeSlideId,
    setActiveSlideId,
    deleteSlide,
    addSlide,
    updateSlideBackground,
    addElement,
    loadStory,
    updateSlideDuration,
    updateAllSlidesDuration,
  } = useStoryStore();

  const [imageUrl, setImageUrl] = useState('');
  const [batchDuration, setBatchDuration] = useState(4);

  if (!story) return null;

  const activeSlide = story.slides.find((s) => s.id === activeSlideId);

  // Background style thumbnail helper
  const getThumbnailStyle = (bg: any): React.CSSProperties => {
    if (bg.type === 'color') return { backgroundColor: bg.value };
    if (bg.type === 'gradient') return { background: bg.value };
    if (bg.type === 'image') return { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover' };
    return { backgroundColor: '#ffffff' };
  };

  // Add Default Text Element
  const handleAddText = () => {
    addElement({
      type: 'text',
      text: 'اكتب نصك هنا...',
      fontFamily: 'Cairo',
      fontSize: 32,
      color: story.direction === 'rtl' ? '#ffffff' : '#000000', // adjust depending on bg color
      bold: false,
      italic: false,
      underline: false,
      align: story.direction === 'rtl' ? 'right' : 'left',
      dir: story.direction,
      x: 300,
      y: 200,
      width: 600,
      height: 80,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      animation: null,
    });
  };

  // Add Custom Image Element
  const handleAddImage = () => {
    const url = imageUrl.trim() || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop';
    addElement({
      type: 'image',
      src: url,
      x: 400,
      y: 150,
      width: 400,
      height: 300,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      animation: null,
    });
    setImageUrl('');
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImageToBase64(file);
      addElement({
        type: 'image',
        src: base64,
        x: 400,
        y: 150,
        width: 400,
        height: 300,
        rotation: 0,
        opacity: 1,
        locked: false,
        hidden: false,
        animation: null,
      });
      // Clear standard file inputs
      e.target.value = '';
    } catch (err) {
      console.error('Failed to upload image file:', err);
      alert('فشل تحميل الصورة المضغوطة.');
    }
  };

  const handleBgImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImageToBase64(file);
      updateSlideBackground(activeSlideId!, { type: 'image', value: base64 });
      e.target.value = '';
    } catch (err) {
      console.error('Failed to upload background image:', err);
      alert('فشل تحميل صورة الخلفية.');
    }
  };

  // Quick background color updater
  const handleBgColorUpdate = (color: string) => {
    if (!activeSlideId) return;
    updateSlideBackground(activeSlideId, { type: 'color', value: color });
  };

  const handleBgGradientUpdate = (gradient: string) => {
    if (!activeSlideId) return;
    updateSlideBackground(activeSlideId, { type: 'gradient', value: gradient });
  };

  const handleBgImageUrlUpdate = (url: string) => {
    if (!activeSlideId || !url.trim()) return;
    updateSlideBackground(activeSlideId, { type: 'image', value: url.trim() });
  };

  const presetColors = [
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
    '#f87171', '#fb923c', '#fbbf24', '#34d399',
    '#60a5fa', '#818cf8', '#a78bfa', '#f472b6',
    '#000000', '#1a1b1f', '#2a2b30', '#3a3b40',
  ];

  const presetGradients = [
    'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
  ];

  return (
    <aside className={styles.sidebar}>
      {/* Tabs list */}
      <div className={styles.tabButtons}>
        <button
          className={`${styles.tabButton} ${activeTab === 'slides' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('slides')}
        >
          الشرائح
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'templates' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          القوالب
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'background' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('background')}
        >
          الخلفية
        </button>
      </div>

      <div className={styles.sidebarContent}>
        {/* TAB 1: SLIDES LIST */}
        {activeTab === 'slides' && (
          <>
            <div className={styles.controlGroup}>
              <button className={`${styles.btn} ${styles.btnActive}`} onClick={handleAddText}>
                <Type size={16} />
                <span>إضافة مربع نص</span>
              </button>
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlGroupLabel}>إضافة صورة برابط:</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="رابط الصورة (URL)..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={styles.input}
                  style={{ flex: 1, minWidth: 0 }}
                />
                <button className={styles.btn} onClick={handleAddImage} title="إدراج صورة">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className={styles.controlGroup} style={{ marginTop: '8px' }}>
              <label className={styles.controlGroupLabel}>أو تحميل صورة من جهازك:</label>
              <label
                className={styles.btn}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: '1px dashed #4facfe',
                  background: 'rgba(79, 172, 254, 0.05)',
                  color: '#4facfe',
                  padding: '8px',
                  fontSize: '0.8rem',
                }}
              >
                <Upload size={14} />
                <span>تحميل صورة مفردة 📁</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #34373f', margin: '8px 0' }} />

            <div className={styles.slidesList}>
              <div className={styles.sidebarHeader}>جميع الشرائح</div>
              {story.slides.map((slide, index) => {
                const isActive = slide.id === activeSlideId;
                // Try to find a snippet of text inside slide to display as description
                const textElement = slide.elements.find((el) => el.type === 'text') as any;
                const snippet = textElement ? textElement.text : '';

                return (
                  <div
                    key={slide.id}
                    className={`${styles.slideThumbnailCard} ${isActive ? styles.slideThumbnailCardActive : ''}`}
                    onClick={() => setActiveSlideId(slide.id)}
                  >
                    <div className={styles.thumbnailRatioBox}>
                      <div
                        className={styles.thumbnailPreview}
                        style={getThumbnailStyle(slide.background)}
                      >
                        {snippet && (
                          <div className={styles.thumbnailMiniText}>
                            {snippet.substring(0, 15)}...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <span className={styles.thumbnailLabel}>
                      {index + 1}
                    </span>

                    <button
                      className={styles.thumbnailDeleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(slide.id);
                      }}
                      disabled={story.slides.length <= 1}
                      title="حذف الشريحة"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
              
              <button className={styles.btn} onClick={addSlide} style={{ marginTop: '8px' }}>
                <Plus size={14} />
                <span>إضافة شريحة فارغة</span>
              </button>
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: '#26282e', borderRadius: '6px', border: '1px solid #34373f' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', direction: 'rtl' }}>
                <span>⏱️ زمن عرض الشرائح</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', direction: 'rtl' }}>
                <span style={{ fontSize: '0.75rem', color: '#ced4da' }}>الزمن الافتراضي:</span>
                <span style={{ fontSize: '0.8rem', color: '#4facfe', fontWeight: 'bold' }}>{batchDuration} ثانية</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={batchDuration}
                onChange={(e) => setBatchDuration(parseInt(e.target.value, 10))}
                style={{ width: '100%', marginBottom: '12px', accentColor: '#4facfe', height: '4px', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', gap: '6px', direction: 'rtl' }}>
                <button
                  className={styles.btn}
                  style={{ flex: 1, padding: '6px 0', fontSize: '0.75rem' }}
                  onClick={() => {
                    if (activeSlideId) {
                      updateSlideDuration(activeSlideId, batchDuration);
                      alert('تم تحديث زمن الشريحة الحالية');
                    }
                  }}
                >
                  الشريحة الحالية
                </button>
                <button
                  className={`${styles.btn} ${styles.btnActive}`}
                  style={{ flex: 1, padding: '6px 0', fontSize: '0.75rem' }}
                  onClick={() => {
                    updateAllSlidesDuration(batchDuration);
                    alert('تم تحديث زمن جميع الشرائح');
                  }}
                >
                  تطبيق على الكل
                </button>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: TEMPLATE SELECTOR */}
        {activeTab === 'templates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className={styles.sidebarHeader}>اختر قالبًا للبدء</div>
            {TEMPLATE_CATALOG.map((tpl) => (
              <div
                key={tpl.id}
                className={styles.templateCard}
                onClick={() => {
                  if (window.confirm(`هل أنت متأكد من رغبتك في تحميل قالب "${tpl.name}"؟ سيؤدي ذلك إلى استبدال التصميم الحالي بالكامل.`)) {
                    loadStory(tpl.story);
                  }
                }}
              >
                <div className={styles.templateTitle}>{tpl.name}</div>
                <div className={styles.templateDesc}>{tpl.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: BACKGROUND STYLES */}
        {activeTab === 'background' && activeSlide && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.sidebarHeader}>تخصيص خلفية الشريحة</div>

            {/* Colors Grid */}
            <div className={styles.controlGroup}>
              <label className={styles.controlGroupLabel}>الألوان الجاهزة:</label>
              <div className={styles.backgroundPresetGrid}>
                {presetColors.map((color) => (
                  <div
                    key={color}
                    className={styles.colorSwatch}
                    style={{ backgroundColor: color }}
                    onClick={() => handleBgColorUpdate(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color Input */}
            <div className={styles.controlGroup}>
              <label className={styles.controlGroupLabel}>لون مخصص:</label>
              <div className={styles.colorInputRow}>
                <input
                  type="color"
                  value={activeSlide.background.type === 'color' ? activeSlide.background.value : '#ffffff'}
                  onChange={(e) => handleBgColorUpdate(e.target.value)}
                  className={styles.colorPicker}
                />
                <input
                  type="text"
                  value={activeSlide.background.type === 'color' ? activeSlide.background.value : ''}
                  onChange={(e) => handleBgColorUpdate(e.target.value)}
                  placeholder="#ffffff"
                  className={styles.input}
                  style={{ width: '100px' }}
                />
              </div>
            </div>

            {/* Gradients */}
            <div className={styles.controlGroup}>
              <label className={styles.controlGroupLabel}>تدرجات لونية جاهزة:</label>
              <div className={styles.backgroundPresetGrid}>
                {presetGradients.map((gradient, index) => (
                  <div
                    key={index}
                    className={styles.colorSwatch}
                    style={{ background: gradient }}
                    onClick={() => handleBgGradientUpdate(gradient)}
                    title={`Gradient ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Image background URL */}
            <div className={styles.controlGroup}>
              <label className={styles.controlGroupLabel}>خلفية صورة (برابط URL):</label>
              <input
                type="text"
                placeholder="أدخل رابط الصورة..."
                value={activeSlide.background.type === 'image' ? activeSlide.background.value : ''}
                onChange={(e) => handleBgImageUrlUpdate(e.target.value)}
                className={styles.input}
              />
              <span style={{ fontSize: '0.7rem', color: '#8f9099' }}>
                أدخل رابط صورة مباشر (مثل Unsplash) لاستخدامه كخلفية للشريحة الحالية.
              </span>
            </div>

            <div className={styles.controlGroup} style={{ marginTop: '8px' }}>
              <label className={styles.controlGroupLabel}>أو تحميل صورة خلفية من جهازك:</label>
              <label
                className={styles.btn}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: '1px dashed #4facfe',
                  background: 'rgba(79, 172, 254, 0.05)',
                  color: '#4facfe',
                  padding: '8px',
                  fontSize: '0.8rem',
                }}
              >
                <Upload size={14} />
                <span>تحميل صورة الخلفية 📁</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBgImageFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
