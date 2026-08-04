import React from 'react';
import { useStore } from 'zustand';
import { useStoryStore } from '../../store/useStoryStore';
import { Play, Plus, Copy, Trash2, Globe, Undo, Redo, FileJson } from 'lucide-react';
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
    <header className={styles.toolbar}>
      {/* Title & Lang Section */}
      <div className={styles.toolbarSection}>
        <input
          type="text"
          value={story.title}
          onChange={handleTitleChange}
          className={styles.titleInput}
          placeholder="عنوان القصة..."
        />
        <button
          className={styles.btn}
          onClick={handleLanguageToggle}
          title={story.language === 'ar' ? 'تحويل للإنجليزية' : 'Switch to Arabic'}
        >
          <Globe size={16} />
          <span>{story.language === 'ar' ? 'العربية (RTL)' : 'English (LTR)'}</span>
        </button>
      </div>

      {/* Undo/Redo Controls */}
      <div className={styles.toolbarSection}>
        <button
          className={styles.btn}
          onClick={() => undo()}
          disabled={!canUndo}
          title={story.direction === 'rtl' ? 'تراجع (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
        >
          <Undo size={14} />
          <span>{story.direction === 'rtl' ? 'تراجع' : 'Undo'}</span>
        </button>
        <button
          className={styles.btn}
          onClick={() => redo()}
          disabled={!canRedo}
          title={story.direction === 'rtl' ? 'إعادة (Ctrl+Y)' : 'Redo (Ctrl+Y)'}
        >
          <Redo size={14} />
          <span>{story.direction === 'rtl' ? 'إعادة' : 'Redo'}</span>
        </button>

        {selectedElementId && (
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={() => deleteElement(selectedElementId)}
            title={story.direction === 'rtl' ? 'حذف العنصر المحدد (Delete)' : 'Delete Selected Element (Delete)'}
          >
            <Trash2 size={14} />
            <span>{story.direction === 'rtl' ? 'حذف العنصر' : 'Delete Element'}</span>
          </button>
        )}
      </div>

      {/* Slide Operations */}
      <div className={styles.toolbarSection}>
        <button className={styles.btn} onClick={addSlide}>
          <Plus size={16} />
          <span>إضافة شريحة</span>
        </button>

        {activeSlideId && (
          <>
            <button
              className={styles.btn}
              onClick={() => duplicateSlide(activeSlideId)}
              title="تكرار الشريحة الحالية"
            >
              <Copy size={16} />
              <span>تكرار</span>
            </button>
            <button
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={() => deleteSlide(activeSlideId)}
              disabled={isDeleteDisabled}
              title="حذف الشريحة الحالية"
            >
              <Trash2 size={16} />
              <span>حذف</span>
            </button>
          </>
        )}
      </div>

      {/* Preview Section */}
      <div className={styles.toolbarSection}>
        <button
          className={styles.btn}
          onClick={handleExportJson}
          title={story.direction === 'rtl' ? 'تصدير القصة كملف JSON' : 'Export Story as JSON file'}
        >
          <FileJson size={16} />
          <span>تصدير JSON</span>
        </button>

        <button className={`${styles.btn} ${styles.btnActive}`} onClick={onPreviewToggle}>
          <Play size={16} />
          <span>تشغيل المعاينة</span>
        </button>
      </div>
    </header>
  );
};
