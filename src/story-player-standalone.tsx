import { createRoot } from 'react-dom/client';
import { StoryPlayer } from './story-engine/player/StoryPlayer';
import type { Story } from './story-engine/core/types';

// Export React component for modular React/Next.js integrations
export { StoryPlayer };

interface RenderOptions {
  onClose?: () => void;
}

// Attach renderer to window for vanilla JS / UMD drop-in embeds
(window as any).renderStoryPlayer = (
  containerId: string,
  storyData: Story,
  options?: RenderOptions
) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID "${containerId}" not found.`);
    return null;
  }

  // Create react root and render player
  const root = createRoot(container);
  root.render(
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <StoryPlayer 
        story={storyData} 
        onClose={options?.onClose} 
      />
    </div>
  );

  return {
    destroy: () => {
      root.unmount();
    }
  };
};
