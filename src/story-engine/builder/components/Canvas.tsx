import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Text as KonvaText, Image as KonvaImage, Transformer } from 'react-konva';
import { useStoryStore } from '../../store/useStoryStore';
import type { TextElement, ImageElement } from '../../core/types';
import { STAGE_FORMATS } from '../../core/types';
import styles from '../StoryBuilder.module.css';
import { Minus, Plus, Maximize2 } from 'lucide-react';
import { applyAnimation, BUILTIN_PRESETS } from '../../utils/animationEngine';
import { loadGoogleFont } from '../../utils/fontLoader';

// Helper component to render images in Konva
const CanvasImage: React.FC<{
  el: ImageElement;
  onSelect: () => void;
  onChange: (updates: Partial<ImageElement>) => void;
}> = ({ el, onSelect, onChange }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = el.src;
    img.crossOrigin = 'anonymous'; // prevent canvas tainting where possible
    img.onload = () => {
      setImage(img);
      setError(false);
    };
    img.onerror = () => {
      setError(true);
    };
  }, [el.src]);

  if (error) {
    // Fallback if image fails to load
    return (
      <KonvaText
        id={el.id}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        text="⚠️ فشل تحميل الصورة"
        fontSize={16}
        fill="#ff0000"
        align="center"
        verticalAlign="middle"
        draggable={!el.locked}
        onClick={onSelect}
        onTouchStart={onSelect}
      />
    );
  }

  if (!image) {
    return (
      <KonvaText
        id={el.id}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        text="جاري التحميل..."
        fontSize={14}
        fill="#888"
        align="center"
        verticalAlign="middle"
      />
    );
  }

  return (
    <KonvaImage
      id={el.id}
      image={image}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation}
      opacity={el.opacity}
      draggable={!el.locked}
      onClick={onSelect}
      onTouchStart={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(10, node.width() * scaleX),
          height: Math.max(10, node.height() * scaleY),
          rotation: node.rotation(),
        });
      }}
    />
  );
};

// Helper component to render texts in Konva
const CanvasText: React.FC<{
  el: TextElement;
  onSelect: () => void;
  onChange: (updates: Partial<TextElement>) => void;
}> = ({ el, onSelect, onChange }) => {
  const styleParts: string[] = [];
  if (el.bold) styleParts.push('bold');
  if (el.italic) styleParts.push('italic');
  const fontStyle = styleParts.join(' ') || 'normal';

  return (
    <KonvaText
      id={el.id}
      x={el.x}
      y={el.y}
      width={el.width}
      height={undefined}
      text={el.text}
      fontSize={el.fontSize}
      fontFamily={el.fontFamily}
      fill={el.color}
      fontStyle={fontStyle}
      align={el.align}
      textDecoration={el.underline ? 'underline' : 'none'}
      rotation={el.rotation}
      opacity={el.opacity}
      lineHeight={el.lineHeight || 1.25}
      wrap="word"
      draggable={!el.locked}
      onClick={onSelect}
      onTouchStart={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * scaleX),
          height: Math.max(10, node.height() * scaleY),
          rotation: node.rotation(),
        });
      }}
    />
  );
};

