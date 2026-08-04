import React, { useState, useEffect, useRef } from 'react';
import { useStoryStore } from '../store/useStoryStore';
import { StoryPlayer } from '../player/StoryPlayer';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import styles from './StoryBuilder.module.css';
import type { Story } from '../core/types';

interface StoryBuilderProps {
  initialData?: Story;
  onSave?: (story: Story) => void;
}

export const StoryBuilder: React.FC<StoryBuilderProps> = ({ initialData, onSave }) => {
  const { story, loadStory, activeSlideId } = useStoryStore();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'slides' | 'templates' | 'background'>('slides');
  const autosaveTimeout = useRef<number | null>(null);

  // Initialize story
  useEffect(() => {
    if (initialData) {
      loadStory(initialData);
    } else {
      // Create a default blank story
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

  // Debounced autosave mechanism
  useEffect(() => {
    if (!story || !onSave) return;

    if (autosaveTimeout.current) {
      window.clearTimeout(autosaveTimeout.current);
    }

    autosaveTimeout.current = window.setTimeout(() => {
      onSave(story);
    }, 1500); // 1.5 seconds debounce

    return () => {
      if (autosaveTimeout.current) {
        window.clearTimeout(autosaveTimeout.current);
      }
    };
  }, [story, onSave]);

  if (!story) {
    return <div className={styles.noSlides}>جاري التحميل...</div>;
  }

  return (
    <div className={styles.builderContainer}>
      <Toolbar onPreviewToggle={() => setIsPreviewOpen(true)} />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <Canvas />
      
      <PropertiesPanel />

      {/* Fullscreen Player Preview Modal */}
      {isPreviewOpen && (
        <div className={styles.playerModalOverlay} onClick={() => setIsPreviewOpen(false)}>
          <div className={styles.playerModalContent} onClick={(e) => e.stopPropagation()}>
            <StoryPlayer story={story} onClose={() => setIsPreviewOpen(false)} initialSlideId={activeSlideId} />
          </div>
        </div>
      )}
    </div>
  );
};
