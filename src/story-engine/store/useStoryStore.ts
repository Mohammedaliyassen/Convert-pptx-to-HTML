import { create } from 'zustand';
import { temporal } from 'zundo';
import type { Story, Slide, StoryElement, SlideBackground, NewStoryElement, AnimationPreset, ClickTrigger, ClickAction, StageFormatId } from '../core/types';

// Helper to generate safe IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

export interface StoryState {
  story: Story | null;
  activeSlideId: string | null;
  selectedElementId: string | null;
  zoom: number;
  /** null = auto-fit to container */
  zoomMode: 'auto' | 'manual';
  themeMode: 'dark' | 'light';

  
  // Actions
  loadStory: (story: Story) => void;
  setStoryTitle: (title: string) => void;
  setStorySettings: (settings: { title?: string; language?: 'ar' | 'en'; direction?: 'ltr' | 'rtl' }) => void;
  setActiveSlideId: (slideId: string) => void;
  setSelectedElementId: (elementId: string | null) => void;
  addSlide: () => void;
  duplicateSlide: (slideId: string) => void;
  deleteSlide: (slideId: string) => void;
  reorderSlides: (slideIds: string[]) => void;
  updateSlideBackground: (slideId: string, background: SlideBackground) => void;
  addElement: (element: NewStoryElement) => void;
  updateElement: (elementId: string, updates: Partial<StoryElement>) => void;
  deleteElement: (elementId: string) => void;
  setZoom: (zoom: number) => void;
  setZoomMode: (mode: 'auto' | 'manual') => void;
  setThemeMode: (mode: 'dark' | 'light') => void;
  setStageFormat: (formatId: StageFormatId) => void;

  bringToFront: (elementId: string) => void;
  sendToBack: (elementId: string) => void;
  bringForward: (elementId: string) => void;
  sendBackward: (elementId: string) => void;
  updateSlideAudio: (slideId: string, audio: Slide['audio']) => void;
  deleteSlideAudio: (slideId: string) => void;
  updateSlideDuration: (slideId: string, duration: number) => void;
  updateAllSlidesDuration: (duration: number) => void;
  
  // Animation Studio Actions
  customPresets: AnimationPreset[];
  favoritePresetIds: string[];
  saveCustomPreset: (preset: AnimationPreset) => void;
  deleteCustomPreset: (presetId: string) => void;
  toggleFavoritePreset: (presetId: string) => void;
  setElementAnimation: (elementId: string, animation: StoryElement['animation']) => void;
  /** Replace all click triggers on the active slide */
  setSlideClickTriggers: (triggers: ClickTrigger[]) => void;
  /** Add or merge a click trigger for an element on the active slide */
  upsertClickTrigger: (trigger: ClickTrigger) => void;
  /** Remove click trigger for an element */
  removeClickTrigger: (elementId: string) => void;
}

