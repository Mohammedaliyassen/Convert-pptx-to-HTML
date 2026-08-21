import React from 'react';
import { useStore } from 'zustand';
import { useStoryStore } from '../../store/useStoryStore';
import { Play, Plus, Copy, Trash2, Globe, Undo, Redo, FileJson, Layers } from 'lucide-react';
import styles from '../StoryBuilder.module.css';

interface ToolbarProps {
  onPreviewToggle: () => void;
}

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
  } = useStoryStore();

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
    const jsonString = JSON.stringify(story, null, 2);
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
        <button
          className={styles.btn}
          onClick={handleExportJson}
          title={t('تصدير JSON', 'Export JSON')}
        >
          <FileJson size={15} />
          <span>JSON</span>
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
