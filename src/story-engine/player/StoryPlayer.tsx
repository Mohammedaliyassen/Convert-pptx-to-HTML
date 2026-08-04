"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Story, Slide, StoryElement } from '../core/types';
import styles from './StoryPlayer.module.css';
import { Play, Pause, ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from 'lucide-react';
import { useStoryStore } from '../store/useStoryStore';
import { applyAnimation, BUILTIN_PRESETS } from '../utils/animationEngine';
import gsap from 'gsap';
import { loadGoogleFont } from '../utils/fontLoader';

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

  const playerRef = useRef<HTMLDivElement>(null);
  const autoplayTimer = useRef<any>(null);
  const playerAudioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const slideTimeline = useRef<gsap.core.Timeline | null>(null);

  const baseWidth = 1200;
  const baseHeight = 675;

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
    };
  }, [handleResize]);

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (story.direction === 'rtl') goToPrevSlide();
        else goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        if (story.direction === 'rtl') goToNextSlide();
        else goToPrevSlide();
      } else if (e.key === 'Space' || e.code === 'Space') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide, isFullscreen, story.direction]);

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

      // Play slide narration audio if autoplay is active
      if (isPlaying) {
        audioObj.play().catch((err) => {
          console.warn('Playback of slide narration blocked:', err);
        });
      }
    }

    return () => {
      if (playerAudioRef.current) {
        playerAudioRef.current.pause();
        playerAudioRef.current.src = '';
      }
    };
  }, [currentSlideIndex, story.slides, isPlaying]);

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
        const tl = gsap.timeline();
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
      }, 50); // Small delay to guarantee elements exist in DOM

      return () => {
        clearTimeout(renderTimer);
      };
    }
  }, [currentSlideIndex, story.slides]);

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
        else goToNextSlide();
      } else {
        // Swiped right
        if (story.direction === 'rtl') goToNextSlide();
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
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {};
  };

  // Render elements in standard HTML
  const renderElement = (el: StoryElement) => {
    if (el.hidden) return null;

    const style: React.CSSProperties = {
      position: 'absolute',
      left: el.x,
      top: el.y,
      width: el.width,
      height: el.type === 'text' ? 'auto' : el.height,
      transform: `rotate(${el.rotation || 0}deg)`,
      opacity: el.opacity,
      zIndex: el.zIndex,
    };

    if (el.type === 'text') {
      const textEl = el;
      return (
        <div
          key={el.id}
          id={`player-el-${el.id}`}
          style={{
            ...style,
            fontFamily: textEl.fontFamily,
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
        >
          {textEl.text}
        </div>
      );
    }

    if (el.type === 'image') {
      const imgEl = el;
      return (
        <img
          key={el.id}
          id={`player-el-${el.id}`}
          src={imgEl.src}
          alt=""
          style={{
            ...style,
            objectFit: 'fill',
          }}
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
          onClick={isRTL ? goToNextSlide : goToPrevSlide}
          disabled={isRTL ? currentSlideIndex === story.slides.length - 1 : currentSlideIndex === 0}
        >
          <ChevronLeft size={24} />
        </button>

        <span className={styles.slideCounter}>
          {currentSlideIndex + 1} / {story.slides.length}
        </span>

        <button
          className={styles.navButton}
          onClick={isRTL ? goToPrevSlide : goToNextSlide}
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