export const useStoryStore = create<StoryState>()(
  temporal(
    (set, get) => ({
      story: null,
      activeSlideId: null,
      selectedElementId: null,
      zoom: 1,
      customPresets: (() => {
        try {
          const val = localStorage.getItem('story_engine_custom_presets');
          return val ? JSON.parse(val) : [];
        } catch {
          return [];
        }
      })(),
      favoritePresetIds: (() => {
        try {
          const val = localStorage.getItem('story_engine_favorite_presets');
          return val ? JSON.parse(val) : [];
        } catch {
          return [];
        }
      })(),

  loadStory: (story) => {
    const firstSlideId = story.slides[0]?.id || null;
    set({
      story,
      activeSlideId: firstSlideId,
      selectedElementId: null,
      zoom: 1,
    });
  },

  setStoryTitle: (title) => {
    const { story } = get();
    if (!story) return;
    set({
      story: { ...story, title },
    });
  },

  setStorySettings: (settings) => {
    const { story } = get();
    if (!story) return;
    set({
      story: { ...story, ...settings },
    });
  },

  setActiveSlideId: (slideId) => {
    set({ activeSlideId: slideId, selectedElementId: null });
  },

  setSelectedElementId: (elementId) => {
    set({ selectedElementId: elementId });
  },

  addSlide: () => {
    const { story } = get();
    if (!story) return;

    const newSlideId = generateId();
    const newSlide: Slide = {
      id: newSlideId,
      background: { type: 'color', value: '#ffffff' },
      elements: [],
    };

    set({
      story: {
        ...story,
        slides: [...story.slides, newSlide],
      },
      activeSlideId: newSlideId,
      selectedElementId: null,
    });
  },

  duplicateSlide: (slideId) => {
    const { story } = get();
    if (!story) return;

    const slideIndex = story.slides.findIndex((s) => s.id === slideId);
    if (slideIndex === -1) return;

    const sourceSlide = story.slides[slideIndex];
    const newSlideId = generateId();
    
    // Deep copy elements and assign new IDs to prevent collisions
    const duplicatedElements = sourceSlide.elements.map((el) => ({
      ...el,
      id: generateId(),
    }));

    const newSlide: Slide = {
      ...sourceSlide,
      id: newSlideId,
      elements: duplicatedElements as StoryElement[],
    };

    const newSlides = [...story.slides];
    newSlides.splice(slideIndex + 1, 0, newSlide);

    set({
      story: {
        ...story,
        slides: newSlides,
      },
      activeSlideId: newSlideId,
      selectedElementId: null,
    });
  },

  deleteSlide: (slideId) => {
    const { story, activeSlideId } = get();
    if (!story) return;
    
    // Keep at least one slide
    if (story.slides.length <= 1) return;

    const slideIndex = story.slides.findIndex((s) => s.id === slideId);
    if (slideIndex === -1) return;

    const newSlides = story.slides.filter((s) => s.id !== slideId);
    
    let nextActiveId = activeSlideId;
    if (activeSlideId === slideId) {
      // If we deleted the active slide, select the adjacent one
      const adjacentIndex = slideIndex === 0 ? 0 : slideIndex - 1;
      nextActiveId = newSlides[adjacentIndex].id;
    }

    set({
      story: {
        ...story,
        slides: newSlides,
      },
      activeSlideId: nextActiveId,
      selectedElementId: null,
    });
  },

  reorderSlides: (slideIds) => {
    const { story } = get();
    if (!story) return;

    // Create a lookup map for slides
    const slideMap = new Map(story.slides.map((s) => [s.id, s]));
    const reordered = slideIds
      .map((id) => slideMap.get(id))
      .filter((s): s is Slide => !!s);

    set({
      story: {
        ...story,
        slides: reordered,
      },
    });
  },

  updateSlideBackground: (slideId, background) => {
    const { story } = get();
    if (!story) return;

    const updatedSlides = story.slides.map((s) => {
      if (s.id !== slideId) return s;
      return { ...s, background };
    });

    set({
      story: {
        ...story,
        slides: updatedSlides,
      },
    });
  },

  updateSlideAudio: (slideId, audio) => {
    const { story } = get();
    if (!story) return;

    const updatedSlides = story.slides.map((s) => {
      if (s.id !== slideId) return s;
      return { ...s, audio };
    });

    set({
      story: {
        ...story,
        slides: updatedSlides,
      },
    });
  },

  deleteSlideAudio: (slideId) => {
    const { story } = get();
    if (!story) return;

    const updatedSlides = story.slides.map((s) => {
      if (s.id !== slideId) return s;
      return { ...s, audio: null };
    });

    set({
      story: {
        ...story,
        slides: updatedSlides,
      },
    });
  },

  updateSlideDuration: (slideId, duration) => {
    const { story } = get();
    if (!story) return;

    const updatedSlides = story.slides.map((s) => {
      if (s.id !== slideId) return s;
      return { ...s, duration };
    });

    set({
      story: {
        ...story,
        slides: updatedSlides,
      },
    });
  },

  updateAllSlidesDuration: (duration) => {
    const { story } = get();
    if (!story) return;

    const updatedSlides = story.slides.map((s) => {
      return { ...s, duration };
    });

    set({
      story: {
        ...story,
        slides: updatedSlides,
      },
    });
  },

  addElement: (element) => {
    const { story, activeSlideId } = get();
    if (!story || !activeSlideId) return;

    const newElementId = generateId();

    const updatedSlides = story.slides.map((slide) => {
      if (slide.id !== activeSlideId) return slide;
      
      const nextZIndex = slide.elements.length;
      const newElement: StoryElement = {
        ...element,
        id: newElementId,
        zIndex: nextZIndex,
      } as StoryElement;

      return {
        ...slide,
        elements: [...slide.elements, newElement],
      };
    });

    set({
      story: {
        ...story,
        slides: updatedSlides,
      },
      selectedElementId: newElementId,
    });
  },

  updateElement: (elementId, updates) => {
    const { story, activeSlideId } = get();
    if (!story || !activeSlideId) return;

    const updatedSlides = story.slides.map((slide) => {
      if (slide.id !== activeSlideId) return slide;

      const updatedElements = slide.elements.map((el) => {
        if (el.id !== elementId) return el;
        // Merge updates
        return {
          ...el,
          ...updates,
        };
      });

      return {
        ...slide,
        elements: updatedElements as StoryElement[],
      };
    });

    set({
      story: {
        ...story,
        slides: updatedSlides,
      },
    });
  },

  deleteElement: (elementId) => {
    const { story, activeSlideId, selectedElementId } = get();
    if (!story || !activeSlideId) return;

    const updatedSlides = story.slides.map((slide) => {
      if (slide.id !== activeSlideId) return slide;

      const filteredElements = slide.elements
        .filter((el) => el.id !== elementId)
        // Recalculate zIndices to keep them sequential
        .map((el, index) => ({ ...el, zIndex: index }));

      return {
        ...slide,
        elements: filteredElements as StoryElement[],
      };
    });

    set({
      story: {
        ...story,
        slides: updatedSlides,
      },
      selectedElementId: selectedElementId === elementId ? null : selectedElementId,
    });
  },

  bringToFront: (elementId) => {
    const { story, activeSlideId } = get();
    if (!story || !activeSlideId) return;
    
    const updatedSlides = story.slides.map((slide) => {
      if (slide.id !== activeSlideId) return slide;
      const targetEl = slide.elements.find(el => el.id === elementId);
      if (!targetEl) return slide;
      const remaining = slide.elements.filter(el => el.id !== elementId);
      const reindexed = [...remaining, targetEl].map((el, i) => ({ ...el, zIndex: i }));
      return { ...slide, elements: reindexed as StoryElement[] };
    });

    set({
      story: {
        ...story,
        slides: updatedSlides,
      }
    });
  },

  sendToBack: (elementId) => {
    const { story, activeSlideId } = get();
    if (!story || !activeSlideId) return;
    
    const updatedSlides = story.slides.map((slide) => {
      if (slide.id !== activeSlideId) return slide;
      const targetEl = slide.elements.find(el => el.id === elementId);
      if (!targetEl) return slide;
      const remaining = slide.elements.filter(el => el.id !== elementId);
      const reindexed = [targetEl, ...remaining].map((el, i) => ({ ...el, zIndex: i }));
      return { ...slide, elements: reindexed as StoryElement[] };
    });

    set({
      story: {
        ...story,
        slides: updatedSlides,
      }
    });
  },

  bringForward: (elementId) => {
    const { story, activeSlideId } = get();
    if (!story || !activeSlideId) return;
    
    const updatedSlides = story.slides.map((slide) => {
      if (slide.id !== activeSlideId) return slide;
      const sorted = [...slide.elements].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex(el => el.id === elementId);
      if (index === -1 || index === sorted.length - 1) return slide;
      
      const temp = sorted[index];
      sorted[index] = sorted[index + 1];
      sorted[index + 1] = temp;
      
      const reindexed = sorted.map((el, i) => ({ ...el, zIndex: i }));
      return { ...slide, elements: reindexed as StoryElement[] };
    });

    set({
      story: {
        ...story,
        slides: updatedSlides,
      }
    });
  },

  sendBackward: (elementId) => {
    const { story, activeSlideId } = get();
    if (!story || !activeSlideId) return;
    
    const updatedSlides = story.slides.map((slide) => {
      if (slide.id !== activeSlideId) return slide;
      const sorted = [...slide.elements].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex(el => el.id === elementId);
      if (index <= 0) return slide;
      
      const temp = sorted[index];
      sorted[index] = sorted[index - 1];
      sorted[index - 1] = temp;
      
      const reindexed = sorted.map((el, i) => ({ ...el, zIndex: i }));
      return { ...slide, elements: reindexed as StoryElement[] };
    });

    set({
      story: {
        ...story,
        slides: updatedSlides,
      }
    });
  },

  saveCustomPreset: (preset) => {
    const { customPresets } = get();
    const updated = [...customPresets.filter((p) => p.id !== preset.id), preset];
    localStorage.setItem('story_engine_custom_presets', JSON.stringify(updated));
    set({ customPresets: updated });
  },

  deleteCustomPreset: (presetId) => {
    const { customPresets, favoritePresetIds } = get();
    const updatedPresets = customPresets.filter((p) => p.id !== presetId);
    const updatedFavorites = favoritePresetIds.filter((id) => id !== presetId);
    localStorage.setItem('story_engine_custom_presets', JSON.stringify(updatedPresets));
    localStorage.setItem('story_engine_favorite_presets', JSON.stringify(updatedFavorites));
    set({ customPresets: updatedPresets, favoritePresetIds: updatedFavorites });
  },

  toggleFavoritePreset: (presetId) => {
    const { favoritePresetIds } = get();
    const isFav = favoritePresetIds.includes(presetId);
    const updated = isFav
      ? favoritePresetIds.filter((id) => id !== presetId)
      : [...favoritePresetIds, presetId];
    localStorage.setItem('story_engine_favorite_presets', JSON.stringify(updated));
    set({ favoritePresetIds: updated });
  },

  setElementAnimation: (elementId, animation) => {
    const { story, activeSlideId } = get();
    if (!story || !activeSlideId) return;

    const updatedSlides = story.slides.map((slide) => {
      if (slide.id !== activeSlideId) return slide;
      return {
        ...slide,
        elements: slide.elements.map((el) => {
          if (el.id !== elementId) return el;
          return { ...el, animation } as StoryElement;
        }),
      };
    });

    set({
      story: {
        ...story,
        slides: updatedSlides,
      },
    });
  },


  setSlideClickTriggers: (triggers) => {
    const { story, activeSlideId } = get();
    if (!story || !activeSlideId) return;
    const updatedSlides = story.slides.map((slide) => {
      if (slide.id !== activeSlideId) return slide;
      return { ...slide, clickTriggers: triggers.length ? triggers : undefined };
    });
    set({ story: { ...story, slides: updatedSlides } });
  },

  upsertClickTrigger: (trigger) => {
    const { story, activeSlideId } = get();
    if (!story || !activeSlideId) return;
    const updatedSlides = story.slides.map((slide) => {
      if (slide.id !== activeSlideId) return slide;
      const existing = slide.clickTriggers || [];
      const filtered = existing.filter((t) => t.targetElementId !== trigger.targetElementId);
      return { ...slide, clickTriggers: [...filtered, trigger] };
    });
    set({ story: { ...story, slides: updatedSlides } });
  },

  removeClickTrigger: (elementId) => {
    const { story, activeSlideId } = get();
    if (!story || !activeSlideId) return;
    const updatedSlides = story.slides.map((slide) => {
      if (slide.id !== activeSlideId) return slide;
      const next = (slide.clickTriggers || []).filter((t) => t.targetElementId !== elementId);
      return { ...slide, clickTriggers: next.length ? next : undefined };
    });
    set({ story: { ...story, slides: updatedSlides } });
  },

  setZoom: (zoom) => {
    set({ zoom, zoomMode: 'manual' });
  },

  setZoomMode: (mode) => {
    set({ zoomMode: mode });
  },

  setThemeMode: (mode) => {
    try { localStorage.setItem('story_engine_theme', mode); } catch { /* ignore */ }
    set({ themeMode: mode });
  },

  setStageFormat: (formatId) => {
    const { story } = get();
    if (!story) return;
    set({ story: { ...story, stageFormat: formatId } });
  },
    }),
    {
      limit: 50,
      partialize: (state) => ({ story: state.story }),
    }
  )
);
