import React, { useState, useEffect, useRef } from 'react';
import { useStoryStore } from '../store/useStoryStore';
import { StoryPlayer } from '../player/StoryPlayer';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { AnimationTimeline } from './components/AnimationTimeline';
import styles from './StoryBuilder.module.css';
import './theme.css';
import type { Story } from '../core/types';
import { Layers, SlidersHorizontal, X } from 'lucide-react';

interface StoryBuilderProps {
  initialData?: Story;
  onSave?: (story: Story) => void;
}

export const StoryBuilder: React.FC<StoryBuilderProps> = ({ initialData, onSave }) => {
  const { story, loadStory, activeSlideId, themeMode } = useStoryStore();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'slides' | 'templates' | 'background'>('slides');
  const [mobilePanel, setMobilePanel] = useState<'none' | 'sidebar' | 'inspector'>('none');
  const autosaveTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (initialData) {
      loadStory(initialData);
    } else {
      const blankStory: Story = {
        id: Math.random().toString(36).substring(2, 9),
        title: 'قصة غير معنونة',
        language: 'ar',
        direction: 'rtl',
        slides: [
          {
            id: Math.random().toString(36).substring(2, 9),
            background: { type: 'color', value: '#ffffff' },
            elements: [],
          },
        ],
      };
      loadStory(blankStory);
    }
  }, [initialData, loadStory]);

  useEffect(() => {
    if (!story || !onSave) return;
    if (autosaveTimeout.current) window.clearTimeout(autosaveTimeout.current);
    autosaveTimeout.current = window.setTimeout(() => onSave(story), 1500);
    return () => {
      if (autosaveTimeout.current) window.clearTimeout(autosaveTimeout.current);
    };
  }, [story, onSave]);

  // Close mobile drawers on wide screens
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) setMobilePanel('none');
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Global undo/redo shortcuts (skip when typing in inputs)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const { undo, redo } = useStoryStore.temporal.getState();
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!story) {
    return <div className={styles.noSlides}>جاري التحميل...</div>;
  }

  const rtl = story.direction === 'rtl';

  return (
    <div className={styles.builderContainer} data-theme={themeMode} data-mobile-panel={mobilePanel}>
      <Toolbar onPreviewToggle={() => setIsPreviewOpen(true)} />

      {/* Mobile top quick actions */}
      <div className={styles.mobileBar}>
        <button
          type="button"
          className={`${styles.mobileBarBtn} ${mobilePanel === 'sidebar' ? styles.mobileBarBtnActive : ''}`}
          onClick={() => setMobilePanel((p) => (p === 'sidebar' ? 'none' : 'sidebar'))}
        >
          <Layers size={16} />
          <span>{rtl ? 'الشرائح' : 'Slides'}</span>
        </button>
        <button
          type="button"
          className={`${styles.mobileBarBtn} ${mobilePanel === 'inspector' ? styles.mobileBarBtnActive : ''}`}
          onClick={() => setMobilePanel((p) => (p === 'inspector' ? 'none' : 'inspector'))}
        >
          <SlidersHorizontal size={16} />
          <span>{rtl ? 'الخصائص' : 'Props'}</span>
        </button>
      </div>

      {/* Backdrop when a mobile drawer is open */}
      {mobilePanel !== 'none' && (
        <button
          type="button"
          className={styles.mobileBackdrop}
          aria-label="Close panel"
          onClick={() => setMobilePanel('none')}
        />
      )}

      <aside
        className={`${styles.sidebarShell} ${mobilePanel === 'sidebar' ? styles.drawerOpen : ''}`}
      >
        <div className={styles.drawerHeaderMobile}>
          <span>{rtl ? 'الشرائح والقوالب' : 'Slides & templates'}</span>
          <button type="button" className={styles.drawerCloseBtn} onClick={() => setMobilePanel('none')}>
            <X size={18} />
          </button>
        </div>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      <div className={styles.centerColumn}>
        <Canvas />
        <AnimationTimeline />
      </div>

      <aside
        className={`${styles.inspectorShell} ${mobilePanel === 'inspector' ? styles.drawerOpen : ''}`}
      >
        <div className={styles.drawerHeaderMobile}>
          <span>{rtl ? 'الخصائص والحركات' : 'Properties & animations'}</span>
          <button type="button" className={styles.drawerCloseBtn} onClick={() => setMobilePanel('none')}>
            <X size={18} />
          </button>
        </div>
        <PropertiesPanel />
      </aside>

      {isPreviewOpen && (
        <div className={styles.playerModalOverlay} onClick={() => setIsPreviewOpen(false)}>
          <div className={styles.playerModalContent} onClick={(e) => e.stopPropagation()}>
            <StoryPlayer
              story={story}
              onClose={() => setIsPreviewOpen(false)}
              initialSlideId={activeSlideId}
            />
          </div>
        </div>
      )}
    </div>
  );
};
