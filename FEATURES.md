# Story Engine — Full Project (Updated)

## What's included

### PPTX import
- Extracts slides, text, images, audio
- Timed entrance animations
- **Interactive click triggers** (quiz answers, hotspots)
  - `onClick` → show/hide feedback + play sound
  - Works for correct **and** wrong answers
  - Shape → audioFile mapping for media notifications
- Interactive sequences are **not** mixed into the linear animation clock

### Animation system
- Ready-made presets by category:
  - **Entrance:** fade, zoom, pop, slides, rotate, bounce, flip, blur-in, typewriter
  - **Emphasis:** pulse, shake, wiggle, glow
  - **Exit:** fade-out, zoom-out, slide-out
- **Custom Animation Studio** (keyframe editor)
- Per-element: duration, start time, delay, repeat, **sound**

### Animation Timeline (builder)
- Order animations on the current slide (↑ / ↓)
- Auto-sequence with configurable gap
- Edit start / duration inline
- Change preset per row
- Attach / remove SFX per animation
- Preview all animations on the slide

### Player
- Timed build-step navigation (space / arrows)
- Nav buttons always advance slides (quiz slides never lock)
- Click triggers for interactive elements
- Plays element animation sounds + slide animationSounds

## Run

```bash
cd story-engine-full
npm install
npm run dev
```

## Key paths

```
src/story-engine/
  core/types.ts, schema.ts
  importers/pptx.ts
  player/StoryPlayer.tsx
  utils/animationEngine.ts
  builder/
    StoryBuilder.tsx
    components/
      AnimationTimeline.tsx   ← NEW
      AnimationCreator.tsx
      PropertiesPanel.tsx
      Canvas.tsx, Sidebar.tsx, Toolbar.tsx
  store/useStoryStore.ts
```
