import React from 'react';

export interface Story {
  id: string;
  title: string;
  language: string;
  direction: 'rtl' | 'ltr';
  slides: any[];
  [key: string]: any;
}

export interface StoryPlayerProps {
  story: Story;
  onClose?: () => void;
  initialSlideId?: string | null;
}

export const StoryPlayer: React.FC<StoryPlayerProps>;

export interface RenderOptions {
  onClose?: () => void;
}

export function renderStoryPlayer(
  containerId: string,
  storyData: Story,
  options?: RenderOptions
): { destroy: () => void } | null;
