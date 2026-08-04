import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typesContent = `import React from 'react';

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
`;

const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write story-player.d.ts for module imports
fs.writeFileSync(path.join(distDir, 'story-player.d.ts'), typesContent);

// Duplicate as story-player.es.d.ts and story-player.umd.d.ts so TypeScript finds them regardless of the imported extension
fs.writeFileSync(path.join(distDir, 'story-player.es.d.ts'), typesContent);
fs.writeFileSync(path.join(distDir, 'story-player.umd.d.ts'), typesContent);

console.log('Successfully generated TypeScript declaration files in dist/');