export const Canvas: React.FC = () => {
  const {
    story,
    activeSlideId,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    deleteElement,
    zoom,
    zoomMode,
    setZoom,
    setZoomMode,
    setStageFormat,
  } = useStoryStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [fitScale, setFitScale] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);

  const format = STAGE_FORMATS.find((f) => f.id === (story?.stageFormat || '16:9')) || STAGE_FORMATS[0];
  const baseWidth = format.width;
  const baseHeight = format.height;
  const scale = zoomMode === 'manual' ? zoom : fitScale;

  const currentSlide = story?.slides.find((s) => s.id === activeSlideId);

  // Unclipped auto-fit via ResizeObserver + safe padding
  const resizeCanvas = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    // Side chrome ~156px; keep modest vertical padding so stage is larger
    const sideChrome = 156;
    const padY = Math.max(12, Math.min(containerHeight * 0.04, 28));
    const padX = Math.max(12, sideChrome);
    const availableWidth = Math.max(120, containerWidth - padX - 12);
    const availableHeight = Math.max(120, containerHeight - padY * 2);
    const scaleW = availableWidth / baseWidth;
    const scaleH = availableHeight / baseHeight;
    const newScale = Math.min(scaleW, scaleH);
    setFitScale(Math.max(0.1, Math.min(newScale, 2)));
  }, [baseWidth, baseHeight]);

  useEffect(() => {
    resizeCanvas();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(el);
    return () => ro.disconnect();
  }, [resizeCanvas, activeSlideId, story?.stageFormat]);

  // Handle animation preview triggers inside the editor canvas
  useEffect(() => {
    const handlePreview = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { elementId } = customEvent.detail || {};
      if (!elementId || !stageRef.current) return;

      const node = stageRef.current.findOne('#' + elementId);
      const el = currentSlide?.elements.find((item) => item.id === elementId);

      if (node && el && el.animation) {
        // Find custom preset or built-in preset
        const customPresets = useStoryStore.getState().customPresets || [];
        const preset = BUILTIN_PRESETS.find((p) => p.id === el.animation?.presetId)
          || customPresets.find((p) => p.id === el.animation?.presetId);

        if (preset) {
          applyAnimation(node, preset, {
            startTime: 0, // play immediately
            duration: el.animation.duration,
            delay: 0,
            repeat: 0, // preview once (no infinite loop in editor)
            ease: el.animation.ease,
          });
        }
      }
    };

    window.addEventListener('preview-element-animation', handlePreview);
    return () => {
      window.removeEventListener('preview-element-animation', handlePreview);
    };
  }, [currentSlide]);

  // Handle stage selection / click on empty area
  const handleStageMouseDown = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background-rect';
    if (clickedOnEmpty) {
      setSelectedElementId(null);
    }
  };

  // Sync Transformer nodes when selection changes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    if (selectedElementId) {
      // Find node on stage
      const node = stageRef.current.findOne('#' + selectedElementId);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedElementId, activeSlideId, currentSlide?.elements]);

  // Global keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();
      const code = e.code;
      if (e.ctrlKey && (code === 'KeyZ' || key === 'z' || key === 'ئ')) {
        e.preventDefault();
        useStoryStore.temporal.getState().undo();
      } else if (e.ctrlKey && (code === 'KeyY' || key === 'y' || key === 'إ')) {
        e.preventDefault();
        useStoryStore.temporal.getState().redo();
      } else if (key === 'delete' || key === 'backspace' || code === 'Delete' || code === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          deleteElement(selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedElementId, deleteElement]);

  // Compute a stable key representing the text font families present on this slide
  const textFontKeys = currentSlide?.elements
    .filter((el) => el.type === 'text')
    .map((el) => `${el.id}-${(el as TextElement).fontFamily}`)
    .join(',');

  // Load Google Fonts for active slide text elements and redraw Konva stage when ready
  useEffect(() => {
    if (!currentSlide) return;

    // Scan slide text elements
    currentSlide.elements.forEach((el) => {
      if (el.type === 'text') {
        loadGoogleFont(el.fontFamily);
      }
    });

    // Request stage redraw once fonts finish loading in browser
    if (document.fonts) {
      document.fonts.ready.then(() => {
        stageRef.current?.batchDraw();
      });
    }
  }, [currentSlide?.id, textFontKeys]);

  if (!story || !currentSlide) {
    return <div className={styles.canvasArea}>برجاء تحديد شريحة للبدء في التعديل.</div>;
  }

  // Generate CSS style for active slide background
  const getBackgroundStyle = (bg: any): React.CSSProperties => {
    if (bg.type === 'color') return { backgroundColor: bg.value };
    if (bg.type === 'gradient') return { background: bg.value };
    if (bg.type === 'image') {
      return {
        backgroundImage: `url(${bg.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return { backgroundColor: '#ffffff' };
  };

  const isRTL = story.direction === 'rtl';

  return (
    <main ref={containerRef} className={styles.canvasArea} onKeyDown={(e) => {
      // Delete element on Backspace/Delete keys
      if (selectedElementId && (e.key === 'Backspace' || e.key === 'Delete')) {
        // Prevent deleting if user is typing in input/textarea (handled by focused elements check)
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          useStoryStore.getState().deleteElement(selectedElementId);
        }
      }
    }} tabIndex={0}>
      {/* Aspect ratio + zoom chrome */}
      <div className={`${styles.canvasChrome} ${styles.canvasChromeTop}`}>
        <select
          className={styles.chromeSelect}
          value={story?.stageFormat || '16:9'}
          onChange={(e) => setStageFormat(e.target.value as any)}
          title="Aspect ratio"
        >
          {STAGE_FORMATS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label} ({f.width}×{f.height})
            </option>
          ))}
        </select>
      </div>

      <div className={`${styles.canvasChrome} ${styles.canvasChromeBottom}`}>
        <button
          type="button"
          className={styles.chromeBtn}
          onClick={() => {
            setZoomMode('auto');
            resizeCanvas();
          }}
          title="Auto-fit"
        >
          <Maximize2 size={14} /> Auto
        </button>
        <button
          type="button"
          className={styles.chromeBtn}
          onClick={() => setZoom(Math.max(0.25, Math.round((scale - 0.1) * 100) / 100))}
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          className={styles.chromeBtn}
          onClick={() => setZoomOpen((v) => !v)}
        >
          <span className={styles.chromeBadge}>{Math.round(scale * 100)}%</span>
        </button>
        <button
          type="button"
          className={styles.chromeBtn}
          onClick={() => setZoom(Math.min(2, Math.round((scale + 0.1) * 100) / 100))}
        >
          <Plus size={14} />
        </button>
        {zoomOpen && (
          <div className={styles.zoomPopover}>
            <div className={styles.zoomPresets}>
              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((z) => (
                <button key={z} type="button" onClick={() => { setZoom(z); setZoomOpen(false); }}>
                  {Math.round(z * 100)}%
                </button>
              ))}
            </div>
            <input
              type="range"
              min={25}
              max={200}
              step={5}
              value={Math.round(scale * 100)}
              onChange={(e) => setZoom(parseInt(e.target.value, 10) / 100)}
            />
            <button
              type="button"
              className={`${styles.chromeBtn} ${styles.chromeBtnPrimary}`}
              onClick={() => { setZoomMode('auto'); setZoomOpen(false); }}
            >
              Auto-fit
            </button>
          </div>
        )}
      </div>

      <div
        className={`${styles.canvasStageWrapper} ${!selectedElementId ? styles.canvasStageWrapperSelected : ''}`}
        style={{
          width: baseWidth * scale,
          height: baseHeight * scale,
          ...getBackgroundStyle(currentSlide.background),
        }}
      >
        <Stage
          ref={stageRef}
          width={baseWidth}
          height={baseHeight}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleStageMouseDown}
          onTouchStart={handleStageMouseDown}
        >
          <Layer>
            {/* Elements Layer */}
            {currentSlide.elements
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((el) => {
                if (el.type === 'text') {
                  return (
                    <CanvasText
                      key={el.id}
                      el={el as TextElement}
                      onSelect={() => setSelectedElementId(el.id)}
                      onChange={(updates) => updateElement(el.id, updates)}
                    />
                  );
                }
                if (el.type === 'image') {
                  return (
                    <CanvasImage
                      key={el.id}
                      el={el as ImageElement}
                      onSelect={() => setSelectedElementId(el.id)}
                      onChange={(updates) => updateElement(el.id, updates)}
                    />
                  );
                }
                return null;
              })}

            {/* Selection Bounding Box Transformer */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Minimum size constraints
                if (newBox.width < 20 || newBox.height < 10) {
                  return oldBox;
                }
                return newBox;
              }}
              enabledAnchors={[
                'top-left', 'top-center', 'top-right',
                'middle-right', 'middle-left',
                'bottom-left', 'bottom-center', 'bottom-right'
              ]}
              rotateEnabled={true}
              anchorSize={8}
              anchorCornerRadius={4}
              anchorStroke="#4facfe"
              anchorFill="#ffffff"
              borderStroke="#4facfe"
              borderDash={[3, 3]}
            />
          </Layer>
        </Stage>
      </div>

      <div className={styles.dragTip}>
        {isRTL 
          ? 'اسحب لتغيير الموضع. استخدم المقابض للتكبير والتصغير والتدوير. زر Backspace للحذف.' 
          : 'Drag to position. Use handles to scale & rotate. Backspace to delete.'}
      </div>
    </main>
  );
};
