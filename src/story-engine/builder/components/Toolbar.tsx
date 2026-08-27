import React, { useRef } from 'react';
import { useStore } from 'zustand';
import { useStoryStore } from '../../store/useStoryStore';
import { Play, Plus, Copy, Trash2, Globe, Undo, Redo, FileJson, Layers, Upload, Sun, Moon } from 'lucide-react';
import styles from '../StoryBuilder.module.css';
import type { Story, AnimationPreset } from '../../core/types';

interface ToolbarProps {
  onPreviewToggle: () => void;
}

/** Basic shape check for a Story JSON export */
const isValidStory = (data: unknown): data is Story => {
  if (!data || typeof data !== 'object') return false;
  const s = data as Record<string, unknown>;
  return Array.isArray(s.slides);
};

export const Toolbar: React.FC<ToolbarProps> = ({ onPreviewToggle }) => {
  const {
    story,
    activeSlideId,
    setStorySettings,
    addSlide,
    duplicateSlide,
    deleteSlide,
    selectedElementId,
    deleteElement,
    loadStory,
    themeMode,
    setThemeMode,
    customPresets,
  } = useStoryStore();

  const jsonInputRef = useRef<HTMLInputElement>(null);

  const { undo, redo } = useStoryStore.temporal.getState();
  const pastStates = useStore(useStoryStore.temporal, (state) => state.pastStates);
  const futureStates = useStore(useStoryStore.temporal, (state) => state.futureStates);
  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  if (!story) return null;

  const rtl = story.direction === 'rtl';
  const t = (ar: string, en: string) => (rtl ? ar : en);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStorySettings({ title: e.target.value });
  };

  const handleLanguageToggle = () => {
    const nextLang = story.language === 'ar' ? 'en' : 'ar';
    const nextDir = nextLang === 'ar' ? 'rtl' : 'ltr';
    setStorySettings({ language: nextLang, direction: nextDir });
  };

  const isDeleteDisabled = story.slides.length <= 1;

  const handleExportJson = () => {
    if (!story) return;
    // Custom animation keyframes live only in the author's browser (localStorage).
    // Embed them (plus any per-element sound) directly onto each element's
    // animation so the exported story is fully self-contained and plays in any
    // player — including the production frontend, which has no local store.
    const customMap = new Map<string, AnimationPreset>();
    customPresets.forEach((p) => customMap.set(p.id, p));
    const exported = structuredClone(story);
    exported.slides.forEach((slide) => {
      slide.elements.forEach((el) => {
        if (el.animation?.presetId) {
          const custom = customMap.get(el.animation.presetId);
          if (custom?.keyframes?.length) {
            el.animation.keyframes = custom.keyframes;
          }
        }
      });
    });
    const jsonString = JSON.stringify(exported, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${story.title || 'story'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // allow re-selecting the same file later
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const parsed = JSON.parse(text);
        if (!isValidStory(parsed)) {
          throw new Error('Invalid story shape');
        }
        // Ensure required fields have safe defaults
        const normalized: Story = {
          id: typeof parsed.id === 'string' ? parsed.id : Math.random().toString(36).slice(2, 9),
          title: typeof parsed.title === 'string' ? parsed.title : file.name.replace(/\.json$/i, ''),
          language: parsed.language === 'en' ? 'en' : 'ar',
          direction: parsed.direction === 'ltr' ? 'ltr' : 'rtl',
          slides: parsed.slides,
        };
        loadStory(normalized);
      } catch (err) {
        console.error('JSON import failed:', err);
        alert(
          t(
            'تعذر قراءة ملف JSON. تأكد أنه مصدَّر من محرر القصص.',
            'Could not read JSON file. Make sure it was exported from the story editor.'
          )
        );
      }
    };
    reader.onerror = () => {
      alert(t('فشل قراءة الملف.', 'Failed to read the file.'));
    };
    reader.readAsText(file);
  };

  return (
    <header className={styles.toolbar} dir={story.direction}>
      <div className={styles.toolbarSection}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a5b4fc' }}>
          <Layers size={18} />
        </div>
        <input
          type="text"
          value={story.title}
          onChange={handleTitleChange}
          className={styles.titleInput}
          placeholder={t('عنوان القصة...', 'Story title...')}
        />
        <button
          className={styles.btn}
          onClick={handleLanguageToggle}
          title={t('تبديل اللغة', 'Toggle language')}
        >
          <Globe size={15} />
          <span>{story.language === 'ar' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      <div className={styles.toolbarSection}>
        <button
          className={styles.btn}
          onClick={() => undo()}
          disabled={!canUndo}
          title={t('تراجع', 'Undo')}
        >
          <Undo size={14} />
        </button>
        <button
          className={styles.btn}
          onClick={() => redo()}
          disabled={!canRedo}
          title={t('إعادة', 'Redo')}
        >
          <Redo size={14} />
        </button>

        {selectedElementId && (
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={() => deleteElement(selectedElementId)}
            title={t('حذف العنصر', 'Delete element')}
          >
            <Trash2 size={14} />
            <span>{t('حذف', 'Delete')}</span>
          </button>
        )}
      </div>

      <div className={styles.toolbarSection}>
        <button className={styles.btn} onClick={addSlide} title={t('شريحة جديدة', 'New slide')}>
          <Plus size={15} />
          <span>{t('شريحة', 'Slide')}</span>
        </button>

        {activeSlideId && (
          <>
            <button
              className={styles.btn}
              onClick={() => duplicateSlide(activeSlideId)}
              title={t('تكرار الشريحة', 'Duplicate slide')}
            >
              <Copy size={14} />
            </button>
            <button
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={() => deleteSlide(activeSlideId)}
              disabled={isDeleteDisabled}
              title={t('حذف الشريحة', 'Delete slide')}
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>

      <div className={styles.toolbarSection}>
        <input
          ref={jsonInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={handleImportJson}
        />
        <button
          className={styles.btn}
          onClick={() => jsonInputRef.current?.click()}
          title={t('استيراد قصة JSON', 'Import story JSON')}
        >
          <Upload size={15} />
          <span>{t('استيراد', 'Import')}</span>
        </button>

        <button
          className={styles.btn}
          onClick={handleExportJson}
          title={t('تصدير JSON', 'Export JSON')}
        >
          <FileJson size={15} />
          <span>{t('تصدير', 'Export')}</span>
        </button>

        <button
          className={styles.btn}
          onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          title={t('الوضع الفاتح/الداكن', 'Light / dark mode')}
        >
          {themeMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button
          className={`${styles.btn} ${styles.btnActive}`}
          onClick={onPreviewToggle}
        >
          <Play size={15} />
          <span>{t('معاينة', 'Preview')}</span>
        </button>
      </div>
    </header>
  );
};
