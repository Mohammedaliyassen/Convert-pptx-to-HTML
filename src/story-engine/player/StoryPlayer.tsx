"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Story, Slide, StoryElement, ClickAction } from '../core/types';
import { STAGE_FORMATS } from '../core/types';
import styles from './StoryPlayer.module.css';
import { Play, Pause, ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from 'lucide-react';
import { useStoryStore } from '../store/useStoryStore';
import { applyAnimation, BUILTIN_PRESETS } from '../utils/animationEngine';
import gsap from 'gsap';
import { loadGoogleFont, getResolvedFontFamily } from '../utils/fontLoader';
import { splitBidiRuns, detectDir } from '../utils/bidi';
import { primeMedia, cachedMediaUrl, primeSlideMedia, clearMediaCache } from '../utils/mediaStore';

interface StoryPlayerProps {
  story: Story;
  onClose?: () => void;
  initialSlideId?: string | null;
}

export const StoryPlayer: React.FC<StoryPlayerProps> = ({ 
  story, 
  onClose = () => {}, 
  initialSlideId = null 
}) => {
  const initialIndex = initialSlideId ? story.slides.findIndex((s) => s.id === initialSlideId) : 0;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  // Runtime visibility overrides for interactive feedback images (correct/wrong).
  // Key = element id, value = currently visible?
  const [runtimeVisible, setRuntimeVisible] = useState<Record<string, boolean>>({});

  const playerRef = useRef<HTMLDivElement>(null);
  const autoplayTimer = useRef<any>(null);
  const playerAudioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const slideTimeline = useRef<gsap.core.Timeline | null>(null);
  // Distinct animation start-times on the current slide, in order - each one is a
  // "build step" (a PowerPoint click) that manual navigation should stop at.
  const stepTimesRef = useRef<number[]>([]);
  // "Play Sound" animation effect audio objects for the current slide, so they can be
  // stopped/reset whenever the slide changes.
  const slideSoundEffectsRef = useRef<HTMLAudioElement[]>([]);
  // Short-lived audio objects created by interactive click actions
  const clickAudioRef = useRef<HTMLAudioElement[]>([]);

  const format = STAGE_FORMATS.find((f) => f.id === (story.stageFormat || '16:9')) || STAGE_FORMATS[0];
  const baseWidth = format.width;
  const baseHeight = format.height;

  const currentSlide = story.slides[currentSlideIndex];

  // Recalculate scale to fit container while keeping 16:9 aspect ratio
  const handleResize = useCallback(() => {
    if (!playerRef.current) return;
    const containerWidth = playerRef.current.clientWidth;
    const containerHeight = playerRef.current.clientHeight;

    const scaleW = containerWidth / baseWidth;
    const scaleH = containerHeight / baseHeight;
    const newScale = Math.min(scaleW, scaleH);

    setScale(newScale);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    // Trigger layout check after full mount
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      clearMediaCache();
    };
  }, [handleResize]);

  // Decode the current slide's images (base64 data URIs from the import) once
  // into the media store and swap their srcs to instant blob URLs as each decode
  // lands; nearby slides are warmed in the background. Revisits hit the store
  // synchronously so navigation back is instant.
  const [cachedUrls, setCachedUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    const slide = currentSlide;
    if (!slide) return;
    let mounted = true;
    const items: Array<[string, string]> = [];
    if (slide.background?.type === 'image' && slide.background.value) {
      items.push([`${slide.id}:bg`, slide.background.value]);
    }
    slide.elements.forEach((el) => {
      if (el.type === 'image' && el.src) items.push([`${slide.id}:${el.id}`, el.src]);
    });
    items.forEach(([key, raw]) => {
      primeMedia(raw).then((url) => {
        if (mounted && url) {
          setCachedUrls((prev) => (prev[key] === url ? prev : { ...prev, [key]: url }));
        }
      });
    });
    const neighborIndexes = [currentSlideIndex + 1, currentSlideIndex + 2, currentSlideIndex - 1];
    neighborIndexes.forEach((i) => {
      if (i >= 0 && i < story.slides.length) primeSlideMedia(story.slides[i]);
    });
    return () => {
      mounted = false;
    };
  }, [currentSlideIndex, currentSlide, story.slides]);

  // Resolve an image src: prefer the media store's synchronized object URL,
  // then a freshly-decoded URL for this slide, then the raw base64/URL src.
  const imageSrc = useCallback((raw: string | undefined, key: string): string => {
    return cachedMediaUrl(raw ?? '') ?? cachedUrls[key] ?? raw ?? '';
  }, [cachedUrls]);

  // Reset interactive visibility + stop click SFX whenever the slide changes
  useEffect(() => {
    setRuntimeVisible({});
    clickAudioRef.current.forEach((a) => {
      try {
        a.pause();
        a.src = '';
      } catch {
        /* ignore */
      }
    });
    clickAudioRef.current = [];
  }, [currentSlideIndex]);

  // Preload every distinct text font up front so the correct typeface (esp. Dubai
  // from the CDN) is ready before the first slide paints. Without this the title
  // can flash/fall back to another Arabic font while the webfont loads, making
  // the same font-size render differently.
  useEffect(() => {
    const families = new Set<string>();
    story.slides.forEach((slide) => {
      if (!slide) return;
      slide.elements.forEach((el) => {
        if (el.type === 'text' && el.fontFamily) {
          families.add(el.fontFamily);
        }
      });
    });
    families.forEach((family) => loadGoogleFont(family));
  }, [story.slides]);

  // Handle slide change
  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < story.slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false); // Stop autoplay at the end
    }
  }, [currentSlideIndex, story.slides.length]);

  const goToPrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [currentSlideIndex]);

  /**
   * Execute a single interactive click action (play sound / show / hide / toggle).
   */
  const runClickAction = useCallback((action: ClickAction) => {
    if (action.type === 'playSound') {
      try {
        const audio = new Audio(action.src);
        clickAudioRef.current.push(audio);
        audio.play().catch((err) => {
          console.warn('Click sound blocked:', err);
        });
      } catch (err) {
        console.warn('Failed to play click sound:', err);
      }
      return;
    }

    if (action.type === 'show') {
      setRuntimeVisible((prev) => ({ ...prev, [action.targetId]: true }));
      return;
    }
    if (action.type === 'hide') {
      setRuntimeVisible((prev) => ({ ...prev, [action.targetId]: false }));
      return;
    }
    if (action.type === 'toggle') {
      setRuntimeVisible((prev) => {
        const currently =
          prev[action.targetId] !== undefined
            ? prev[action.targetId]
            : false;
        return { ...prev, [action.targetId]: !currently };
      });
    }
  }, []);

  /**
   * Handle a click on an element that has one or more ClickTriggers.
   */
  const handleElementClick = useCallback(
    (elementId: string) => {
      const slide = story.slides[currentSlideIndex];
      if (!slide?.clickTriggers?.length) return;

      const triggers = slide.clickTriggers.filter(
        (t) => t.targetElementId === elementId
      );
      if (triggers.length === 0) return;

      for (const trigger of triggers) {
        for (const action of trigger.actions) {
          runClickAction(action);
        }
      }
    },
    [story.slides, currentSlideIndex, runClickAction]
  );

  // Play through the current slide's animations one build-step at a time, the way
  // PowerPoint does: a click/space advances to the next animation start-time instead
  // of immediately firing everything. Returns true if it consumed the input (i.e.
  // there was another step to play), false if the slide has nothing left to animate
  // and the caller should move to the next slide instead.
  const advanceAnimationStep = useCallback((): boolean => {
    const tl = slideTimeline.current;
    const steps = stepTimesRef.current;
    if (!tl || steps.length === 0) return false;
    const t = tl.time();
    const next = steps.find((s) => s > t + 0.01);
    if (next === undefined) return false;
    tl.tweenTo(next, { duration: Math.max(next - t, 0.05) });
    return true;
  }, []);

  // Used for "move forward" inputs (space / swipe).
  // Steps through timed animations first, then advances the slide.
  // Interactive click triggers (quiz answers) never block navigation.
  const advanceOrNextSlide = useCallback(() => {
    if (!isPlaying && advanceAnimationStep()) return;
    goToNextSlide();
  }, [isPlaying, advanceAnimationStep, goToNextSlide]);

  // Bottom nav arrows always change slides immediately so quiz / interactive
  // slides can never lock the user.
  const navNextSlide = useCallback(() => {
    goToNextSlide();
  }, [goToNextSlide]);

  const navPrevSlide = useCallback(() => {
    goToPrevSlide();
  }, [goToPrevSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (story.direction === 'rtl') goToPrevSlide();
        else advanceOrNextSlide();
      } else if (e.key === 'ArrowLeft') {
        if (story.direction === 'rtl') advanceOrNextSlide();
        else goToPrevSlide();
      } else if (e.key === 'Space' || e.code === 'Space') {
        e.preventDefault();
        advanceOrNextSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advanceOrNextSlide, goToPrevSlide, isFullscreen, story.direction]);

  // Narration audio controller and player sync (only controls audio play/pause states)
  useEffect(() => {
    // 1. Pause and clean up any old slide audio
    if (playerAudioRef.current) {
      playerAudioRef.current.pause();
      playerAudioRef.current.src = '';
      playerAudioRef.current = null;
    }

    const slide = story.slides[currentSlideIndex];
    if (slide && slide.audio) {
      const audioObj = new Audio(slide.audio.src);
      playerAudioRef.current = audioObj;

      // Play the slide's narration audio as soon as the slide is shown, whether the
      // person is stepping through manually or Autoplay is on - it was previously
      // gated behind isPlaying, so it never played at all during manual navigation.
      audioObj.play().catch((err) => {
        console.warn('Playback of slide narration blocked:', err);
      });
    }

    return () => {
      if (playerAudioRef.current) {
        playerAudioRef.current.pause();
        playerAudioRef.current.src = '';
      }
    };
  }, [currentSlideIndex, story.slides]);

  // Unified autoplay transition timer (handles transition timing for both audio & non-audio slides)
  useEffect(() => {
    if (!isPlaying) {
      if (autoplayTimer.current) {
        clearTimeout(autoplayTimer.current);
        autoplayTimer.current = null;
      }
      return;
    }

    const slide = story.slides[currentSlideIndex];
    if (slide) {
      const audioDuration = slide.audio?.duration || 0;
      const customDuration = slide.duration !== undefined ? slide.duration : 4;
      
      let delaySeconds = 4;
      if (slide.audio) {
        // Default to at least 4 seconds transition, or audio duration if audio is longer
        delaySeconds = Math.max(4, audioDuration);
      } else {
        // Slides without audio use their custom duration (defaults to 4 seconds)
        delaySeconds = customDuration;
      }

      // If custom duration was explicitly set by the user, honor it if it is larger
      if (slide.duration !== undefined) {
        delaySeconds = Math.max(delaySeconds, slide.duration);
      }

      const delay = delaySeconds * 1000;

      autoplayTimer.current = setTimeout(() => {
        if (currentSlideIndex < story.slides.length - 1) {
          goToNextSlide();
        } else {
          setIsPlaying(false);
        }
      }, delay) as any;
    }

    return () => {
      if (autoplayTimer.current) {
        clearTimeout(autoplayTimer.current);
      }
    };
  }, [isPlaying, currentSlideIndex, story.slides, goToNextSlide]);

  // GSAP slide animations execution
  useEffect(() => {
    // Kill any existing slide animations
    if (slideTimeline.current) {
      slideTimeline.current.kill();
      slideTimeline.current = null;
    }
    // Stop and release any "Play Sound" effect audio left over from the previous slide.
    slideSoundEffectsRef.current.forEach((a) => {
      a.pause();
      a.src = '';
    });
    slideSoundEffectsRef.current = [];

    // Apply animations for current slide elements
    const slide = story.slides[currentSlideIndex];
    if (slide) {
      // Load Google Fonts for text elements
      slide.elements.forEach((el) => {
        if (el.type === 'text') {
          loadGoogleFont(el.fontFamily);
        }
      });

      // Find custom presets from Zustand store
      const customPresets = useStoryStore.getState().customPresets || [];

      // We wait for the DOM to paint so elements are available
      const renderTimer = setTimeout(() => {
        const tl = gsap.timeline({ paused: true });
        slideTimeline.current = tl;

        slide.elements.forEach((el) => {
          if (el.animation) {
            const domEl = document.getElementById(`player-el-${el.id}`);
            if (domEl) {
              const preset = BUILTIN_PRESETS.find((p) => p.id === el.animation?.presetId)
                || customPresets.find((p) => p.id === el.animation?.presetId);

              if (preset) {
                applyAnimation(
                  domEl,
                  preset,
                  {
                    startTime: el.animation.startTime,
                    duration: el.animation.duration,
                    delay: el.animation.delay,
                    repeat: el.animation.repeat,
                    ease: el.animation.ease,
                  },
                  tl
                );
              }
            }
          }
        });

        // Schedule any "Play Sound" animation-effect cues at their build-step time.
        // Preload so the first play() after a click isn't delayed by decoding.
        (slide.animationSounds || []).forEach((cue) => {
          if (!cue?.src) return;
          const audioObj = new Audio();
          audioObj.preload = 'auto';
          audioObj.src = cue.src;
          try {
            audioObj.load();
          } catch {
            /* ignore */
          }
          slideSoundEffectsRef.current.push(audioObj);
          tl.call(
            () => {
              try {
                audioObj.pause();
                audioObj.currentTime = 0;
                const playPromise = audioObj.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                  playPromise.catch(() => {
                    // Autoplay can be blocked before the first user gesture.
                  });
                }
              } catch {
                /* ignore */
              }
            },
            undefined,
            Math.max(0, cue.startTime || 0)
          );
        });

        // Per-element animation sounds (attached in the builder timeline)
        slide.elements.forEach((el) => {
          const src = el.animation?.soundSrc;
          if (!src) return;
          const audioObj = new Audio();
          audioObj.preload = 'auto';
          audioObj.src = src;
          try { audioObj.load(); } catch { /* ignore */ }
          slideSoundEffectsRef.current.push(audioObj);
          tl.call(
            () => {
              try {
                audioObj.pause();
                audioObj.currentTime = 0;
                const playPromise = audioObj.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                  playPromise.catch(() => {});
                }
              } catch { /* ignore */ }
            },
            undefined,
            Math.max(0, el.animation?.startTime || 0)
          );
        });

        // Record each distinct animation start-time as a build step boundary so manual
        // navigation can stop after each one instead of firing everything at once. The
        // timeline's total duration is appended as the final target - without it, the
        // very last build step had nowhere to "stop at" and got skipped entirely.
        const times = new Set<number>();
        slide.elements.forEach((el) => {
          if (el.animation) times.add(el.animation.startTime);
        });
        (slide.animationSounds || []).forEach((cue) => times.add(cue.startTime));
        const sortedTimes = Array.from(times).sort((a, b) => a - b);
        const totalDuration = tl.duration();
        if (totalDuration > (sortedTimes[sortedTimes.length - 1] ?? -1) + 0.01) {
          sortedTimes.push(totalDuration);
        }
        stepTimesRef.current = sortedTimes;

        // In autoplay mode, run straight through like a normal video. Otherwise stay
        // paused at the start (elements with animations render in their hidden
        // "from" state) until the user clicks/presses space to reveal each step.
        if (isPlaying) {
          tl.play(0);
        } else {
          tl.pause(0);
        }
      }, 50); // Small delay to guarantee elements exist in DOM

      return () => {
        clearTimeout(renderTimer);
      };
    }
  }, [currentSlideIndex, story.slides]);

  // Keep the already-built timeline's play state in sync when the user toggles the
  // play/pause button mid-slide, without rebuilding/replaying everything from scratch.
  useEffect(() => {
    const tl = slideTimeline.current;
    if (!tl) return;
    if (isPlaying) {
      tl.play();
    } else {
      tl.pause();
    }
  }, [isPlaying]);

  // Fullscreen management
  const toggleFullscreen = () => {
    if (!playerRef.current) return;

    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setTimeout(handleResize, 100);
      }).catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        setTimeout(handleResize, 100);
      });
    }
  };

  // Monitor document fullscreen events directly
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(handleResize, 150);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [handleResize]);

  // Touch/Swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const swipeThreshold = 50;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left
        if (story.direction === 'rtl') goToPrevSlide();
        else advanceOrNextSlide();
      } else {
        // Swiped right
        if (story.direction === 'rtl') advanceOrNextSlide();
        else goToPrevSlide();
      }
    }
    touchStartX.current = null;
  };

  // Background style helper
  const getBackgroundStyle = (background: Slide['background']): React.CSSProperties => {
    if (background.type === 'color') {
      return { backgroundColor: background.value };
    }
    if (background.type === 'gradient') {
      return { background: background.value };
    }
    if (background.type === 'image') {
      return {
        backgroundImage: `url(${imageSrc(background.value, `${currentSlide.id}:bg`)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {};
  };

  // Render elements in standard HTML
  const renderElement = (el: StoryElement) => {
    // Resolve effective visibility:
    // 1) runtimeVisible override (from interactive clicks) wins
    // 2) otherwise fall back to the element's static `hidden` flag
    const hasRuntime = Object.prototype.hasOwnProperty.call(runtimeVisible, el.id);
    const isVisible = hasRuntime ? runtimeVisible[el.id] : !el.hidden;
    if (!isVisible) return null;

    // Is this element a clickable hotspot?
    const isClickable =
      !!currentSlide?.clickTriggers?.some((t) => t.targetElementId === el.id);

    const style: React.CSSProperties = {
      position: 'absolute',
      left: el.x,
      top: el.y,
      width: el.width,
      height: el.type === 'text' ? 'auto' : el.height,
      transform: `rotate(${el.rotation || 0}deg)`,
      opacity: el.opacity,
      zIndex: el.zIndex,
      cursor: isClickable ? 'pointer' : undefined,
      // Prevent text selection on quiz answer boxes
      userSelect: isClickable ? 'none' : undefined,
    };

    const clickProps = isClickable
      ? {
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            handleElementClick(el.id);
            // Release focus so a subsequent Space press drives slide/step
            // navigation instead of re-triggering this button's sound.
            (e.currentTarget as HTMLElement).blur();
          },
          role: 'button' as const,
          tabIndex: 0,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleElementClick(el.id);
              (e.currentTarget as HTMLElement).blur();
            }
          },
        }
      : {};

    if (el.type === 'text') {
      const textEl = el;
      return (
        <div
          key={el.id}
          id={`player-el-${el.id}`}
          style={{
            ...style,
            fontFamily: getResolvedFontFamily(textEl.fontFamily),
            fontSize: `${textEl.fontSize}px`,
            color: textEl.color,
            fontWeight: textEl.bold ? 'bold' : 'normal',
            fontStyle: textEl.italic ? 'italic' : 'normal',
            textDecoration: textEl.underline ? 'underline' : 'none',
            textAlign: textEl.align,
            direction: textEl.dir,
            lineHeight: textEl.lineHeight || 1.25,
            whiteSpace: 'pre-wrap',
            wordBreak: 'normal',
            overflowWrap: 'break-word',
          }}
          {...clickProps}
        >
          {textEl.spans && textEl.spans.length > 0
            ? textEl.spans.map((span, i) => (
                <bdi
                  key={i}
                  dir={span.dir || detectDir(span.text) || textEl.dir}
                  style={{
                    color: span.color || undefined,
                    fontWeight: span.bold ? 'bold' : 'normal',
                    fontStyle: span.italic ? 'italic' : 'normal',
                    textDecoration: span.underline ? 'underline' : 'none',
                    fontSize: span.fontSize ? `${span.fontSize}px` : undefined,
                    unicodeBidi: 'isolate',
                  }}
                >
                  {span.text}
                </bdi>
              ))
            : (() => {
                const runs = splitBidiRuns(textEl.text);
                if (runs.length > 1) {
                  return runs.map((run, i) => (
                    <bdi key={i} dir={run.dir} style={{ unicodeBidi: 'isolate' }}>
                      {run.text}
                    </bdi>
                  ));
                }
                const singleDir = runs[0]?.dir || textEl.dir;
                return (
                  <bdi dir={singleDir} style={{ unicodeBidi: 'isolate' }}>
                    {textEl.text}
                  </bdi>
                );
              })()}
        </div>
      );
    }

    if (el.type === 'image') {
      const imgEl = el;
      return (
        <img
          key={el.id}
          id={`player-el-${el.id}`}
          src={imageSrc(imgEl.src, `${currentSlide.id}:${el.id}`)}
          alt=""
          draggable={false}
          decoding="async"
          style={{
            ...style,
            objectFit: 'fill',
          }}
          {...clickProps}
        />
      );
    }

    return null;
  };

  if (!currentSlide) {
    return <div className={styles.noSlides}>لا توجد شرائح في هذه القصة.</div>;
  }

  const isRTL = story.direction === 'rtl';

  return (
    <div
      ref={playerRef}
      className={`${styles.playerContainer} ${isFullscreen ? styles.fullscreen : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar control */}
      <div className={styles.topControlBar}>
        <div className={styles.storyTitle}>{story.title}</div>
        <div className={styles.actions}>
          <button className={styles.controlButton} onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button className={styles.controlButton} onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          {onClose && (
            <button className={`${styles.controlButton} ${styles.closeButton}`} onClick={onClose}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className={styles.stageViewport}>
        <div
          className={styles.slideStage}
          style={{
            width: baseWidth,
            height: baseHeight,
            transform: `scale(${scale})`,
            ...getBackgroundStyle(currentSlide.background),
          }}
        >
          {currentSlide.elements
            .sort((a, b) => a.zIndex - b.zIndex)
            .map(renderElement)}
        </div>
      </div>

      {/* Bottom control bar */}
      <div className={styles.bottomControlBar}>
        <button
          className={styles.navButton}
          onClick={isRTL ? navNextSlide : navPrevSlide}
          disabled={isRTL ? currentSlideIndex === story.slides.length - 1 : currentSlideIndex === 0}
        >
          <ChevronLeft size={24} />
        </button>

        <span className={styles.slideCounter}>
          {currentSlideIndex + 1} / {story.slides.length}
        </span>

        <button
          className={styles.navButton}
          onClick={isRTL ? navPrevSlide : navNextSlide}
          disabled={isRTL ? currentSlideIndex === 0 : currentSlideIndex === story.slides.length - 1}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBarBg}>
        <div
          className={styles.progressBarFill}
          style={{
            width: `${((currentSlideIndex + 1) / story.slides.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};
